using Microsoft.AspNetCore.SignalR;
using Models.Chat;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Threading;
using RestaurantManagementSystem.Hubs;


namespace RestaurantManagementSystem.Services
{
    public interface IChatService
    {
        Task<Conversation> GetOrCreateConversation(string vendorId, string userId);
        Task<List<Conversation>> GetUserConversations(string userId);
        Task<List<Conversation>> GetVendorConversations(string vendorId);
        Task<List<ChatMessage>> GetConversationMessages(int conversationId, string userId);
        Task<ChatMessage> SendMessage(string senderId, string receiverId, string content);
        Task MarkMessagesAsRead(int conversationId, string userId);
    }

    public class ChatService : IChatService
    {
        private readonly IHubContext<ChatHub> _hubContext;
        private static readonly List<Conversation> _conversations = new List<Conversation>();
        private static readonly List<ChatMessage> _messages = new List<ChatMessage>();
        private static readonly SemaphoreSlim _messageLock = new SemaphoreSlim(1, 1);
        private static readonly SemaphoreSlim _conversationLock = new SemaphoreSlim(1, 1);

        public ChatService(IHubContext<ChatHub> hubContext)
        {
            _hubContext = hubContext ?? throw new ArgumentNullException(nameof(hubContext));
        }

        public async Task<Conversation> GetOrCreateConversation(string vendorId, string userId)
        {
            if (string.IsNullOrEmpty(vendorId))
                throw new ArgumentException("Vendor ID cannot be empty", nameof(vendorId));
            if (string.IsNullOrEmpty(userId))
                throw new ArgumentException("User ID cannot be empty", nameof(userId));

            await _conversationLock.WaitAsync();
            try
            {
                var conversation = _conversations.FirstOrDefault(c => 
                    c.VendorId == vendorId && c.UserId == userId);

                if (conversation == null)
                {
                    conversation = new Conversation
                    {
                        Id = _conversations.Count + 1,
                        VendorId = vendorId,
                        UserId = userId,
                        CreatedAt = DateTime.UtcNow,
                        LastMessageAt = DateTime.UtcNow
                    };
                    _conversations.Add(conversation);
                }

                return conversation;
            }
            finally
            {
                _conversationLock.Release();
            }
        }

        public async Task<List<Conversation>> GetUserConversations(string userId)
        {
            if (string.IsNullOrEmpty(userId))
                throw new ArgumentException("User ID cannot be empty", nameof(userId));

            await _conversationLock.WaitAsync();
            try
            {
                return _conversations
                    .Where(c => c.UserId == userId)
                    .OrderByDescending(c => c.LastMessageAt)
                    .ToList();
            }
            finally
            {
                _conversationLock.Release();
            }
        }

        public async Task<List<Conversation>> GetVendorConversations(string vendorId)
        {
            if (string.IsNullOrEmpty(vendorId))
                throw new ArgumentException("Vendor ID cannot be empty", nameof(vendorId));

            await _conversationLock.WaitAsync();
            try
            {
                return _conversations
                    .Where(c => c.VendorId == vendorId)
                    .OrderByDescending(c => c.LastMessageAt)
                    .ToList();
            }
            finally
            {
                _conversationLock.Release();
            }
        }

        public async Task<List<ChatMessage>> GetConversationMessages(int conversationId, string userId)
        {
            if (conversationId <= 0)
                throw new ArgumentException("Invalid conversation ID", nameof(conversationId));
            if (string.IsNullOrEmpty(userId))
                throw new ArgumentException("User ID cannot be empty", nameof(userId));

            Conversation conversation;
            await _conversationLock.WaitAsync();
            try
            {
                conversation = _conversations.FirstOrDefault(c => c.Id == conversationId);
                if (conversation == null)
                    throw new InvalidOperationException("Conversation not found");

                if (conversation.UserId != userId && conversation.VendorId != userId)
                    throw new UnauthorizedAccessException("User is not authorized to access this conversation");
            }
            finally
            {
                _conversationLock.Release();
            }

            await _messageLock.WaitAsync();
            try
            {
                return _messages
                    .Where(m => m.ConversationId == conversationId)
                    .OrderBy(m => m.SentAt)
                    .ToList();
            }
            finally
            {
                _messageLock.Release();
            }
        }

        public async Task<ChatMessage> SendMessage(string senderId, string receiverId, string content)
        {
            if (string.IsNullOrEmpty(senderId))
                throw new ArgumentException("Sender ID cannot be empty", nameof(senderId));
            if (string.IsNullOrEmpty(receiverId))
                throw new ArgumentException("Receiver ID cannot be empty", nameof(receiverId));
            if (string.IsNullOrEmpty(content))
                throw new ArgumentException("Message content cannot be empty", nameof(content));

            var conversation = await GetOrCreateConversation(senderId, receiverId);
            ChatMessage message;

            await _messageLock.WaitAsync();
            try
            {
                message = new ChatMessage
                {
                    Id = _messages.Count + 1,
                    ConversationId = conversation.Id,
                    SenderId = senderId,
                    ReceiverId = receiverId,
                    Content = content,
                    SentAt = DateTime.UtcNow,
                    IsRead = false
                };

                _messages.Add(message);
                conversation.LastMessageAt = DateTime.UtcNow;

                try
                {
                    await _hubContext.Clients
                        .User(receiverId)
                        .SendAsync("ReceiveMessage", message);
                }
                catch (Exception ex)
                {
                    // Log the error but don't throw - we still want to save the message
                    Console.WriteLine($"Error sending SignalR notification: {ex.Message}");
                }

                return message;
            }
            finally
            {
                _messageLock.Release();
            }
        }

        public async Task MarkMessagesAsRead(int conversationId, string userId)
        {
            if (conversationId <= 0)
                throw new ArgumentException("Invalid conversation ID", nameof(conversationId));
            if (string.IsNullOrEmpty(userId))
                throw new ArgumentException("User ID cannot be empty", nameof(userId));

            Conversation conversation;
            await _conversationLock.WaitAsync();
            try
            {
                conversation = _conversations.FirstOrDefault(c => c.Id == conversationId);
                if (conversation == null)
                    throw new InvalidOperationException("Conversation not found");

                if (conversation.UserId != userId && conversation.VendorId != userId)
                    throw new UnauthorizedAccessException("User is not authorized to access this conversation");
            }
            finally
            {
                _conversationLock.Release();
            }

            await _messageLock.WaitAsync();
            try
            {
                var unreadMessages = _messages
                    .Where(m => m.ConversationId == conversationId && 
                               m.ReceiverId == userId && 
                               !m.IsRead)
                    .ToList();

                foreach (var message in unreadMessages)
                {
                    message.IsRead = true;
                }

                try
                {
                    await _hubContext.Clients
                        .User(conversation.UserId == userId ? conversation.VendorId : conversation.UserId)
                        .SendAsync("MessagesRead", conversationId);
                }
                catch (Exception ex)
                {
                    // Log the error but don't throw - we still want to mark messages as read
                    Console.WriteLine($"Error sending SignalR notification: {ex.Message}");
                }
            }
            finally
            {
                _messageLock.Release();
            }
        }
    }
}

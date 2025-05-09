using Microsoft.AspNetCore.SignalR;
using Models.Chat;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Utility.Chat;

namespace RestaurantManagementSystem.Services
{
    public interface IChatService
    {
        Task<Conversation> GetOrCreateConversation(string vendorId, string userId);
        Task<List<Conversation>> GetUserConversations(string userId);
        Task<List<Conversation>> GetVendorConversations(string vendorId);
        Task<List<ChatMessage>> GetConversationMessages(string conversationId, string userId);
        Task<ChatMessage> SendMessage(string senderId, string receiverId, string content);
        Task MarkMessagesAsRead(string conversationId, string userId);
    }

    public class ChatService : IChatService
    {
        private readonly IHubContext<ChatHub> _hubContext;

        private static List<Conversation> _conversations = new List<Conversation>();
        private static List<ChatMessage> _messages = new List<ChatMessage>();

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

            // Try to find existing conversation
            var conversation = _conversations.FirstOrDefault(c => c.VendorId == vendorId && c.UserId == userId);

            // If no conversation, create a new one
            if (conversation == null)
            {
                conversation = new Conversation
                {
                    Id = Guid.NewGuid().ToString(),
                    VendorId = vendorId,
                    UserId = userId,
                    CreatedAt = DateTime.UtcNow,
                    LastMessageAt = DateTime.UtcNow
                };

                _conversations.Add(conversation);
            }

            return conversation;
        }

        public async Task<List<Conversation>> GetUserConversations(string userId)
        {
            if (string.IsNullOrEmpty(userId))
                throw new ArgumentException("User ID cannot be empty", nameof(userId));

            return _conversations
                .Where(c => c.UserId == userId)
                .OrderByDescending(c => c.LastMessageAt)
                .ToList();
        }

        public async Task<List<Conversation>> GetVendorConversations(string vendorId)
        {
            if (string.IsNullOrEmpty(vendorId))
                throw new ArgumentException("Vendor ID cannot be empty", nameof(vendorId));

            return _conversations
                .Where(c => c.VendorId == vendorId)
                .OrderByDescending(c => c.LastMessageAt)
                .ToList();
        }

        public async Task<List<ChatMessage>> GetConversationMessages(string conversationId, string userId)
        {
            if (string.IsNullOrEmpty(conversationId))
                throw new ArgumentException("Invalid conversation ID", nameof(conversationId));
            if (string.IsNullOrEmpty(userId))
                throw new ArgumentException("User ID cannot be empty", nameof(userId));

            var conversation = _conversations.FirstOrDefault(c => c.Id == conversationId);

            if (conversation == null)
                throw new InvalidOperationException("Conversation not found");

            if (conversation.UserId != userId && conversation.VendorId != userId)
                throw new UnauthorizedAccessException("User is not authorized to access this conversation");

            return _messages
                .Where(m => m.ConversationId == conversationId)
                .OrderBy(m => m.SentAt)
                .ToList();
        }

        public async Task<ChatMessage> SendMessage(string senderId, string receiverId, string content)
        {
            if (string.IsNullOrEmpty(senderId))
                throw new ArgumentException("Sender ID cannot be empty", nameof(senderId));
            if (string.IsNullOrEmpty(receiverId))
                throw new ArgumentException("Receiver ID cannot be empty", nameof(receiverId));
            if (string.IsNullOrEmpty(content))
                throw new ArgumentException("Message content cannot be empty", nameof(content));

            var conversation = _conversations.FirstOrDefault(c =>
                (c.UserId == senderId && c.VendorId == receiverId) ||
                (c.UserId == receiverId && c.VendorId == senderId));

            // If no conversation, create one
            if (conversation == null)
            {
                conversation = new Conversation
                {
                    Id = Guid.NewGuid().ToString(),
                    VendorId = receiverId,
                    UserId = senderId,
                    CreatedAt = DateTime.UtcNow,
                    LastMessageAt = DateTime.UtcNow
                };

                _conversations.Add(conversation);
            }

            var message = new ChatMessage
            {
                Id = Guid.NewGuid().ToString(),
                ConversationId = conversation.Id,
                SenderId = senderId,
                ReceiverId = receiverId,
                Content = content,
                SentAt = DateTime.UtcNow,
                IsRead = false
            };

            _messages.Add(message);
            conversation.LastMessageAt = DateTime.UtcNow;

            // Notify receiver via SignalR
            try
            {
                await _hubContext.Clients.User(receiverId)
                    .SendAsync("ReceiveMessage", conversation.Id, senderId, content);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error sending SignalR notification: {ex.Message}");
            }

            return message;
        }

        public async Task MarkMessagesAsRead(string conversationId, string userId)
        {
            if (string.IsNullOrEmpty(conversationId))
                throw new ArgumentException("Invalid conversation ID", nameof(conversationId));
            if (string.IsNullOrEmpty(userId))
                throw new ArgumentException("User ID cannot be empty", nameof(userId));

            var conversation = _conversations.FirstOrDefault(c => c.Id == conversationId);

            if (conversation == null)
                throw new InvalidOperationException("Conversation not found");

            if (conversation.UserId != userId && conversation.VendorId != userId)
                throw new UnauthorizedAccessException("User is not authorized to access this conversation");

            var unreadMessages = _messages
                .Where(m => m.ConversationId == conversationId && m.ReceiverId == userId && !m.IsRead)
                .ToList();

            if (!unreadMessages.Any())
                return;

            foreach (var message in unreadMessages)
            {
                message.IsRead = true;
            }

            // Notify sender about read receipt
            var senderId = unreadMessages.FirstOrDefault()?.SenderId;
            if (!string.IsNullOrEmpty(senderId))
            {
                try
                {
                    await _hubContext.Clients.User(senderId)
                        .SendAsync("MessageRead", conversationId);
                }
                catch (Exception ex)
                {
                    // Log the error but don't fail the operation
                    Console.WriteLine($"Error sending read notification: {ex.Message}");
                }
            }
        }
    }
}

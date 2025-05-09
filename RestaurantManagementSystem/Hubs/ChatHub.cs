using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using Models.Chat;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Threading;
using System.Linq;

namespace RestaurantManagementSystem.Hubs
{
    public class ChatHub : Hub
    {
        private static readonly List<ChatMessage> _messages = new List<ChatMessage>();
        private static readonly List<Conversation> _conversations = new List<Conversation>();
        private static readonly SemaphoreSlim _messageLock = new SemaphoreSlim(1, 1);
        private static readonly SemaphoreSlim _conversationLock = new SemaphoreSlim(1, 1);
        private readonly ILogger<ChatHub> _logger;

        public ChatHub(ILogger<ChatHub> logger)
        {
            this._logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public override async Task OnConnectedAsync()
        {
            try
            {
                var userId = Context.UserIdentifier;
                if (!string.IsNullOrEmpty(userId))
                {
                    await Groups.AddToGroupAsync(Context.ConnectionId, userId);
                    _logger.LogInformation($"User {userId} connected to chat hub");
                }
                await base.OnConnectedAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in OnConnectedAsync");
                throw;
            }
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            try
            {
                var userId = Context.UserIdentifier;
                if (!string.IsNullOrEmpty(userId))
                {
                    await Groups.RemoveFromGroupAsync(Context.ConnectionId, userId);
                    _logger.LogInformation($"User {userId} disconnected from chat hub");
                }
                await base.OnDisconnectedAsync(exception);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in OnDisconnectedAsync");
                throw;
            }
        }

        public async Task<Conversation> GetOrCreateConversation(string vendorId, string userId)
        {
            try
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
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetOrCreateConversation");
                throw;
            }
        }

        public async Task SendMessage(string senderId, string receiverId, string message)
        {
            try
            {
                if (string.IsNullOrEmpty(senderId))
                    throw new ArgumentException("Sender ID cannot be empty", nameof(senderId));
                if (string.IsNullOrEmpty(receiverId))
                    throw new ArgumentException("Receiver ID cannot be empty", nameof(receiverId));
                if (string.IsNullOrEmpty(message))
                    throw new ArgumentException("Message content cannot be empty", nameof(message));

                var conversation = await GetOrCreateConversation(senderId, receiverId);
                ChatMessage chatMessage;

                await _messageLock.WaitAsync();
                try
                {
                    chatMessage = new ChatMessage
                    {
                        Id = _messages.Count + 1,
                        ConversationId = conversation.Id,
                        SenderId = senderId,
                        ReceiverId = receiverId,
                        Content = message,
                        SentAt = DateTime.UtcNow,
                        IsRead = false
                    };

                    _messages.Add(chatMessage);
                    conversation.LastMessageAt = DateTime.UtcNow;
                }
                finally
                {
                    _messageLock.Release();
                }

                await Clients.User(receiverId).SendAsync("ReceiveMessage", chatMessage);
                await Clients.Caller.SendAsync("MessageSent", chatMessage);

                _logger.LogInformation($"Message sent from {senderId} to {receiverId}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending message");
                throw;
            }
        }

        public async Task MarkAsRead(int messageId)
        {
            try
            {
                if (messageId <= 0)
                    throw new ArgumentException("Invalid message ID", nameof(messageId));

                ChatMessage message;
                await _messageLock.WaitAsync();
                try
                {
                    message = _messages.Find(m => m.Id == messageId);
                    if (message == null)
                        throw new InvalidOperationException("Message not found");

                    message.IsRead = true;
                }
                finally
                {
                    _messageLock.Release();
                }

                await Clients.User(message.SenderId).SendAsync("MessageRead", messageId);
                _logger.LogInformation($"Message {messageId} marked as read");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking message as read");
                throw;
            }
        }

        public async Task<List<ChatMessage>> GetUnreadMessages(string userId)
        {
            try
            {
                if (string.IsNullOrEmpty(userId))
                    throw new ArgumentException("User ID cannot be empty", nameof(userId));

                List<ChatMessage> unreadMessages;
                await _messageLock.WaitAsync();
                try
                {
                    unreadMessages = _messages.FindAll(m => m.ReceiverId == userId && !m.IsRead);
                }
                finally
                {
                    _messageLock.Release();
                }

                await Clients.Caller.SendAsync("UnreadMessages", unreadMessages);
                _logger.LogInformation($"Retrieved unread messages for user {userId}");
                return unreadMessages;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting unread messages");
                throw;
            }
        }

        public async Task<List<Conversation>> GetUserConversations(string userId)
        {
            try
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
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user conversations");
                throw;
            }
        }
    }
}
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using Models.Chat;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using infrastructures.Repository.IRepository;

namespace RestaurantManagementSystem.Hubs
{
    public class ChatHub : Hub
    {
        private readonly ILogger<ChatHub> _logger;
        private readonly IConversation _conversationRepo;
        private readonly IChatMessages _chatRepo;

        public ChatHub(IChatMessages chatRepo, ILogger<ChatHub> logger, IConversation conversationRepo)
        {
            _chatRepo = chatRepo;
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _conversationRepo = conversationRepo;
        }

        public override async Task OnConnectedAsync()
        {
            var userId = Context.UserIdentifier;
            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, userId);
                _logger.LogInformation($"User {userId} connected to chat hub");
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var userId = Context.UserIdentifier;
            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, userId);
                _logger.LogInformation($"User {userId} disconnected from chat hub");
            }

            await base.OnDisconnectedAsync(exception);
        }

        public async Task<Conversation> GetOrCreateConversation(string vendorId, string userId)
        {
            if (string.IsNullOrEmpty(vendorId) || string.IsNullOrEmpty(userId))
                throw new ArgumentException("VendorId and UserId must be provided.");

            var conversation = await _conversationRepo.GetConversationAsync(vendorId, userId);
            if (conversation == null)
            {
                conversation = new Conversation
                {
                    VendorId = vendorId,
                    UserId = userId,
                    CreatedAt = DateTime.UtcNow,
                    LastMessageAt = DateTime.UtcNow
                };

                await _conversationRepo.CreateAsync(conversation);
                await _conversationRepo.CommitAsync();
            }

            return conversation;
        }

        public async Task SendMessage(string senderId, string receiverId, string message)
        {
            if (string.IsNullOrEmpty(senderId) || string.IsNullOrEmpty(receiverId) || string.IsNullOrEmpty(message))
                throw new ArgumentException("Sender, receiver, and message must be provided.");

            var conversation = await GetOrCreateConversation(senderId, receiverId);

            var chatMessage = new ChatMessage
            {
                SenderId = senderId,
                ReceiverId = receiverId,
                Content = message,
                SentAt = DateTime.UtcNow,
                IsRead = false,
                ConversationId = conversation.Id
            };

            await _chatRepo.CreateAsync(chatMessage);
            await _chatRepo.CommitAsync();

            await Clients.User(receiverId).SendAsync("ReceiveMessage", chatMessage);
            await Clients.Caller.SendAsync("MessageSent", chatMessage);

            _logger.LogInformation($"Message sent from {senderId} to {receiverId}");
        }

        

        public async Task<List<Conversation>> GetUserConversations(string userId)
        {
            if (string.IsNullOrEmpty(userId))
                throw new ArgumentException("User ID cannot be empty", nameof(userId));

            var conversations = await _conversationRepo.GetUserConversationsAsync(userId);
            return conversations
                .OrderByDescending(c => c.LastMessageAt)
                .ToList();
        }
    }
}

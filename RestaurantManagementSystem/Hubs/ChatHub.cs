using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Models.Chat;
using System;
using System.Threading.Tasks;

namespace RestaurantManagementSystem.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        public async Task SendMessage(string conversationId, string senderId, string receiverId, string message)
        {
            // Send to specific user
            await Clients.User(receiverId).SendAsync("ReceiveMessage", conversationId, senderId, message);
        }

        public async Task MarkAsRead(string conversationId, string userId)
        {
            // Notify the sender that their message was read
            await Clients.User(userId).SendAsync("MessageRead", conversationId);
        }

        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.FindFirst("sub")?.Value;
            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId}");
            }
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var userId = Context.User?.FindFirst("sub")?.Value;
            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user_{userId}");
            }
            await base.OnDisconnectedAsync(exception);
        }

        public async Task JoinConversation(string conversationId)
        {
            if (string.IsNullOrEmpty(conversationId))
            {
                throw new ArgumentException("Conversation ID cannot be empty", nameof(conversationId));
            }

            var userId = Context.User?.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                throw new UnauthorizedAccessException("User is not authenticated");
            }

            await Groups.AddToGroupAsync(Context.ConnectionId, $"conversation_{conversationId}");
        }

        public async Task LeaveConversation(string conversationId)
        {
            if (string.IsNullOrEmpty(conversationId))
            {
                throw new ArgumentException("Conversation ID cannot be empty", nameof(conversationId));
            }

            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"conversation_{conversationId}");
        }
    }
} 
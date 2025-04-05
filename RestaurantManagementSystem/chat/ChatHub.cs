using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Models.Chat;
using System;
using System.Linq;
using System.Threading.Tasks;
using infrastructures.UnitOfWork;
namespace Utility.Chat
{
    public class ChatHub : Hub
    {

        private readonly IUnitOfWork unitOfWork;

        public ChatHub(IUnitOfWork unitOfWork)
        {

            this.unitOfWork = unitOfWork;
        }

        public override async Task OnConnectedAsync()
        {
            var userId = Context.UserIdentifier;
            await Groups.AddToGroupAsync(Context.ConnectionId, userId);
            await base.OnConnectedAsync();
        }

        public async Task SendMessage(string senderId, string receiverId, string message)
        {
            var chatMessage = new ChatMessage
            {
                SenderId = senderId,
                ReceiverId = receiverId,
                Content = message,
                SentAt = DateTime.UtcNow,
                IsRead = false
            };

            unitOfWork.Chat.CreateAsync(chatMessage);
            await unitOfWork.CompleteAsync();

            await Clients.User(receiverId).SendAsync("ReceiveMessage", chatMessage);
            await Clients.Caller.SendAsync("MessageSent", chatMessage);
        }
    }

}
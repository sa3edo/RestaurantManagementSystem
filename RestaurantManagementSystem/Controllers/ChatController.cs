using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using RestaurantManagementSystem.Hubs;
using infrastructures.Repository.IRepository;
using Models.Chat;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace RestaurantManagementSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChatController : ControllerBase
    {
        private readonly IConversation _conversationRepo;
        private readonly IChatMessages _chatRepo;
        private readonly IHubContext<ChatHub> _hubContext;

        public ChatController(IConversation conversationRepo, IChatMessages chatRepo, IHubContext<ChatHub> hubContext)
        {
            _conversationRepo = conversationRepo;
            _chatRepo = chatRepo;
            _hubContext = hubContext;
        }

        // GET: api/chat/conversations/userId
        [HttpGet("conversations/{userId}")]
        public async Task<IActionResult> GetUserConversations(string userId)
        {
            if (string.IsNullOrEmpty(userId))
                return BadRequest("User ID is required.");

            var conversations = await _conversationRepo.GetUserConversationsAsync(userId);
            var sorted = conversations.OrderByDescending(c => c.LastMessageAt).ToList();

            return Ok(sorted);
        }

        // GET: api/chat/messages?user1=abc&user2=xyz
        [HttpGet("messages")]
        public async Task<IActionResult> GetMessagesBetweenUsers([FromQuery] string user1, [FromQuery] string user2)
        {
            var conversation = await _conversationRepo.GetConversationAsync(user1, user2);

            if (conversation == null)
            {
                conversation = new Conversation
                {
                    VendorId = user1,
                    UserId = user2,
                    CreatedAt = DateTime.UtcNow,
                    LastMessageAt = null
                };

                await _conversationRepo.CreateAsync(conversation);
                await _conversationRepo.CommitAsync();
            }

            var messages = await _chatRepo.GetMessagesByConversationIdAsync(conversation.Id);
            var sorted = messages.OrderBy(m => m.SentAt).ToList();

            return Ok(sorted);
        }


        // POST: api/chat/send
        [HttpPost("send")]
        public async Task<IActionResult> SendMessage([FromBody] ChatMessage message)
        {
            if (string.IsNullOrEmpty(message.SenderId) || string.IsNullOrEmpty(message.ReceiverId) || string.IsNullOrEmpty(message.Content))
                return BadRequest("Sender, receiver, and message content must be provided.");

            var conversation = await _conversationRepo.GetConversationAsync(message.SenderId, message.ReceiverId);

            if (conversation == null)
            {
                conversation = new Conversation
                {
                    VendorId = message.SenderId,
                    UserId = message.ReceiverId,
                    CreatedAt = DateTime.UtcNow,
                    LastMessageAt = DateTime.UtcNow
                };

                await _conversationRepo.CreateAsync(conversation);
                await _conversationRepo.CommitAsync();
            }

            message.SentAt = DateTime.UtcNow;
            message.IsRead = false;
            message.ConversationId = conversation.Id;

            await _chatRepo.CreateAsync(message);
            await _chatRepo.CommitAsync();

            // Send real-time message
            await _hubContext.Clients.User(message.ReceiverId).SendAsync("ReceiveMessage", message);

            return Ok(message);
        }
    }
}

using infrastructures.UnitOfWork;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Models.Chat;
using System.Security.Claims;
using Utility.Chat;

namespace RestaurantManagementSystem.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ChatController : ControllerBase
    {
        private readonly IHubContext<ChatHub> _hubContext;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<ChatController> _logger;

        public ChatController(
            IHubContext<ChatHub> hubContext,
            IUnitOfWork unitOfWork,
            ILogger<ChatController> logger)
        {
            _hubContext = hubContext;
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        [HttpGet("chat-users")]
        public async Task<IActionResult> GetChatUsersForManager()
        {
            var managerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(managerId))
                return Unauthorized();

            var users = await _unitOfWork.Chat.GetUsersWhoChattedWithAsync(managerId);

            return Ok(users);
        }

        [HttpGet("chat-history/{userId}")]
        public async Task<IActionResult> GetChatHistoryWithUser(string userId)
        {
            var managerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(managerId))
                return Unauthorized();

            var messages = await _unitOfWork.Chat.GetMessagesBetweenAsync(managerId, userId);

            return Ok(messages);
        }

        [HttpPost("send")]
        public async Task<IActionResult> SendMessage([FromBody] SendMessageDto messageDto)
        {
            try
            {
                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(currentUserId))
                    return Unauthorized(new ApiResponse(401, "User not authenticated"));

                if (string.IsNullOrWhiteSpace(messageDto.Content))
                    return BadRequest(new ApiResponse(400, "Message content cannot be empty"));

                var chatMessage = new ChatMessage
                {
                    SenderId = currentUserId,
                    ReceiverId = messageDto.ReceiverId,
                    Content = messageDto.Content,
                    SentAt = DateTime.UtcNow,
                    IsRead = false
                };

                await _unitOfWork.Chat.CreateAsync(chatMessage);
                await _unitOfWork.CompleteAsync();

                await _hubContext.Clients.User(messageDto.ReceiverId)
                    .SendAsync("ReceiveMessage", chatMessage);

                return Ok(new ApiResponse(200, "Message sent successfully", new
                {
                    chatMessage.Id,
                    chatMessage.Content,
                    chatMessage.SentAt,
                    SenderId = chatMessage.SenderId,
                    ReceiverId = chatMessage.ReceiverId
                }));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending message");
                return StatusCode(500, new ApiResponse(500, "An error occurred while sending the message"));
            }
        }

        [HttpGet("conversation/{otherUserId}")]
        public async Task<IActionResult> GetConversation(
            string otherUserId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            try
            {
                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(currentUserId))
                    return Unauthorized(new ApiResponse(401, "User not authenticated"));

                var messages = await _unitOfWork.Chat.GetConversationAsync(currentUserId, otherUserId, page, pageSize);
                var totalCount = await _unitOfWork.Chat.GetConversationCountAsync(currentUserId, otherUserId);

                return Ok(new ApiResponse(200, "Conversation retrieved successfully", new
                {
                    Messages = messages.Select(m => new
                    {
                        m.Id,
                        m.Content,
                        m.SentAt,
                        m.IsRead,
                        SenderId = m.SenderId,
                        ReceiverId = m.ReceiverId
                    }),
                    Pagination = new
                    {
                        Page = page,
                        PageSize = pageSize,
                        TotalCount = totalCount,
                        TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
                    }
                }));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting conversation");
                return StatusCode(500, new ApiResponse(500, "An error occurred while retrieving conversation"));
            }
        }

        [HttpPost("mark-as-read/{messageId}")]
        public async Task<IActionResult> MarkAsRead(int messageId)
        {
            try
            {
                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                var success = await _unitOfWork.Chat.MarkAsReadAsync(messageId, currentUserId);
                await _unitOfWork.CompleteAsync();

                if (!success)
                    return NotFound(new ApiResponse(404, "Message not found or you're not the recipient"));

                var message = await _unitOfWork.Chat.GetOneAsync(null, m => m.Id == messageId);
                if (message != null)
                {
                    await _hubContext.Clients.User(message.SenderId)
                        .SendAsync("MessageRead", messageId);
                }

                return Ok(new ApiResponse(200, "Message marked as read"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking message as read");
                return StatusCode(500, new ApiResponse(500, "An error occurred while marking message as read"));
            }
        }

        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadCount()
        {
            try
            {
                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                var count = await _unitOfWork.Chat.GetUnreadCountAsync(currentUserId);

                return Ok(new ApiResponse(200, "Unread count retrieved", new
                {
                    UnreadCount = count
                }));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting unread count");
                return StatusCode(500, new ApiResponse(500, "An error occurred while getting unread count"));
            }
        }
    }

    public class SendMessageDto
    {
        public string ReceiverId { get; set; }
        public string Content { get; set; }
    }

    public class ApiResponse
    {
        public int StatusCode { get; set; }
        public string Message { get; set; }
        public object Data { get; set; }

        public ApiResponse(int statusCode, string message, object data = null)
        {
            StatusCode = statusCode;
            Message = message;
            Data = data;
        }
    }
}

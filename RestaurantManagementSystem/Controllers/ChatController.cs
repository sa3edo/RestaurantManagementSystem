using infrastructures.Repository.IRepository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Models.Chat;
using RestaurantManagementSystem.Repository.IRepository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Utility.Chat;

namespace RestaurantManagementSystem.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ChatController : ControllerBase
    {
        private readonly IHubContext<ChatHub> _hubContext;
        private readonly IChat _chatRepository;
        private readonly ILogger<ChatController> _logger;

        public ChatController(
            IHubContext<ChatHub> hubContext,
            IChat chatRepository,
            ILogger<ChatController> logger)
        {
            _hubContext = hubContext;
            _chatRepository = chatRepository;
            _logger = logger;
        }

        [HttpPost("send")]
        public async Task<IActionResult> SendMessage([FromBody] SendMessageDto messageDto)
        {
            try
            {
                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(currentUserId))
                {
                    return Unauthorized(new ApiResponse(401, "User not authenticated"));
                }

                if (string.IsNullOrWhiteSpace(messageDto.Content))
                {
                    return BadRequest(new ApiResponse(400, "Message content cannot be empty"));
                }

                var chatMessage = new ChatMessage
                {
                    SenderId = currentUserId,
                    ReceiverId = messageDto.ReceiverId,
                    Content = messageDto.Content,
                    SentAt = DateTime.UtcNow,
                    IsRead = false
                };

                await _chatRepository.CreateAsync(chatMessage);
                await _chatRepository.CommitAsync();

                // Send via SignalR
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
                {
                    return Unauthorized(new ApiResponse(401, "User not authenticated"));
                }

                var messages = await _chatRepository.GetConversationAsync(currentUserId, otherUserId, page, pageSize);
                var totalCount = await _chatRepository.GetConversationCountAsync(currentUserId, otherUserId);

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

                var success = await _chatRepository.MarkAsReadAsync(messageId, currentUserId);
                await _chatRepository.CommitAsync();

                if (!success)
                {
                    return NotFound(new ApiResponse(404, "Message not found or you're not the recipient"));
                }

                // Notify sender that message was read
                var message = await _chatRepository.GetOneAsync(null, m => m.Id == messageId);
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

                var count = await _chatRepository.GetUnreadCountAsync(currentUserId);

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
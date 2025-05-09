using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Models.Chat;
using RestaurantManagementSystem.Services;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

namespace RestaurantManagementSystem.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ChatController : ControllerBase
    {
        private readonly IChatService _chatService;

        public ChatController(IChatService chatService)
        {
            _chatService = chatService ?? throw new ArgumentNullException(nameof(chatService));
        }

        [HttpGet("conversations")]
        public async Task<ActionResult<List<Conversation>>> GetConversations()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "User is not authenticated" });
                }

                var conversations = await _chatService.GetUserConversations(userId);
                return Ok(new { 
                    success = true, 
                    data = conversations,
                    message = "Conversations retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { 
                    success = false, 
                    message = "Error retrieving conversations",
                    error = ex.Message 
                });
            }
        }

        [HttpGet("vendor/{vendorId}/conversations")]

        public async Task<ActionResult<List<Conversation>>> GetVendorConversations(string vendorId)
        {
            try
            {
                if (string.IsNullOrEmpty(vendorId))
                {
                    return BadRequest(new { 
                        success = false, 
                        message = "Vendor ID is required" 
                    });
                }

                var conversations = await _chatService.GetVendorConversations(vendorId);
                return Ok(new { 
                    success = true, 
                    data = conversations,
                    message = "Vendor conversations retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { 
                    success = false, 
                    message = "Error retrieving vendor conversations",
                    error = ex.Message 
                });
            }
        }

        [HttpGet("conversations/{conversationId}/messages")]
        public async Task<ActionResult<List<ChatMessage>>> GetMessages(int conversationId)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "User is not authenticated" });
                }

                var messages = await _chatService.GetConversationMessages(conversationId, userId);
                return Ok(new { 
                    success = true, 
                    data = messages,
                    message = "Messages retrieved successfully"
                });
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { message = "You are not authorized to access this conversation" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { 
                    success = false, 
                    message = "Error retrieving messages",
                    error = ex.Message 
                });
            }
        }

        [HttpPost("messages")]
        public async Task<ActionResult<ChatMessage>> SendMessage([FromBody] SendMessageRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.Content))
                {
                    return BadRequest(new { 
                        success = false, 
                        message = "Message content is required" 
                    });
                }

                var senderId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(senderId))
                {
                    return Unauthorized(new { message = "User is not authenticated" });
                }

                var message = await _chatService.SendMessage(senderId, request.ReceiverId, request.Content);
                return Ok(new { 
                    success = true, 
                    data = message,
                    message = "Message sent successfully"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { 
                    success = false, 
                    message = "Error sending message",
                    error = ex.Message 
                });
            }
        }

        [HttpPost("conversations/{conversationId}/read")]
        public async Task<ActionResult> MarkAsRead(int conversationId)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "User is not authenticated" });
                }

                await _chatService.MarkMessagesAsRead(conversationId, userId);
                return Ok(new { 
                    success = true, 
                    message = "Messages marked as read successfully"
                });
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { message = "You are not authorized to access this conversation" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { 
                    success = false, 
                    message = "Error marking messages as read",
                    error = ex.Message 
                });
            }
        }
    }

    public class SendMessageRequest
    {
        public string ReceiverId { get; set; }
        public string Content { get; set; }
    }
}

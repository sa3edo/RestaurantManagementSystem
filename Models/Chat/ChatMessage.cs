using AutoMapper.Configuration.Annotations;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using RestaurantManagementSystem.Models;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Models.Chat
{
    public class ChatMessage
    {
        [Key]
        public string Id { get; set; }
        public string? ConversationId { get; set; }
        public string? SenderId { get; set; } 
        public string? ReceiverId { get; set; } 
        public string? Content { get; set; }
        public DateTime SentAt { get; set; }
        public bool IsRead { get; set; }

        [ValidateNever]
        [Ignore]
        public virtual Conversation? Conversation { get; set; }

        [ValidateNever]
        [Ignore]
        public virtual ApplicationUser? Sender { get; set; }

        [ValidateNever]
        [Ignore]
        public virtual ApplicationUser? Receiver { get; set; }
    }
}

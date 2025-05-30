﻿using AutoMapper.Configuration.Annotations;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using RestaurantManagementSystem.Models;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Models.Chat
{
    public class ChatMessage
    {
        [Key]
        public int Id { get; set; }
        public int ConversationId { get; set; }
        public string? SenderId { get; set; } 
        public string? ReceiverId { get; set; } 
        public string? Content { get; set; }
        public DateTime SentAt { get; set; }
        public bool IsRead { get; set; }

        [ValidateNever]
        [JsonIgnore]
        public virtual Conversation? Conversation { get; set; }

        [ValidateNever]
        [JsonIgnore]
        public virtual ApplicationUser? Sender { get; set; }

        [ValidateNever]
        [JsonIgnore]
        public virtual ApplicationUser? Receiver { get; set; }
    }
}

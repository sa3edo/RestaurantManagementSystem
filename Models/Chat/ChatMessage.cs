using AutoMapper.Configuration.Annotations;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using RestaurantManagementSystem.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models.Chat
{
    public class ChatMessage
    {
        public int Id { get; set; }
        public string SenderId { get; set; } 
        public string ReceiverId { get; set; } 
        public string Content { get; set; }
        public DateTime SentAt { get; set; }
        public bool IsRead { get; set; }
        [ValidateNever]
        [Ignore]
        public virtual ApplicationUser? Sender { get; set; }
        [ValidateNever]
        [Ignore]
        public virtual ApplicationUser? Receiver { get; set; }
    }
}

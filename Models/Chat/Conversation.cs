using AutoMapper.Configuration.Annotations;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using RestaurantManagementSystem.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Models.Chat
{
    public class Conversation
    {
        [Key]
        public string Id { get; set; }
        public string VendorId { get; set; }
        public string UserId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastMessageAt { get; set; }

        [ValidateNever]
        [Ignore]
        public virtual ApplicationUser? Vendor { get; set; }

        [ValidateNever]
        [Ignore]
        public virtual ApplicationUser? User { get; set; }

        [ValidateNever]
        [Ignore]
        public virtual ICollection<ChatMessage> Messages { get; set; }
    }
} 
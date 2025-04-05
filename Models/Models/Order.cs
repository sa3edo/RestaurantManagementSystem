using AutoMapper.Configuration.Annotations;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using RestaurantManagementSystem.Models;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Models.Models
{
    public class Order
    {
        [Key]
        public int OrderID { get; set; }
        public int UserID { get; set; }
        [ValidateNever]
        [Ignore]
        public ApplicationUser? Customer { get; set; }
        public int RestaurantID { get; set; }
        [ValidateNever]
        [Ignore]
        public Restaurant? Restaurant { get; set; }
        public OrderStatus Status { get; set; } = OrderStatus.Pending;
        public decimal TotalAmount { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        [ValidateNever]
        [JsonIgnore]
        public IEnumerable<OrderItem> OrderItems { get; set; }

    }

    public enum OrderStatus
    {
        Pending,
        Preparing,
        Ready,
        Delivered
    }
}

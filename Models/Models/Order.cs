using RestaurantManagementSystem.Models;
using System.ComponentModel.DataAnnotations;

namespace Models.Models
{
    public class Order 
    {
        [Key]
        public int OrderID { get; set; }
        public int UserID { get; set; }
        public ApplicationUser? Customer { get; set; }
        public int RestaurantID { get; set; }
        public Restaurant? Restaurant { get; set; }
        public OrderStatus Status { get; set; } = OrderStatus.Pending;
        public decimal TotalAmount { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public ICollection<OrderItem>? OrderItems { get; set; }
    }

    public enum OrderStatus
    {
        Pending,
        Preparing,
        Ready,
        Delivered
    }
}

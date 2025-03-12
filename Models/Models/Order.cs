using OfficeOpenXml.Export.HtmlExport.StyleCollectors.StyleContracts;
using RestaurantManagementSystem.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models.Models
{
    public class Order
    {
        public int OrderID { get; set; }
        public int CustomerID { get; set; }
        public int RestaurantID { get; set; }
        public OrderStatus Status { get; set; } = OrderStatus.Pending;
        public decimal TotalAmount { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ApplicationUser? Customer { get; set; }
        public Restaurant? Restaurant { get; set; }
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

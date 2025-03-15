using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using RestaurantManagementSystem.Models;

namespace Models.Models
{
    public class Restaurant
    {
        [Key]
        public int RestaurantID { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public int ManagerID { get; set; }
        public ApplicationUser? User { get; set; } 
        public RestaurantStatus Status { get; set; } = RestaurantStatus.Pending;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

       
        public ICollection<MenuItem>? MenuItems { get; set; }
        public ICollection<Order>? Orders { get; set; }
        public ICollection<Reservation>? Reservations { get; set; }
        public ICollection<Review>? Reviews { get; set; }
        public ICollection<TimeSlot>? TimeSlot { get; set; }
    }

    public enum RestaurantStatus
    {
        Pending,
        Approved,
        Rejected
    }

}

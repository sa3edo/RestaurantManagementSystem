using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper.Configuration.Annotations;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
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
        public string ManagerID { get; set; }
        public string? ImgUrl { get; set; }
        public ApplicationUser? User { get; set; } 
        public RestaurantStatus Status { get; set; } = RestaurantStatus.Pending;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ValidateNever]
        public ICollection<MenuItem>? MenuItems { get; set; }
        [ValidateNever]
        [Ignore]
        public ICollection<Order>? Orders { get; set; }
        [ValidateNever]
        [Ignore]
        public ICollection<Reservation>? Reservations { get; set; }
        [ValidateNever]
        public ICollection<Review>? Reviews { get; set; }
        [ValidateNever]
        public ICollection<TimeSlot>? TimeSlot { get; set; }
        [ValidateNever]
        public ICollection<Table>? Tables { get; set; }
    }

    public enum RestaurantStatus
    {
        Pending,
        Approved,
        Rejected
    }

}

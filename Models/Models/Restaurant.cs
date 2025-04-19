using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using AutoMapper.Configuration.Annotations;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using RestaurantManagementSystem.Models;

namespace Models.Models
{
    public class Restaurant
    {
        [Key]
        public int RestaurantID { get; set; }
        [Required]
        public string Name { get; set; } = string.Empty;
        [Required]
        public string Description { get; set; } = string.Empty;
        [Required]
        public string Location { get; set; } = string.Empty;
        [BindNever]      
        public string? ManagerID { get; set; }
        [ValidateNever]
        [JsonIgnore]
        public ApplicationUser? User { get; set; }
        public string? ImgUrl { get; set; }
        public RestaurantStatus Status { get; set; } = RestaurantStatus.Pending;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        [ValidateNever]
        [JsonIgnore]
        public IEnumerable<Reservation> Reservations { get; set; }
        [ValidateNever]
        [JsonIgnore]
        public IEnumerable<TimeSlot> TimeSlot { get; set; }

        [ValidateNever]
        [JsonIgnore]
        public IEnumerable<Table> Tables { get; set; }

        [ValidateNever]
        [JsonIgnore]
        public IEnumerable<FoodCategory> foodCategories { get; set; }

        [ValidateNever]
        [JsonIgnore]
        public IEnumerable<Order> Orders { get; set; }

        [ValidateNever]
        [JsonIgnore]
        public IEnumerable<MenuItem> MenuItems { get; set; }

    }

    public enum RestaurantStatus
    {
        Pending,
        Approved,
        Rejected
    }

}

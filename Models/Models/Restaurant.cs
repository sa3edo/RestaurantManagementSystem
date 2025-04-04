using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
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
        public string? ManagerID { get; set; }
        public string? ImgUrl { get; set; }
        [ValidateNever]
        public ApplicationUser? User { get; set; }
        public RestaurantStatus Status { get; set; } = RestaurantStatus.Pending;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

       
    }

    public enum RestaurantStatus
    {
        Pending,
        Approved,
        Rejected
    }

}

using AutoMapper.Configuration.Annotations;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using Microsoft.AspNetCore.SignalR;
using RestaurantManagementSystem.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Models.Models
{
    public class FoodCategory
    {
        [Key]
        public int CategoryID { get; set; }
        [Required]
        public string Name { get; set; } = string.Empty;
        
        public string UserId { get; set; } = string.Empty;
        [ValidateNever]
        [JsonIgnore]
        public ApplicationUser? applicationUser { get; set; }


    }

}

using AutoMapper.Configuration.Annotations;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Models.Models
{
    public class MenuItem
    {
        [Key]
        public int MenuItemID { get; set; }
        [Required]
        public int RestaurantID { get; set; }
        [Required]
        public int CategoryID { get; set; }
        [ValidateNever]
        [JsonIgnore]
        public FoodCategory? Category { get; set; }
        [Required]
        public string Name { get; set; }
        [Required]
        public string Description { get; set; }
        [Required]
        public decimal Price { get; set; }
        public string? ImgUrl { get; set; }
        public bool Availability { get; set; } = true;
        [ValidateNever]
        [JsonIgnore]
        public Restaurant? Restaurant { get; set; }
        [ValidateNever]
        [JsonIgnore]
        public IEnumerable<OrderItem> OrderItems { get; set; }
    }

}

using AutoMapper.Configuration.Annotations;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using Microsoft.AspNetCore.SignalR;
using RestaurantManagementSystem.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
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

        public int RestaurantId { get; set; }
        [ValidateNever]
        //[JsonIgnore]
        public Restaurant? Restaurant { get; set; }
    }


}

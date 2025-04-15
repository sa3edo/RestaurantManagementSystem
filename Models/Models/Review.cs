using AutoMapper.Configuration.Annotations;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using RestaurantManagementSystem.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models.Models
{
    public class Review
    {
        [Key]
        public int ReviewID { get; set; }
        [Required]
        public int UserID { get; set; }
        [ValidateNever]
        [Ignore]
        public ApplicationUser? Customer { get; set; }
        [Required]
        public int RestaurantID { get; set; }
        [ValidateNever]
        [Ignore]
        public Restaurant? Restaurant { get; set; }
        [Required]
        public int Rating { get; set; }
        [Required]
        public string Comment { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    
    }

}

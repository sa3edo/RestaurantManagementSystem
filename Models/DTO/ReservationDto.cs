using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using Models.Models;
using RestaurantManagementSystem.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Models.DTO
{
   public class ReservationDto
    {
        [Key]
        public int ReservationID { get; set; }  
        [Required]
        public int RestaurantID { get; set; }       
        [Required]
        public int TimeSlotID { get; set; }      
        [Required]
        public int TableId { get; set; }
        [Required]
        public DateOnly ReservationDate { get; set; }
    }
}

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
    public class TimeSlot
    {
        [Key]
        public int TimeSlotID { get; set; }
        [Required]
        public int RestaurantID { get; set; }
        [ValidateNever]
        [JsonIgnore]
        public Restaurant? Restaurant { get; set; }
        [Required]
        public DateTime StartTime { get; set; }
        [Required]
        public DateTime EndTime { get; set; }
        public bool IsAvailable { get; set; } = true;
        [ValidateNever]
        [JsonIgnore]
        public IEnumerable<Reservation> Reservations { get; set; }


    }

}

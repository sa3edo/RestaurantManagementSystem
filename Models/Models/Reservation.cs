using AutoMapper.Configuration.Annotations;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using RestaurantManagementSystem.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Models.Models
{
    public class Reservation
    {
        [Key]
        public int ReservationID { get; set; }
        
        public string? UserID { get; set; }
        [ValidateNever]
       // [JsonIgnore]
        public ApplicationUser? Customer { get; set; }
        [Required]
        public int RestaurantID { get; set; }
        [ValidateNever]
        [JsonIgnore]
        public Restaurant? Restaurant { get; set; }
        [Required]
        public int TimeSlotID { get; set; }
        [ValidateNever]
        [JsonIgnore]
        public TimeSlot? TimeSlot { get; set; }
        [Required]
        public int TableId { get; set; }

        [ValidateNever]
        [JsonIgnore]

        public Table? Table { get; set; }

        [Required]
        public DateOnly ReservationDate { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow; 
       public ReservationStatus Status { get; set; } = ReservationStatus.Pending;
    }

    public enum ReservationStatus
    {
        Pending,
        Confirmed,
        Rejected
    }
}

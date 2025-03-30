using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using RestaurantManagementSystem.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Models.Models
{
    public class Reservation
    {
        [Key]
        public int ReservationID { get; set; }

        public string UserID { get; set; } = string.Empty;
        [ValidateNever]
        public ApplicationUser? Customer { get; set; }

        public int RestaurantID { get; set; }
        [ValidateNever]
        public Restaurant? Restaurant { get; set; }

        public int TimeSlotID { get; set; }
        [ValidateNever]
        public TimeSlot? TimeSlot { get; set; }

        public int TableId { get; set; }
        [ValidateNever]
        public Table Table { get; set; }

        [Required]
        public DateTime ReservationDate { get; set; }  // 🆕 Added Date Property

        public ReservationStatus Status { get; set; } = ReservationStatus.Pending;
    }

    public enum ReservationStatus
    {
        Pending,
        Confirmed,
        Rejected
    }
}

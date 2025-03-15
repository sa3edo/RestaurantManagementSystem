using RestaurantManagementSystem.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models.Models
{
    public class Reservation
    {
        [Key]
        public int ReservationID { get; set; }
        public string UserID { get; set; } = string.Empty;

        public ApplicationUser? Customer { get; set; }
        public int RestaurantID { get; set; }
        public Restaurant? Restaurant { get; set; }
        public int TimeSlotID { get; set; }
        public TimeSlot? TimeSlot { get; set; }
        public ReservationStatus Status { get; set; } = ReservationStatus.Pending;
    }


    public enum ReservationStatus
    {
        Pending,
        Confirmed,
        Rejected,
        Cancelled
    }

}

using RestaurantManagementSystem.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models.Models
{
    public class Reservation
    {
        public int ReservationID { get; set; }
        public int CustomerID { get; set; }
        public int RestaurantID { get; set; }
        public DateTime ReservationTime { get; set; }
        public ReservationStatus Status { get; set; } = ReservationStatus.Pending;

        public ApplicationUser? Customer { get; set; }
        public Restaurant? Restaurant { get; set; }
    }

    public enum ReservationStatus
    {
        Pending,
        Confirmed,
        Rejected,
        Cancelled
    }

}

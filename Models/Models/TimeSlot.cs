using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models.Models
{
    public class TimeSlot
    {
        [Key]
        public int TimeSlotID { get; set; }
        public int RestaurantID { get; set; }
        public Restaurant? Restaurant { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public bool IsAvailable { get; set; } = true;

       
        public ICollection<Reservation>? Reservations { get; set; }
    }

}

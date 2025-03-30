using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;

namespace Models.Models
{
    public class Table
    {
        [Key]
        public int TableId { get; set; }

        [Required]
        public int Seats { get; set; }

        [Required]
        public bool IsAvailable { get; set; } = true;

        public int RestaurantId { get; set; }
        [ValidateNever]
        public Restaurant? Restaurant { get; set; }
        [ValidateNever]
        public List<Reservation>? Reservations { get; set; }
    }

}

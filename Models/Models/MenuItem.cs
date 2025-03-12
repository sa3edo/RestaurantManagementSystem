using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models.Models
{
    public class MenuItem
    {
        public int MenuItemID { get; set; }
        public int RestaurantID { get; set; }
        public int CategoryID { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public bool Availability { get; set; } = true;

        public Restaurant? Restaurant { get; set; }
        public FoodCategory? Category { get; set; }
    }

}

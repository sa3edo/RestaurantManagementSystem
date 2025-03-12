using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models.Models
{
    public class FoodCategory
    {
        public int CategoryID { get; set; }
        public string Name { get; set; } = string.Empty;

        public ICollection<MenuItem>? MenuItems { get; set; }
    }

}

using infrastructures.Repository.IRepository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using RestaurantManagementSystem.Repository;

namespace infrastructures.Repository
{
    public class MenuItem : Repository<Models.Models.MenuItem>,IMenuItem
    {
        public MenuItem(ApplicationDbContext dbContext) : base(dbContext)
        {
            
        }
    }
}

using infrastructures.Repository.IRepository;
using Models.Models;
using RestaurantManagementSystem.Repository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace infrastructures.Repository
{
    class Restaurant : Repository<Restaurant>,IRestaurant
    {
        public Restaurant(ApplicationDbContext dbContext) : base(dbContext)
        {

        }
    }
}

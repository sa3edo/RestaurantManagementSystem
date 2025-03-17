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
    class Order : Repository<Models.Models.Order> ,IOrder
    {
        public Order(ApplicationDbContext dbContext) : base(dbContext)
        {

        }
    }
}


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
    public class OrderItem : Repository<Models.Models.OrderItem> , IOrderItem
    {
        public OrderItem(ApplicationDbContext dbContext) : base(dbContext)
        {

        }
    }
}

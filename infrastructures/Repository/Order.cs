using infrastructures.Repository.IRepository;
using Microsoft.EntityFrameworkCore;
using RestaurantManagementSystem.Repository;
using System.Linq.Expressions;

namespace infrastructures.Repository
{
    public class Order : Repository<Models.Models.Order>, IOrder
    {
        private readonly ApplicationDbContext _dbContext;

        public Order(ApplicationDbContext dbContext) : base(dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<Models.Models.Order?> GetOrderWithDetailsByIdAsync(int orderId)
        {
            return await _dbContext.Orders.Include(o=>o.Restaurant).Include(O=>O.Customer)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.MenuItem)
                .FirstOrDefaultAsync(o => o.OrderID == orderId);
        }
    }
}

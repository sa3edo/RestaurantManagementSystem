using Models.Models;
using RestaurantManagementSystem.Repository.IRepository;

namespace infrastructures.Repository.IRepository
{
     public interface IOrder : IRepository<Models.Models.Order>
    {
         Task<Models.Models.Order?> GetOrderWithDetailsByIdAsync(int orderId);
    }
}
     

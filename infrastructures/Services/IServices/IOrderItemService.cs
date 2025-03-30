using Models.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace infrastructures.Services.IServices
{
    public interface IOrderItemService
    {
        Task<IEnumerable<OrderItem>> GetItemsByOrderAsync(int orderId);
        Task<OrderItem> CreateOrderItemAsync(OrderItem orderItem);
        Task<bool> DeleteOrderItemAsync(int orderItemId);
    }

}

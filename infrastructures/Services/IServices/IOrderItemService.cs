using Models.DTO;
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

        Task<OrderItem?> GetOrderItemAsync(int orderId, int menuItemId);
        Task<OrderItem> AddItemToOrderAsync(int orderId, OrderItemDto itemDto);
        Task<bool> RemoveItemFromOrderAsync(int orderId, int menuItemId);
        Task<OrderItem?> UpdateItemQuantityAsync(int orderId, int menuItemId, int newQuantity);
    }

}

using infrastructures.Services.IServices;
using infrastructures.UnitOfWork;
using Models.DTO;
using Models.Models;
using Stripe.Climate;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace infrastructures.Services
{
    public class OrderItemService : IOrderItemService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMenuItemService _menuItemService;
        private readonly IOrderService _orderService;
        public OrderItemService(IUnitOfWork unitOfWork ,IMenuItemService menuItemService, IOrderService orderService)
        {
            _unitOfWork = unitOfWork;
            _menuItemService = menuItemService;
            _orderService = orderService;
        }

        public async Task<IEnumerable<OrderItem>> GetItemsByOrderAsync(int orderId) =>
            await _unitOfWork.orderItem.GetAsync(expression: oi => orderId== orderId);

        public async Task<OrderItem> CreateOrderItemAsync(OrderItem orderItem)
        {
            await _unitOfWork.orderItem.CreateAsync(orderItem);
            await _unitOfWork.CompleteAsync();
            return orderItem;
        }

        public async Task<bool> DeleteOrderItemAsync(int orderItemId)
        {
            var orderItem = await _unitOfWork.orderItem.GetOneAsync(expression: oi => oi.OrderItemId==orderItemId );
            if (orderItem == null) return false;

            _unitOfWork.orderItem.Delete(orderItem);
            await _unitOfWork.CompleteAsync();
            return true;
        }

        public async Task<OrderItem?> GetOrderItemAsync(int orderId, int menuItemId)
        {
            return await _unitOfWork.orderItem.GetOneAsync(
               expression: oi => oi.OrderID == orderId && oi.MenuItemID == menuItemId);
        }

        public async Task<OrderItem> AddItemToOrderAsync(int orderId, OrderItemDto itemDto)
        {
            var menuItem = await _menuItemService.GetMenuItemByIdAsync(itemDto.MenuItemId);
            if (menuItem == null)
                throw new ArgumentException("Menu item not found");

            var order = await _orderService.GetOrderByIdAsync(orderId);
            if (order == null || order.Status != OrderStatus.Pending)
                throw new ArgumentException("Order not found or not modifiable");

            var existingItem = await GetOrderItemAsync(orderId, itemDto.MenuItemId);
            if (existingItem != null)
            {
                // Item already exists, update quantity instead
                existingItem.Quantity += itemDto.Quantity;
                _unitOfWork.orderItem.Edit(existingItem);
            }
            else
            {
                // Create new order item
                var orderItem = new OrderItem
                {
                    OrderID = orderId,
                    MenuItemID = itemDto.MenuItemId,
                    Quantity = itemDto.Quantity,
                    CreatedAt = DateTime.UtcNow
                };
                await _unitOfWork.orderItem.CreateAsync(orderItem);
            }

            // Update order total
            order.TotalAmount += menuItem.Price * itemDto.Quantity;
            await _orderService.UpdateOrderAsync(order);

            await _unitOfWork.CompleteAsync();
            return await GetOrderItemAsync(orderId, itemDto.MenuItemId);
        }

        public async Task<bool> RemoveItemFromOrderAsync(int orderId, int menuItemId)
        {
            var orderItem = await GetOrderItemAsync(orderId, menuItemId);
            if (orderItem == null) return false;

            var menuItem = await _menuItemService.GetMenuItemByIdAsync(menuItemId);
            var order = await _orderService.GetOrderByIdAsync(orderId);

            if (order == null || order.Status != OrderStatus.Pending)
                return false;

            // Update order total
            order.TotalAmount -= menuItem.Price * orderItem.Quantity;
            await _orderService.UpdateOrderAsync(order);

            _unitOfWork.orderItem.Delete(orderItem);
            await _unitOfWork.CompleteAsync();
            return true;
        }

        public async Task<OrderItem?> UpdateItemQuantityAsync(int orderId, int menuItemId, int newQuantity)
        {
            if (newQuantity <= 0)
                throw new ArgumentException("Quantity must be positive");

            var orderItem = await GetOrderItemAsync(orderId, menuItemId);
            if (orderItem == null) return null;

            var menuItem = await _menuItemService.GetMenuItemByIdAsync(menuItemId);
            var order = await _orderService.GetOrderByIdAsync(orderId);

            if (order == null || order.Status != OrderStatus.Pending)
                return null;

            // Calculate the difference in total amount
            var quantityDifference = newQuantity - orderItem.Quantity;
            order.TotalAmount += menuItem.Price * quantityDifference;

            // Update quantity
            orderItem.Quantity = newQuantity;
            _unitOfWork.orderItem.Edit(orderItem);

            await _orderService.UpdateOrderAsync(order);
            await _unitOfWork.CompleteAsync();

            return orderItem;
        }
    }

}

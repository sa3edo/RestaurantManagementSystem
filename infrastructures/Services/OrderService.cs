using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using infrastructures.Services.IServices;
using infrastructures.UnitOfWork;
using Models.Models;
using RestaurantManagementSystem.Repository.IRepository;

namespace infrastructures.Services
{
    public class OrderService : IOrderService
    {
        private readonly IUnitOfWork _unitOfWork;

        public OrderService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<Order>> GetAllOrdersAsync(int RestaurantId) =>
            await _unitOfWork.order.GetAsync(expression:e=>e.RestaurantID== RestaurantId);

        public async Task<Order?> GetOrderByIdAsync(int orderId) =>
            await _unitOfWork.order.GetOneAsync(expression: e => e.OrderID == orderId);

        public async Task<Order> CreateOrderAsync(Order order)
        {
            await _unitOfWork.order.CreateAsync(order);
            await _unitOfWork.CompleteAsync(); // Save changes after adding
            return order;
        }

        public async Task<Order?> UpdateOrderStatusAsync(int orderId, OrderStatus status)
        {
            var order = await _unitOfWork.order.GetOneAsync(expression: e => e.OrderID == orderId);
            if (order == null) return null;

            order.Status = status;
            _unitOfWork.order.Edit(order);
            await _unitOfWork.CompleteAsync(); // Save changes

            return order;
        }
        public async Task<Order?> UpdateOrderAsync(Order order)
        {
            var existingOrder = await _unitOfWork.order.GetOneAsync(expression: e => e.OrderID == order.OrderID);
            if (existingOrder == null) return null;

            _unitOfWork.order.Edit(order);
            await _unitOfWork.CompleteAsync();
            return order;
        }
        public async Task<bool> CancelOrderAsync(int orderId)
        {
            var order = await _unitOfWork.order.GetOneAsync(expression: e => e.OrderID == orderId);
            if (order == null || order.Status != OrderStatus.Pending) return false;

            _unitOfWork.order.Delete(order);
            await _unitOfWork.CompleteAsync(); // Save changes after deleting

            return true;
        }

        public async Task<IEnumerable<Order>> GetUserOrders(string UserId = "") =>
            await _unitOfWork.order.GetAsync(expression: e => e.UserID == UserId);
       
    }
}

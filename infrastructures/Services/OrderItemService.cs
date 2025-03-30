using infrastructures.Services.IServices;
using infrastructures.UnitOfWork;
using Models.Models;
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

        public OrderItemService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
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
    }

}

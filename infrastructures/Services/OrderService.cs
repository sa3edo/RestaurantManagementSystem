using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using infrastructures.Services.IServices;
using infrastructures.UnitOfWork;
namespace infrastructures.Services
{
    public class OrderService : IOrderService
    {
        private readonly IUnitOfWork _unitOfWork;

        public OrderService(IUnitOfWork unitOfWork)
        {
            this._unitOfWork = unitOfWork;
        }
        public void MonitorOrders()
        {
            var orders = _unitOfWork.order.Get();
            foreach (var order in orders)
            {
                Console.WriteLine($"Order ID: {order.OrderID}, Status: {order.Status}");
            }
        }
    }
}

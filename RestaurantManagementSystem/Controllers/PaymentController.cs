using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stripe.Checkout;
using RestaurantManagementSystem.Models;
using RestaurantManagementSystem.Repository;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using infrastructures.Services.IServices;
using Models.Models;

namespace RestaurantManagementSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PaymentController : ControllerBase
    {
        private readonly IOrderService _orderService;
        private readonly IOrderItemService _orderItemService;
        private readonly UserManager<ApplicationUser> _userManager;

        public PaymentController(
            IOrderService orderService,
            IOrderItemService orderItemService,
            UserManager<ApplicationUser> userManager)
        {
            _orderService = orderService;
            _orderItemService = orderItemService;
            _userManager = userManager;
        }

        [HttpPost("CreateCheckoutSession/{orderId}")]
        public async Task<IActionResult> CreateCheckoutSession(int orderId)
        {
            var userId = _userManager.GetUserId(User);
            var order = await _orderService.GetOrderByIdAsync(orderId);

            if (order == null || order.UserID.ToString() != userId)
                return Unauthorized(new { message = "Order not found or doesn't belong to user" });

            if (order.Status != OrderStatus.Pending)
                return BadRequest(new { message = "Order is already processed" });

            var orderItems = await _orderItemService.GetItemsByOrderAsync(orderId);
            if (orderItems == null || !orderItems.Any())
                return BadRequest(new { message = "No items in the order" });

            var options = new SessionCreateOptions
            {
                PaymentMethodTypes = new List<string> { "card" },
                LineItems = new List<SessionLineItemOptions>(),
                Mode = "payment",
                SuccessUrl = $"http://localhost:4200/payment/success?orderId={orderId}", // Your frontend success URL
                CancelUrl = $"http://localhost:4200/orders/{orderId}", // Your frontend cancel URL
                CustomerEmail = (await _userManager.GetUserAsync(User))?.Email,
                Metadata = new Dictionary<string, string>
                {
                    { "orderId", orderId.ToString() }
                }
            };

            foreach (var item in orderItems)
            {
                if (item.MenuItem == null)
                    continue;

                options.LineItems.Add(new SessionLineItemOptions
                {
                    PriceData = new SessionLineItemPriceDataOptions
                    {
                        Currency = "egp",
                        ProductData = new SessionLineItemPriceDataProductDataOptions
                        {
                            Name = item.MenuItem.Name,
                            Description = item.MenuItem.Description
                        },
                        UnitAmount = (long)(item.MenuItem.Price * 100),
                    },
                    Quantity = item.Quantity,
                });
            }

            var service = new SessionService();
            var session = service.Create(options);

            return Ok(new { sessionId = session.Id, url = session.Url });
        }

        [HttpGet("PaymentSuccess")]
        public async Task<IActionResult> PaymentSuccess(int orderId)
        {
            var userId = _userManager.GetUserId(User);
            var order = await _orderService.GetOrderByIdAsync(orderId);

            if (order == null || order.UserID.ToString() != userId)
                return Unauthorized(new { message = "Order not found or doesn't belong to user" });

            
            order.Status = OrderStatus.Preparing;
            await _orderService.UpdateOrderAsync(order);
          
            return Ok(new { message = "Payment successful", orderId });
        }

        [HttpGet("PaymentCancel")]
        public IActionResult PaymentCancel(int orderId)
        {
            _orderService.CancelOrderAsync(orderId);
            return Ok(new { message = "Payment canceled", orderId });
        }
    }
}
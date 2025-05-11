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

        [HttpPost("CreateCheckoutSession")]
        public async Task<IActionResult> CreateCheckoutSession([FromForm] int orderId)
        {
            var userId = _userManager.GetUserId(User);
            var order = await _orderService.GetOrderByIdAsync(orderId);

            if (order == null || order.UserID.ToString() != userId)
                return Unauthorized(new { message = "Order not found or doesn't belong to user" });

            if (order.Status != OrderStatus.Pending)
                return BadRequest(new { message = "Order is already processed or not pending" });

            var orderItems = await _orderItemService.GetItemsByOrderAsync(orderId);
            if (orderItems == null || !orderItems.Any())
                return BadRequest(new { message = "No items in the order" });

            var options = new SessionCreateOptions
            {
                PaymentMethodTypes = new List<string> { "card" },
                LineItems = new List<SessionLineItemOptions>(),
                Mode = "payment",
                SuccessUrl = $"http://localhost:4200/payment/success?session_id={{CHECKOUT_SESSION_ID}}",
                CancelUrl = $"http://localhost:4200/orders/{orderId}",
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
        public async Task<IActionResult> PaymentSuccess()
        {
            try
            {
                var sessionId = Request.Query["session_id"];
                var service = new SessionService();
                var session = service.Get(sessionId);

                if (session == null)
                    return BadRequest(new { message = "Session not found" });

                if (!session.Metadata.ContainsKey("orderId"))
                    return BadRequest(new { message = "Order ID not found in session metadata" });

                var orderId = int.Parse(session.Metadata["orderId"]);
                var userId = _userManager.GetUserId(User);
                var order = await _orderService.GetOrderByIdAsync(orderId);

                if (order == null || order.UserID.ToString() != userId)
                    return Unauthorized(new { message = "Order not found or doesn't belong to user" });

                if (session.PaymentStatus != "paid")
                    return BadRequest(new { message = "Payment was not successful" });

                
                if (order.Status == OrderStatus.Pending)
                {
                    order.Status = OrderStatus.Preparing;
                    var updateResult = await _orderService.UpdateOrderAsync(order);
                }

                return Ok(new { message = "Payment successful", orderId });
            }
            catch (Exception ex)
            {
                // Log the exception here
                return StatusCode(500, new { message = "An error occurred while processing payment", error = ex.Message });
            }
        }
        [HttpGet("PaymentCancel")]
        public async Task<IActionResult> PaymentCancel()
        {
            var sessionId = Request.Query["session_id"];
            var service = new SessionService();
            var session = service.Get(sessionId);

            if (session == null)
                return BadRequest(new { message = "Session not found" });

            if (!session.Metadata.ContainsKey("orderId"))
                return BadRequest(new { message = "Order ID not found in session metadata" });

            var orderId = int.Parse(session.Metadata["orderId"]);
            var order = await _orderService.GetOrderByIdAsync(orderId);
            if (order == null)
                return BadRequest(new { message = "Order not found" });

            await _orderService.CancelOrderAsync(orderId);

            return Ok(new { message = "Payment canceled", orderId });
        }

    }
}
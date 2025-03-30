using Microsoft.AspNetCore.Mvc;
using infrastructures.Services.IServices;
using Models.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace RestaurantManagementSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly IMenuItemService _menuItemService;
        private readonly IOrderService _orderService;
        private readonly IReservationService _reservationService;
        private readonly IReviewService _reviewService;
        private readonly IRestaurantService _restaurantService;
        private readonly IFoodCategoryService _foodCategoryService;
        private readonly IOrderItemService _orderItemService;

        public UserController(
            IMenuItemService menuItemService,
            IOrderService orderService,
            IReservationService reservationService,
            IReviewService reviewService,
            IRestaurantService restaurantService,
            IFoodCategoryService foodCategoryService,
            IOrderItemService orderItemService)
        {
            _menuItemService = menuItemService;
            _orderService = orderService;
            _reservationService = reservationService;
            _reviewService = reviewService;
            _restaurantService = restaurantService;
            _foodCategoryService = foodCategoryService;
            _orderItemService = orderItemService;
        }

        private int GetUserId()
        {
            return int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
        }

        // ✅ Get Menu by Restaurant
        [HttpGet("GetRestaurantMenu/{restaurantId}/menu")]
        public async Task<ActionResult<IEnumerable<MenuItem>>> GetRestaurantMenu(int restaurantId)
        {
            var menu = await _menuItemService.GetMenuItemsByRestaurantAsync(restaurantId);
            return Ok(menu);
        }

        // ✅ Create Order
        [HttpPost("CreateOrder")]
        public async Task<ActionResult<Order>> CreateOrder([FromBody] Order order)
        {
            order.UserID = GetUserId();
            var newOrder = await _orderService.CreateOrderAsync(order);
            return CreatedAtAction(nameof(CreateOrder), new { id = newOrder.OrderID }, newOrder);
        }

        // ✅ Get User Orders
        [HttpGet("orders")]
        public async Task<ActionResult<IEnumerable<Order>>> GetUserOrders()
        {
            int userId = GetUserId();
            var orders = await _orderService.GetOrderByIdAsync(userId);
            return Ok(orders);
        }

        // ✅ Cancel Order
        [HttpDelete("orders/{orderId}")]
        public async Task<IActionResult> CancelOrder(int orderId)
        {
            int userId = GetUserId();
            var result = await _orderService.CancelOrderAsync(orderId);
            if (!result) return BadRequest("Order cannot be canceled.");
            return NoContent();
        }

        // ✅ Create Reservation
        [HttpPost("CreateReservation")]
        public async Task<ActionResult<Reservation>> BookTable([FromBody] Reservation reservation)
        {
            reservation.UserID = GetUserId().ToString();
            var newReservation = await _reservationService.CreateReservationAsync(reservation);
            return CreatedAtAction(nameof(BookTable), new { id = newReservation.ReservationID }, newReservation);
        }

        // ✅ Get User Reservations
        [HttpGet("reservations")]
        public async Task<ActionResult<IEnumerable<Reservation>>> GetUserReservations()
        {
            int userId = GetUserId();
            var reservations = await _reservationService.GetReservationByIdAsync(userId);
            return Ok(reservations);
        }

        // ✅ Cancel Reservation
        [HttpDelete("CancelReservation/{reservationId}")]
        public async Task<IActionResult> CancelReservation(int reservationId)
        {
            int userId = GetUserId();
            var result = await _reservationService.CancelReservationAsync(reservationId);
            if (!result) return BadRequest("Reservation not found or cannot be canceled.");
            return NoContent();
        }

        // ✅ Create Review
        [HttpPost("CreateReview")]
        public async Task<ActionResult<Review>> CreateReview([FromBody] Review review)
        {
            review.UserID = GetUserId();
            var newReview = await _reviewService.CreateReviewAsync(review);
            return CreatedAtAction(nameof(CreateReview), new { id = newReview.ReviewID }, newReview);
        }

        // ✅ Get Categories
        [HttpGet("restaurants/{restaurantId}/categories")]
        public async Task<ActionResult<IEnumerable<FoodCategory>>> GetCategories(int restaurantId)
        {
            var categories = await _foodCategoryService.GetAllCategoriesAsync();
            return Ok(categories);
        }

        // ✅ Create Order Item
        [HttpPost("CreateOrderItem")]
        public async Task<ActionResult<OrderItem>> CreateOrderItem([FromBody] OrderItem orderItem)
        {
            var newOrderItem = await _orderItemService.CreateOrderItemAsync(orderItem);
            return CreatedAtAction(nameof(CreateOrderItem), new { id = newOrderItem.OrderItemId }, newOrderItem);
        }

        // ✅ Get Order Items by Order ID
        [HttpGet("OrderItems/{orderId}")]
        public async Task<ActionResult<IEnumerable<OrderItem>>> GetOrderItems(int orderId)
        {
            var items = await _orderItemService.GetItemsByOrderAsync(orderId);
            if (items == null) return NotFound("No order items found.");
            return Ok(items);
        }

        // ✅ Delete Order Item
        [HttpDelete("OrderItem/{orderItemId}")]
        public async Task<IActionResult> DeleteOrderItem(int orderItemId)
        {
            var result = await _orderItemService.DeleteOrderItemAsync(orderItemId);
            if (!result) return NotFound("Order item not found.");
            return NoContent();
        }
    }
}

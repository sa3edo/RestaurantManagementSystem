using Microsoft.AspNetCore.Mvc;
using infrastructures.Services.IServices;
using Models.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.Linq;
using Models.DTO;

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
        [HttpGet("GetAllRestaurant")]
        public async Task<ActionResult<IEnumerable<MenuItem>>> GetAllRestaurant()
        {
            var Rest = await _restaurantService.GetAllRestaurantsAsync();
            return Ok(Rest);
        }

        [HttpGet("GetRestaurantMenu/{restaurantId}/menu")]
        public async Task<ActionResult<IEnumerable<MenuItem>>> GetRestaurantMenu(int restaurantId)
        {
            var menu = await _menuItemService.GetMenuItemsByRestaurantAsync(restaurantId);
            return Ok(menu);
        }

        [HttpPost("CreateOrder")]
        public async Task<ActionResult<Order>> CreateOrder([FromBody] CreateOrderDto orderDto)
        {
            var userId = GetUserId();
            var order = new Order
            {
                UserID = userId,
                RestaurantID = orderDto.RestaurantId,
                Status = OrderStatus.Pending,
                CreatedAt = DateTime.UtcNow,
                TotalAmount = 0
            };

            var newOrder = await _orderService.CreateOrderAsync(order);

            if (orderDto.Items != null && orderDto.Items.Any())
            {
                decimal totalAmount = 0;

                foreach (var itemDto in orderDto.Items)
                {
                    var menuItem = await _menuItemService.GetMenuItemByIdAsync(itemDto.MenuItemId);
                    if (menuItem == null)
                    {
                        continue;
                    }

                    var orderItem = new OrderItem
                    {
                        OrderID = newOrder.OrderID,
                        MenuItemID = itemDto.MenuItemId,
                        Quantity = itemDto.Quantity,
                        CreatedAt = DateTime.UtcNow
                    };

                    await _orderItemService.CreateOrderItemAsync(orderItem);
                    totalAmount += menuItem.Price * itemDto.Quantity;
                }

                newOrder.TotalAmount = totalAmount;
                await _orderService.UpdateOrderAsync(newOrder);
            }

            return CreatedAtAction(nameof(CreateOrder), new { id = newOrder.OrderID }, newOrder);
        }

        [HttpGet("orders")]
        public async Task<ActionResult<IEnumerable<Order>>> GetUserOrders()
        {
            int userId = GetUserId();
            var orders = await _orderService.GetOrderByIdAsync(userId);
            return Ok(orders);
        }

        [HttpDelete("orders/{orderId}")]
        public async Task<IActionResult> CancelOrder(int orderId)
        {
            int userId = GetUserId();
            var result = await _orderService.CancelOrderAsync(orderId);
            if (!result) return BadRequest("Order cannot be canceled.");
            return NoContent();
        }

        [HttpPost("CreateReservation")]
        public async Task<ActionResult<Reservation>> BookTable([FromBody] Reservation reservation)
        {
            reservation.UserID = GetUserId().ToString();
            var newReservation = await _reservationService.CreateReservationAsync(reservation);
            return CreatedAtAction(nameof(BookTable), new { id = newReservation.ReservationID }, newReservation);
        }

        [HttpGet("reservations")]
        public async Task<ActionResult<IEnumerable<Reservation>>> GetUserReservations()
        {
            int userId = GetUserId();
            var reservations = await _reservationService.GetReservationByIdAsync(userId);
            return Ok(reservations);
        }

        [HttpDelete("CancelReservation/{reservationId}")]
        public async Task<IActionResult> CancelReservation(int reservationId)
        {
            int userId = GetUserId();
            var result = await _reservationService.CancelReservationAsync(reservationId);
            if (!result) return BadRequest("Reservation not found or cannot be canceled.");
            return NoContent();
        }

        [HttpPost("CreateReview")]
        public async Task<ActionResult<Review>> CreateReview([FromBody] Review review)
        {
            review.UserID = GetUserId();
            var newReview = await _reviewService.CreateReviewAsync(review);
            return CreatedAtAction(nameof(CreateReview), new { id = newReview.ReviewID }, newReview);
        }

        [HttpGet("GetCategories/{restaurantId}/categories")]
        public async Task<ActionResult<IEnumerable<FoodCategory>>> GetCategories()
        {
            var categories = await _foodCategoryService.GetAllCategoriesAsync();
            return Ok(categories);
        }

        [HttpPost("AddItemToOrder/{orderId}/items")]
        public async Task<ActionResult<OrderItem>> AddItemToOrder(int orderId, [FromBody] OrderItemDto itemDto)
        {
            try
            {
                var userId = GetUserId();
                var order = await _orderService.GetOrderByIdAsync(orderId);

                if (order == null || order.UserID != userId)
                    return NotFound("Order not found or doesn't belong to user");

                if (order.Status != OrderStatus.Pending)
                    return BadRequest("Order cannot be modified");

                var result = await _orderItemService.AddItemToOrderAsync(orderId, itemDto);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("RemoveItemFromOrder/{orderId}/items/{menuItemId}")]
        public async Task<IActionResult> RemoveItemFromOrder(int orderId, int menuItemId)
        {
            var userId = GetUserId();
            var order = await _orderService.GetOrderByIdAsync(orderId);

            if (order == null || order.UserID != userId)
                return NotFound("Order not found or doesn't belong to user");

            if (order.Status != OrderStatus.Pending)
                return BadRequest("Order cannot be modified");

            var success = await _orderItemService.RemoveItemFromOrderAsync(orderId, menuItemId);
            if (!success) return NotFound("Item not found in order");

            return NoContent();
        }

        [HttpPut("orders/{orderId}/items/{menuItemId}/quantity")]
        public async Task<ActionResult<OrderItem>> UpdateItemQuantity(int orderId, int menuItemId, [FromBody] int newQuantity)
        {
            try
            {
                var userId = GetUserId();
                var order = await _orderService.GetOrderByIdAsync(orderId);

                if (order == null || order.UserID != userId)
                    return NotFound("Order not found or doesn't belong to user");

                if (order.Status != OrderStatus.Pending)
                    return BadRequest("Order cannot be modified");

                var result = await _orderItemService.UpdateItemQuantityAsync(orderId, menuItemId, newQuantity);
                if (result == null) return NotFound("Item not found in order");

                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}

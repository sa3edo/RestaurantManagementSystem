using Microsoft.AspNetCore.Mvc;
using infrastructures.Services.IServices;
using Models.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.Linq;
using Models.DTO;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Utility.SignalR;
using RestaurantManagementSystem.Models;
using infrastructures.Migrations;
using Order = Models.Models.Order;
using Review = Models.Models.Review;
using infrastructures.Services;

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
        private readonly IHubContext<AdminHub> hubContext;
        private readonly UserManager<ApplicationUser> userManager;
        private readonly ITableService _tableService;
        private readonly ITimeSlotService _timeSlotService;

        public UserController(
            IMenuItemService menuItemService,
            IOrderService orderService,
            IReservationService reservationService,
            IReviewService reviewService,
            IRestaurantService restaurantService,
            IFoodCategoryService foodCategoryService,
            IOrderItemService orderItemService,
            IHubContext<AdminHub> hubContext,
            UserManager<ApplicationUser> userManager,
            ITableService tableService,
            ITimeSlotService timeSlotService)
        {
            _menuItemService = menuItemService;
            _orderService = orderService;
            _reservationService = reservationService;
            _reviewService = reviewService;
            _restaurantService = restaurantService;
            _foodCategoryService = foodCategoryService;
            _orderItemService = orderItemService;
            this.hubContext = hubContext;
            this.userManager = userManager;
            this._tableService = tableService;
            this._timeSlotService = timeSlotService;
        }

        private string GetUserId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }

        [HttpGet("GetAllRestaurant")]
        public async Task<IActionResult> GetAllRestaurant(string? search = null, int page = 1)
        {
            try
            {
                int pageSize = 10;
                var restaurants = await _restaurantService.GetAllRestaurantsAsync();

                if (restaurants == null || !restaurants.Any(r => r.Status == RestaurantStatus.Approved))
                    return NotFound(new { Message = "No approved restaurant assigned to this manager." });

                var approvedRestaurants = restaurants.Where(r => r.Status == RestaurantStatus.Approved);

                if (!string.IsNullOrEmpty(search))
                {
                    approvedRestaurants = approvedRestaurants.Where(r => r.Name.Contains(search, StringComparison.OrdinalIgnoreCase));
                }

                var pagedRestaurants = approvedRestaurants.Skip((page - 1) * pageSize).Take(pageSize);

                return Ok(new { TotalItems = approvedRestaurants.Count(), Page = page, PageSize = pageSize, Items = pagedRestaurants });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while retrieving the restaurant.", Error = ex.Message });
            }
        }
        [HttpGet("GetRestaurantDetails")]
        public async Task<IActionResult> GetRestaurantDetails(int RestaurantId)
        {
            try
            {
                var restaurant = await _restaurantService.GetRestaurantByIdAsync(RestaurantId);
                if (restaurant == null)
                {
                    return NotFound(new { Message = $"❌ Restaurant with ID {RestaurantId} not found." });
                }

                return Ok(restaurant);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Message = "❌ An error occurred while retrieving the restaurant details.",
                    Error = ex.Message
                });
            }
        }

        [HttpGet("GetRestaurantMenu/{restaurantId}/menu")]
        public async Task<IActionResult> GetRestaurantMenu(int restaurantId, string? search = null, int page = 1)
        {
            try
            {
                int pageSize = 10;
                var menu = await _menuItemService.GetMenuItemsByRestaurantAsync(restaurantId);

                if (!string.IsNullOrEmpty(search))
                {
                    menu = menu.Where(m => m.Name.Contains(search, StringComparison.OrdinalIgnoreCase));
                }

                var pagedMenu = menu.Skip((page - 1) * pageSize).Take(pageSize);

                return Ok(new { TotalItems = menu.Count(), Page = page, PageSize = pageSize, Items = pagedMenu });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while retrieving the menu.", Error = ex.Message });
            }
        }
        [HttpPost("CreateOrder")]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto orderDto)
        {
            var userId = GetUserId();
            var today = DateTime.UtcNow.Date;

            var allUserOrders = await _orderService.GetAllOrdersAsync(orderDto.RestaurantId);
            var existingOrder = allUserOrders
                .FirstOrDefault(o =>
                    o.UserID == userId &&
                    o.CreatedAt.Date == today);

            // ✅ لو عنده أوردر النهاردة، امنعه
            if (existingOrder.Status == OrderStatus.Pending)
            {
                return BadRequest("You have already placed an order .");
            }

            // ✅ لو مفيش أوردر، أنشئ واحد جديد
            var order = new Order
            {
                UserID = userId,
                RestaurantID = orderDto.RestaurantId,
                Status = OrderStatus.Pending,
                CreatedAt = DateTime.UtcNow,
                TotalAmount = 0
            };

            order = await _orderService.CreateOrderAsync(order);

            decimal totalAmount = 0;

            if (orderDto.Items != null && orderDto.Items.Any())
            {
                foreach (var itemDto in orderDto.Items)
                {
                    var menuItem = await _menuItemService.GetMenuItemByIdAsync(itemDto.MenuItemId);
                    if (menuItem == null)
                        continue;

                    var orderItem = new OrderItem
                    {
                        OrderID = order.OrderID,
                        MenuItemID = itemDto.MenuItemId,
                        Quantity = itemDto.Quantity,
                        CreatedAt = DateTime.UtcNow
                    };

                    await _orderItemService.CreateOrderItemAsync(orderItem);
                    totalAmount += menuItem.Price * itemDto.Quantity;
                }

                order.TotalAmount = totalAmount;
                await _orderService.UpdateOrderAsync(order);
            }

            await hubContext.Clients.All.SendAsync("ReceiveMessage", $"Order created by User {userId}");

            return CreatedAtAction(nameof(CreateOrder), new { id = order.OrderID }, order);
        }


        [HttpGet("orders")]
        public async Task<ActionResult> GetUserOrders()
        {
            string userId = GetUserId();
            var orders = await _orderService.GetUserOrders(userId);
            return Ok(orders);
        }
        [HttpGet("orders/{orderId}")]
        public async Task<IActionResult> GetOrderById(int orderId)
        {
            var order = await _orderService.GetOrderByIdAsync(orderId);
            if (order == null)
                return NotFound(new { Message = $"❌ Order with ID {orderId} not found." });
            var result = new
            {
                OrderId = order.OrderID,
                UserName = order.Customer?.Email,
                RestaurantName = order.Restaurant?.Name,
                Status = order.Status,
                TotalAmount = order.TotalAmount,
                MenuItems = order.OrderItems.Select(oi => new
                {
                    MenuItemId = oi.MenuItem?.MenuItemID,
                    Name = oi.MenuItem?.Name,
                    Price = oi.MenuItem?.Price,
                    Quantity = oi.Quantity
                }).ToList()
            };
            return Ok(result);
        }


        [HttpDelete("orders/{orderId}")]
        public async Task<IActionResult> CancelOrder(int orderId)
        {
            var result = await _orderService.CancelOrderAsync(orderId);
            if (!result) return BadRequest("Order cannot be canceled.");
            return NoContent();
        }

        [HttpGet("GetTables")]
        public async Task<IActionResult> GetTables(int restaurantId)
        {
            try
            {
                var tables = await _tableService.GetTablesByRestaurantAsync(restaurantId);
                if (tables == null || !tables.Any())
                    return NotFound(new { Message = "No tables found for this restaurant." });

                return Ok(tables);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while retrieving tables.", Error = ex.Message });
            }
        }
        [HttpGet("GetTimeSlots")]
        public async Task<IActionResult> GetTimeSlots(int restaurantId)
        {
            try
            {
                var timeSlots = await _timeSlotService.GetAvailableTimeSlotsAsync(restaurantId);
                if (timeSlots == null || !timeSlots.Any())
                    return NotFound(new { Message = "No time slots found for this restaurant." });

                return Ok(timeSlots);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while retrieving time slots.", Error = ex.Message });
            }
        }
        [HttpPost("CreateReservation")]
        public async Task<ActionResult> BookTable([FromBody] ReservationDto reservation)
        {
            var userId = GetUserId().ToString();

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "User is not authenticated." });
            }

            try
            {
                var reservationCreate = new Reservation()
                {
                    UserID = userId,
                    RestaurantID = reservation.RestaurantID,
                    TimeSlotID = reservation.TimeSlotID,
                    TableId = reservation.TableId,
                    ReservationDate = reservation.ReservationDate
                };

                var newReservation = await _reservationService.CreateReservationAsync(reservationCreate);

                var reservationDto = new ReservationDto
                {
                    ReservationID = newReservation.ReservationID,
                    RestaurantID = newReservation.RestaurantID,
                    TimeSlotID = newReservation.TimeSlotID,
                    TableId = newReservation.TableId,
                    ReservationDate = newReservation.ReservationDate
                };

                return CreatedAtAction(nameof(BookTable), new { id = newReservation.ReservationID }, reservationDto);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }


        [HttpGet("GetUserReservations")]
        public async Task<ActionResult> GetUserReservations()
        {
            string userId = GetUserId();
            var reservations = await _reservationService.GetUserReservations(userId);

            var result = reservations.Select(res => new
            {
                ReservationID = res.ReservationID,
                RestaurantName = res.Restaurant?.Name,
                StartTime = res.TimeSlot?.StartTime.ToString("HH:mm"),
                EndTime = res.TimeSlot?.EndTime.ToString("HH:mm"),
                TableId =res.TableId,
                ReservationDate = res.ReservationDate,
                Status=res.Status
            });

            return Ok(result);
        }

        [HttpGet("GetReservationById")]
        public async Task<ActionResult> GetReservationById(int ReservationId)
        {
            var reservations = await _reservationService.GetReservationByIdAsync(ReservationId);
            var result = new
            {
                ReservationID = reservations.ReservationID,
                RestaurantName = reservations.Restaurant?.Name,
                TimeSlotID = reservations.TimeSlotID,
                TableId = reservations.TableId,
                ReservationDate = reservations.ReservationDate,
                CreatedAt = reservations.CreatedAt,
                Status = reservations.Status,
            };
            return Ok(result);  
        }



        [HttpDelete("CancelReservation/{reservationId}")]
        public async Task<IActionResult> CancelReservation(int reservationId)
        {
            var reserve = await _reservationService.GetReservationByIdAsync(reservationId);
            if (reserve == null)
                return NotFound("Reservation not found.");

            var today = DateOnly.FromDateTime(DateTime.Now);
            if (reserve.Status == ReservationStatus.Confirmed &&
                reserve.ReservationDate >= today &&
                reserve.ReservationDate <= today.AddDays(1))
            {
                return BadRequest("You cannot cancel a confirmed reservation on the same day or one day before.");
            }

            var result = await _reservationService.CancelReservationAsync(reservationId);
            if (!result)
                return BadRequest("Reservation not found or cannot be canceled.");

            return NoContent();
        }


        [HttpPost("CreateReview")]
        public async Task<ActionResult> CreateReview([FromBody] Review review)
        {
            var UserId= GetUserId().ToString();
            review.UserID = UserId;
            var newReview = await _reviewService.CreateReviewAsync(review);
            return CreatedAtAction(nameof(CreateReview), new { id = newReview.ReviewID }, newReview);
        }

        [HttpGet("GetCategories/{restaurantId}/categories")]
        public async Task<ActionResult> GetCategories([FromQuery] int restaurantId)
        {
            if (restaurantId==0)
                return BadRequest(new { Message = "❌ RestaurantId is required." });
            var categories = await _foodCategoryService.GetAllCategoriesAsync(restaurantId);
            return Ok(categories);
        }

        [HttpPost("AddItemToOrder/{orderId}/items")]
        public async Task<ActionResult> AddItemToOrder(int orderId, [FromBody] OrderItemDto itemDto)
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
        public async Task<ActionResult> UpdateItemQuantity(int orderId, int menuItemId, [FromBody] int newQuantity)
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

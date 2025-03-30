using infrastructures.Services.IServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Models.Models;
using RestaurantManagementSystem.DTO;
using RestaurantManagementSystem.Models;
using RestaurantManagementSystem.Utility;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using System.Threading.Tasks;
using Utility.SignalR;

namespace RestaurantManagementSystem.Controllers
{
    [Route("api/admin")]
    [ApiController]
    [Authorize(Roles = SD.adminRole)] 
    public class AdminController : ControllerBase
    {
        private readonly IFoodCategoryService _foodCategoryService;
        private readonly IRestaurantService _restaurantService;
        private readonly IOrderService _orderService;
        private readonly IReservationService _reservationService;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IHubContext<AdminHub> _hubContext;

        public AdminController(
            IFoodCategoryService foodCategoryService,
            IRestaurantService restaurantService,
            IOrderService orderService,
            IReservationService reservationService,
            UserManager<ApplicationUser> userManager,
            IHubContext<AdminHub> hubContext)
        {
            _foodCategoryService = foodCategoryService;
            _restaurantService = restaurantService;
            _orderService = orderService;
            _reservationService = reservationService;
            _userManager = userManager;
            _hubContext = hubContext;
        }
        [HttpPut("AddRestaurantManager")]
        public async Task<IActionResult> AddRestaurantManager(string Email)
        {
            if (string.IsNullOrWhiteSpace(Email))
                return BadRequest("Email is required.");

            try
            {
               
                var user = await _userManager.FindByEmailAsync(Email);
                if (user == null)
                    return NotFound($"User with email {Email} not found.");

                if (await _userManager.IsInRoleAsync(user, "RestaurantManager"))
                    return BadRequest("User is already a Restaurant Manager.");

                var currentRoles = await _userManager.GetRolesAsync(user);
                await _userManager.RemoveFromRolesAsync(user, currentRoles);

                var roleResult = await _userManager.AddToRoleAsync(user, SD.RestaurantManagerRole);
                if (!roleResult.Succeeded)
                    return StatusCode(500, "Failed to assign role.");

                return Ok(new
                {
                    Success = true,
                    Message = "User role updated to Restaurant Manager.",
                    User = new { user.Id, user.Email, user.UserName }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Success = false,
                    Message = "An error occurred while updating the user role.",
                    Error = ex.Message
                });
            }
        }
        [HttpDelete("DeleteUser")]
        public async Task<IActionResult> DeleteUser(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return BadRequest("Email is required.");

            try
            {
                // Find user by email
                var user = await _userManager.FindByEmailAsync(email);
                if (user == null)
                    return NotFound($"User with email {email} not found.");
                    
                // Delete user
                var result = await _userManager.DeleteAsync(user);
                if (!result.Succeeded)
                    return StatusCode(500, "Failed to delete user.");

                return Ok(new { Success = true, Message = $"User {email} deleted successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Success = false, Message = "An error occurred.", Error = ex.Message });
            }
        }
        [HttpPut("lock-user/{userId}")]
        public async Task<IActionResult> LockUser(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return NotFound("User not found.");

            await _userManager.SetLockoutEndDateAsync(user, DateTime.UtcNow.AddMinutes(30));
            return Ok($"✅ User {user.Email} has been locked.");
        }

        [HttpPut("unlock-user/{userId}")]
        public async Task<IActionResult> UnlockUser(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return NotFound("User not found.");

            await _userManager.SetLockoutEndDateAsync(user, null); // Remove lockout
            await _userManager.ResetAccessFailedCountAsync(user); // Reset failed login attempts
            return Ok($"✅ User {user.Email} has been unlocked.");
        }

        // ------------------------ Restaurant Management ------------------------



        [HttpGet("GetAllRestaurants")]
        public async Task<IActionResult> GetAllRestaurants([FromQuery] int page = 1, [FromQuery] string searchQuery = "")
        {
            try
            {
                int pageSize = 10;
                var restaurants =await _restaurantService.GetAllRestaurantsAsync();

                if (!string.IsNullOrEmpty(searchQuery))
                {
                    restaurants = restaurants.Where(r => r.Name.Contains(searchQuery, StringComparison.OrdinalIgnoreCase) ||
                                                         r.Location.Contains(searchQuery, StringComparison.OrdinalIgnoreCase));
                }

                int totalCount = restaurants.Count();
                var paginatedRestaurants = restaurants.Skip((page - 1) * pageSize).Take(pageSize).ToList();

                return Ok(new { TotalCount = totalCount, Page = page, PageSize = pageSize, Data = paginatedRestaurants });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"❌ Error: {ex.Message}");
            }
        }

        [HttpPost("CreateRestaurant")]
        public async Task<IActionResult> CreateRestaurant([FromBody] Restaurant restaurant,IFormFile? RestImg)
        {
            if (restaurant == null) return BadRequest("Invalid restaurant data.");

            try
            {
                restaurant.Status = (RestaurantStatus)ReservationStatus.Confirmed;
               await  _restaurantService.CreateRestaurantAsync(restaurant, RestImg);
                await _hubContext.Clients.All.SendAsync("ReceiveUpdate", "RestaurantAdded", restaurant);
                return CreatedAtAction(nameof(GetAllRestaurants), new { id = restaurant.RestaurantID }, restaurant);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"❌ Error: {ex.Message}");
            }
        }

        [HttpPut("UpdateRestaurant/{restaurantId}")]
        public async Task<IActionResult> UpdateRestaurant(int restaurantId, [FromBody] Restaurant restaurant, IFormFile? RestImg)
        {
            if (restaurant == null || restaurant.RestaurantID != restaurantId)
                return BadRequest("Invalid restaurant ID.");

            try
            {
                await  _restaurantService.UpdateRestaurantAsync(restaurantId,restaurant, RestImg);
                await _hubContext.Clients.All.SendAsync("ReceiveUpdate", "RestaurantUpdated", restaurant);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"❌ Error: {ex.Message}");
            }
        }

        [HttpDelete("DeleteRestaurant/{restaurantId}")]
        public async Task<IActionResult> DeleteRestaurant(int restaurantId)
        {
            try
            {
                await _restaurantService.DeleteRestaurantAsync(restaurantId);
                await _hubContext.Clients.All.SendAsync("ReceiveUpdate", "RestaurantDeleted", restaurantId);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"❌ Error: {ex.Message}");
            }
        }

        [HttpPut("restaurants/{restaurantId}/approve")]
        public IActionResult ApproveRestaurant(int restaurantId)
        {
            try
            {
                _restaurantService.ApproveRestaurantAsync(restaurantId);
                return Ok("✅ Restaurant approved.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"❌ Error: {ex.Message}");
            }
        }

        [HttpPut("restaurants/{restaurantId}/reject")]
        public IActionResult RejectRestaurant(int restaurantId)
        {
            try
            {
                _restaurantService.RejectRestaurantAsync(restaurantId);
                return Ok("❌ Restaurant rejected.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"❌ Error: {ex.Message}");
            }
        }

        // ------------------------ Food Category Management ------------------------

        [HttpGet("GetAllFoodCategoriesAsync")]
        public async Task<IActionResult> GetAllFoodCategoriesAsync([FromQuery] int page = 1, [FromQuery] string searchQuery = "")
        {
            try
            {
                int pageSize = 10;
                var categories = await _foodCategoryService.GetAllCategoriesAsync();

                if (!string.IsNullOrEmpty(searchQuery))
                {
                    categories = categories.Where(c => c.Name.Contains(searchQuery, StringComparison.OrdinalIgnoreCase));
                }

                int totalCount = categories.Count();
                var paginatedCategories = categories.Skip((page - 1) * pageSize).Take(pageSize).ToList();

                return Ok(new { TotalCount = totalCount, Page = page, PageSize = pageSize, Data = paginatedCategories });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"❌ Error: {ex.Message}");
            }
        }

        [HttpPost("AddFoodCategory")]
        public IActionResult AddFoodCategory([FromBody] FoodCategory category)
        {
            if (category == null) return BadRequest("Invalid category data.");

            try
            {
                _foodCategoryService.CreateCategoryAsync(category);
                return CreatedAtAction(nameof(GetAllFoodCategoriesAsync), new { id = category.CategoryID }, category);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"❌ Error: {ex.Message}");
            }
        }

        [HttpPut("UpdateFoodCategory/{categoryId}")]
        public IActionResult UpdateFoodCategory(int categoryId, [FromBody] FoodCategory category)
        {
            if (category == null || category.CategoryID != categoryId)
                return BadRequest("Invalid category ID.");

            try
            {
                _foodCategoryService.UpdateCategoryAsync(categoryId,category);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"❌ Error: {ex.Message}");
            }
        }

        [HttpDelete("DeleteFoodCategory/{categoryId}")]
        public IActionResult DeleteFoodCategory(int categoryId)
        {
            try
            {
                _foodCategoryService.DeleteCategoryAsync(categoryId);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"❌ Error: {ex.Message}");
            }
        }
        [HttpGet("GetAllOrders")]
        public async Task<IActionResult> GetAllOrders(int RestaurantId,[FromQuery] OrderStatus? status, [FromQuery] int page = 1)
        {
            try
            {
                int pageSize = 10;
                var orders = await _orderService.GetAllOrdersAsync(RestaurantId);
                if (status.HasValue)
                {
                    orders = orders.Where(r => r.Status.ToString().Equals(status.Value.ToString(), StringComparison.OrdinalIgnoreCase));
                }
                
                int totalCount = orders.Count();
                var paginatedOrders = orders.Skip((page - 1) * pageSize).Take(pageSize).ToList();

                return Ok(new { TotalCount = totalCount, Page = page, PageSize = pageSize, Data = paginatedOrders });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"❌ Error: {ex.Message}");
            }
        }

        [HttpPut("UpdateOrderStatus/{orderId}/status")]
        public async Task<IActionResult> UpdateOrderStatus(int orderId, [FromBody] OrderStatus newStatus)
        {
            try
            {
                await _orderService.UpdateOrderStatusAsync(orderId, newStatus);
                await _hubContext.Clients.All.SendAsync("ReceiveUpdate", "OrderStatusUpdated", new { OrderId = orderId, Status = newStatus });
                return Ok($"✅ Order {orderId} status updated to {newStatus}.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"❌ Error: {ex.Message}");
            }
        }
        [HttpGet("GetAllReservations")]
        public async Task<IActionResult> GetAllReservations( [FromQuery] ReservationStatus? status, [FromQuery] int restaurantId, [FromQuery] int page = 1)
        {
            try
            {
                if (restaurantId <= 0)
                    return BadRequest("Invalid restaurant ID.");

                int pageSize = 10;

                
                var reservations = await _reservationService.GetReservationsByRestaurantAsync(restaurantId);

              
                if (status.HasValue)
                {
                    reservations = reservations.Where(r => r.Status.ToString().Equals(status.Value.ToString(), StringComparison.OrdinalIgnoreCase));
                }

                int totalCount = reservations.Count();
                var paginatedReservations = reservations
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToList();

                return Ok(new
                {
                    Success = true,
                    Message = "Reservations fetched successfully.",
                    TotalCount = totalCount,
                    Page = page,
                    PageSize = pageSize,
                    Data = paginatedReservations
                });
            }
            catch (Exception ex)
            {
           
                return StatusCode(500, new
                {
                    Success = false,
                    Message = "An error occurred while fetching reservations.",
                    Error = ex.Message
                });
            }
        }
    }
}

using infrastructures.Services.IServices;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Models.Models;
using System.Collections.Generic;
using Utility.SignalR;

namespace RestaurantManagementSystem.Controllers
{
    [Route("api/admin")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;
        private readonly IHubContext<AdminHub> _hubContext;

        public AdminController(IAdminService adminService, IHubContext<AdminHub> hubContext)
        {
            _adminService = adminService;
            _hubContext = hubContext;
        }

        // ------------------------ Restaurant Management ------------------------

        // Get all restaurants
        [HttpGet("GetAllRestaurants")]
        public IActionResult GetAllRestaurants([FromQuery] int page = 1, [FromQuery] string searchQuery = "")
        {
            int pageSize = 10;
            var restaurants = _adminService.GetAllRestaurants();

            
            if (!string.IsNullOrEmpty(searchQuery))
            {
                restaurants = restaurants.Where(r => r.Name.Contains(searchQuery, StringComparison.OrdinalIgnoreCase) ||
                                                     r.Location.Contains(searchQuery, StringComparison.OrdinalIgnoreCase));
            }
            int totalCount = restaurants.Count();

            var paginatedRestaurants = restaurants.Skip((page - 1) * pageSize).Take(pageSize).ToList();

            
            var response = new
            {
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                Data = paginatedRestaurants
            };

            return Ok(response);
        }

        [HttpPost("CreateRestaurant")]
        public async Task<IActionResult> CreateRestaurant([FromBody] Restaurant restaurant)
        {
            if (restaurant == null) return BadRequest("Invalid restaurant data.");

            _adminService.CreateRestaurant(restaurant);
            await _hubContext.Clients.All.SendAsync("ReceiveUpdate", "RestaurantAdded", restaurant);

            return CreatedAtAction(nameof(GetAllRestaurants), new { id = restaurant.RestaurantID }, restaurant);
        }


        // Update a restaurant
        [HttpPut("UpdateRestaurant/{restaurantId}")]
        public async Task<IActionResult> UpdateRestaurant(int restaurantId, [FromBody] Restaurant restaurant)
        {
            if (restaurant == null || restaurant.RestaurantID != restaurantId)
                return BadRequest("Invalid restaurant ID.");

            _adminService.UpdateRestaurant(restaurant);
            await _hubContext.Clients.All.SendAsync("ReceiveUpdate", "RestaurantUpdated", restaurant);

            return NoContent();
        }


        // Delete a restaurant
        [HttpDelete("DeleteRestaurant/{restaurantId}")]
        public async Task<IActionResult> DeleteRestaurant(int restaurantId)
        {
            _adminService.DeleteRestaurant(restaurantId);
            await _hubContext.Clients.All.SendAsync("ReceiveUpdate", "RestaurantDeleted", restaurantId);

            return NoContent();
        }


        // Approve a restaurant
        [HttpPut("ApproveRestaurant/{restaurantId}/approve")]
        public IActionResult ApproveRestaurant(int restaurantId)
        {
            var restaurant = _adminService.GetAllRestaurants();
            if (restaurant == null) return NotFound("Restaurant not found.");

            _adminService.ApproveRestaurant(restaurantId);
            return Ok("Restaurant approved.");
        }

        // Reject a restaurant
        [HttpPut("RejectRestaurant/{restaurantId}/reject")]
        public IActionResult RejectRestaurant(int restaurantId)
        {
            var restaurant = _adminService.GetAllRestaurants();
            if (restaurant == null) return NotFound("Restaurant not found.");

            _adminService.RejectRestaurant(restaurantId);
            return Ok("Restaurant rejected.");
        }

        // ------------------------ Food Category Management ------------------------

        // Get all food categories
        [HttpGet("GetAllFoodCategories")]
        public IActionResult GetAllFoodCategories([FromQuery] int page = 1, [FromQuery] string searchQuery = "")
        {
            int pageSize = 10;
            var categories = _adminService.GetAllFoodCategories();

            // Apply Search Filter
            if (!string.IsNullOrEmpty(searchQuery))
            {
                categories = categories.Where(c => c.Name.Contains(searchQuery, StringComparison.OrdinalIgnoreCase));
            }

            // Get Total Count After Filtering
            int totalCount = categories.Count();

            // Apply Pagination
            var paginatedCategories = categories.Skip((page - 1) * pageSize).Take(pageSize).ToList();

            var response = new
            {
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                Data = paginatedCategories
            };

            return Ok(response);
        }


        // Add a new food category
        [HttpPost("AddFoodCategory")]
        public IActionResult AddFoodCategory([FromBody] FoodCategory category)
        {
            if (category == null) return BadRequest("Invalid category data.");

            _adminService.AddFoodCategory(category);
            return CreatedAtAction(nameof(GetAllFoodCategories), new { id = category.CategoryID }, category);
        }

        // Update a food category
        [HttpPut("UpdateFoodCategory/{categoryId}")]
        public IActionResult UpdateFoodCategory(int categoryId, [FromBody] FoodCategory category)
        {
            if (category == null || category.CategoryID != categoryId)
                return BadRequest("Invalid category ID.");

            _adminService.UpdateFoodCategory(category);
            return NoContent();
        }

        // Delete a food category
        [HttpDelete("DeleteFoodCategory/{categoryId}")]
        public IActionResult DeleteFoodCategory(int categoryId)
        {
            _adminService.DeleteFoodCategory(categoryId);
            return NoContent();
        }

        // ------------------------ Order Monitoring ------------------------

        // Monitor orders
        [HttpGet("MonitorOrders/monitor")]
        public IActionResult MonitorOrders()
        {
            _adminService.MonitorOrders();
            return Ok("Orders monitored. Check logs for details.");
        }

        // ------------------------ Customer Support (Future Scope) ------------------------

        // Handle customer support request
        //[HttpPut("support/{requestId}/resolve")]
        //public IActionResult HandleCustomerSupport(int requestId)
        //{
        //    _adminService.HandleCustomerSupport(requestId);
        //    return Ok("Customer support request resolved.");
        //}
    }
}

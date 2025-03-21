using infrastructures.Services.IServices;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Models.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Utility.SignalR;

namespace RestaurantManagementSystem.Controllers
{
    [Route("api/admin")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly IFoodCategoryService foodCategoryService;
        private readonly IRestaurantService restaurantService;
        private readonly IOrderService orderService;
        private readonly IHubContext<AdminHub> _hubContext;

        public AdminController(IFoodCategoryService foodCategoryService, IRestaurantService restaurantService, IOrderService orderService, IHubContext<AdminHub> hubContext)
        {
            this.foodCategoryService = foodCategoryService;
            this.restaurantService = restaurantService;
            this.orderService = orderService;
            _hubContext = hubContext;
        }

        // ------------------------ Restaurant Management ------------------------

        [HttpGet("GetAllRestaurants")]
        public IActionResult GetAllRestaurants([FromQuery] int page = 1, [FromQuery] string searchQuery = "")
        {
            try
            {
                int pageSize = 10;
                var restaurants = restaurantService.GetAllRestaurants();

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
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpPost("CreateRestaurant")]
        public async Task<IActionResult> CreateRestaurant([FromBody] Restaurant restaurant)
        {
            try
            {
                if (restaurant == null) return BadRequest("Invalid restaurant data.");

                restaurantService.CreateRestaurant(restaurant);
                await _hubContext.Clients.All.SendAsync("ReceiveUpdate", "RestaurantAdded", restaurant);

                return CreatedAtAction(nameof(GetAllRestaurants), new { id = restaurant.RestaurantID }, restaurant);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpPut("UpdateRestaurant/{restaurantId}")]
        public async Task<IActionResult> UpdateRestaurant(int restaurantId, [FromBody] Restaurant restaurant)
        {
            try
            {
                if (restaurant == null || restaurant.RestaurantID != restaurantId)
                    return BadRequest("Invalid restaurant ID.");

                restaurantService.UpdateRestaurant(restaurant);
                await _hubContext.Clients.All.SendAsync("ReceiveUpdate", "RestaurantUpdated", restaurant);

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpDelete("DeleteRestaurant/{restaurantId}")]
        public async Task<IActionResult> DeleteRestaurant(int restaurantId)
        {
            try
            {
                restaurantService.DeleteRestaurant(restaurantId);
                await _hubContext.Clients.All.SendAsync("ReceiveUpdate", "RestaurantDeleted", restaurantId);

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpPut("ApproveRestaurant/{restaurantId}/approve")]
        public IActionResult ApproveRestaurant(int restaurantId)
        {
            try
            {
                restaurantService.ApproveRestaurant(restaurantId);
                return Ok("Restaurant approved.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpPut("RejectRestaurant/{restaurantId}/reject")]
        public IActionResult RejectRestaurant(int restaurantId)
        {
            try
            {
                restaurantService.RejectRestaurant(restaurantId);
                return Ok("Restaurant rejected.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        // ------------------------ Food Category Management ------------------------

        [HttpGet("GetAllFoodCategories")]
        public IActionResult GetAllFoodCategories([FromQuery] int page = 1, [FromQuery] string searchQuery = "")
        {
            try
            {
                int pageSize = 10;
                var categories = foodCategoryService.GetAllFoodCategories();

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
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpPost("AddFoodCategory")]
        public IActionResult AddFoodCategory([FromBody] FoodCategory category)
        {
            try
            {
                if (category == null) return BadRequest("Invalid category data.");

                foodCategoryService.AddFoodCategory(category);
                return CreatedAtAction(nameof(GetAllFoodCategories), new { id = category.CategoryID }, category);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpPut("UpdateFoodCategory/{categoryId}")]
        public IActionResult UpdateFoodCategory(int categoryId, [FromBody] FoodCategory category)
        {
            try
            {
                if (category == null || category.CategoryID != categoryId)
                    return BadRequest("Invalid category ID.");

                foodCategoryService.UpdateFoodCategory(category);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpDelete("DeleteFoodCategory/{categoryId}")]
        public IActionResult DeleteFoodCategory(int categoryId)
        {
            try
            {
                foodCategoryService.DeleteFoodCategory(categoryId);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        // ------------------------ Order Monitoring ------------------------

        [HttpGet("MonitorOrders/monitor")]
        public IActionResult MonitorOrders()
        {
            try
            {
                orderService.MonitorOrders();
                return Ok("Orders monitored. Check logs for details.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }
    }
}

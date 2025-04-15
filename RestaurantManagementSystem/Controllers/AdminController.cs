using infrastructures.Services.IServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Models.Models;
using RestaurantManagementSystem.Models;
using RestaurantManagementSystem.Utility;
using System.Threading.Tasks;
using Utility.SignalR;


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
    [HttpGet("GetAllUsers")]
    public async Task<IActionResult> GetAllUsers(string? search, int pageNumber = 1)
    {
        int pageSize = 15;
        try
        {
            var query = _userManager.Users.AsQueryable();
            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(u => u.Email.Contains(search));
            }
            var totalUsers = await query.CountAsync();
            var users = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
            var result = new List<object>();

            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);

                result.Add(new
                {
                    user.Id,
                    user.Email,
                    Roles = roles
                });
            }
            return Ok(new
            {
                TotalCount = totalUsers,
                PageNumber = pageNumber,
                PageSize = pageSize,
                Users = result
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Success = false, Message = "An error occurred.", Error = ex.Message });
        }
    }



    [HttpPut("AddRestaurantManager")]
    public async Task<IActionResult> AddRestaurantManager([FromForm] string Email)
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
    public async Task<IActionResult> DeleteUser([FromForm] string email)
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
    [HttpPut("lock-user")]
    public async Task<IActionResult> LockUser([FromForm] string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            return NotFound("User not found.");

        await _userManager.SetLockoutEndDateAsync(user, DateTime.UtcNow.AddDays(30));
        return Ok($"✅ User {user.Email} has been locked.");
    }

    [HttpPut("unlock-user")]
    public async Task<IActionResult> UnlockUser([FromForm] string userId)
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
            var restaurants = await _restaurantService.GetAllRestaurantsAsync();

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

    [HttpPost("CreateAdminRestaurant")]
    public async Task<IActionResult> CreateRestaurant([FromForm] Models.Models.Restaurant restaurant, IFormFile? RestImg)
    {
        try
        {
            var userManagerId = _userManager.GetUserId(User);
            if (userManagerId == null)
                return Unauthorized(new { Message = "Unauthorized access." });

            restaurant.ManagerID = userManagerId;
            restaurant.Status = (RestaurantStatus)ReservationStatus.Confirmed;
            await _restaurantService.CreateRestaurantAsync(restaurant, RestImg);
            await _hubContext.Clients.All.SendAsync("ReceiveUpdate", "RestaurantAdded", restaurant);
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"❌ Error: {ex.Message}");
        }
    }


    [HttpPut("UpdateAdminRestaurant")]
    public async Task<IActionResult> UpdateRestaurant(int restaurantId, [FromForm]Models.Models.Restaurant restaurant, IFormFile? RestImg)
    {
        try
        {
            var userManagerId = _userManager.GetUserId(User);
            if (userManagerId == null)
                return Unauthorized(new { Message = "Unauthorized access." });

            restaurant.ManagerID = userManagerId;
            await _restaurantService.UpdateRestaurantAsync(restaurantId, restaurant, RestImg);
            await _hubContext.Clients.All.SendAsync("ReceiveUpdate", "RestaurantUpdated", restaurant);

            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "An error occurred while updating the restaurant.", Error = ex.Message });
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
    public async Task<IActionResult> ApproveRestaurantAsync(int restaurantId)
    {
        try
        {
           await _restaurantService.ApproveRestaurantAsync(restaurantId);
            return Ok("✅ Restaurant approved.");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"❌ Error: {ex.Message}");
        }
    }

    [HttpPut("restaurants/{restaurantId}/reject")]
    public async Task<IActionResult> RejectRestaurant(int restaurantId)
    {
        try
        {
            await _restaurantService.RejectRestaurantAsync(restaurantId);
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
        var user = _userManager.GetUserId(User);
        try
        {
            int pageSize = 10;
            var categories = await _foodCategoryService.GetAllCategoriesAsync(user);
                    
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
    public async Task<IActionResult> AddFoodCategory([FromBody] Models.Models.FoodCategory category)
    {
        if (category == null)
            return BadRequest(new { Success = false, Message = "Invalid category data." });

        try
        {
            var user = _userManager.GetUserId(User);
            category.UserId = user;

            await _foodCategoryService.CreateCategoryAsync(category);
            await _hubContext.Clients.All.SendAsync("CategoryAdded", category);

            return Ok(new { Success = true, Message = "Category created successfully", Category = category });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Success = false, Message = ex.Message });
        }
    }

    [HttpPut("UpdateFoodCategory/{categoryId}")]
    public async Task<IActionResult> UpdateFoodCategory(int categoryId, Models.Models.FoodCategory category)
    {
        if (category == null || category.CategoryID != categoryId)
            return BadRequest(new { Success = false, Message = "Invalid category ID." });

        try
        {
            var user = _userManager.GetUserId(User);
            category.UserId = user;

            await _foodCategoryService.UpdateCategoryAsync(categoryId, category);
            await _hubContext.Clients.All.SendAsync("CategoryUpdated", category);

            return Ok(new
            {
                Success = true,
                Message = "Category updated successfully",
                Category = category
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Success = false, Message = ex.Message });
        }
    }
    [HttpDelete("DeleteFoodCategory/{categoryId}")]
    public async Task<IActionResult> DeleteFoodCategory(int categoryId)
    {
        if (categoryId <= 0)
            return BadRequest(new { Success = false, Message = "Invalid category ID." });

        try
        {
            var category = await _foodCategoryService.GetCategoryByIdAsync(categoryId);
            if (category == null)
                return NotFound(new { Success = false, Message = "Category not found." });

            await _foodCategoryService.DeleteCategoryAsync(categoryId);
            await _hubContext.Clients.All.SendAsync("CategoryDeleted", categoryId);

            return Ok(new { Success = true, Message = "Category deleted successfully." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Success = false, Message = ex.Message });
        }
    }

    [HttpGet("GetAllOrders")]
    public async Task<IActionResult> GetAllOrders(int RestaurantId, [FromQuery] Models.Models.OrderStatus? status, [FromQuery] int page = 1)
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
    public async Task<IActionResult> UpdateOrderStatus(int orderId, [FromForm] Models.Models.OrderStatus newStatus)
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
    public async Task<IActionResult> GetAllReservations([FromQuery] Models.Models.ReservationStatus? status, [FromQuery] int restaurantId, [FromQuery] int page = 1)
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


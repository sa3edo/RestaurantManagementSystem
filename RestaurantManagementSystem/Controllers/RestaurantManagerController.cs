using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using infrastructures.Services.IServices;
using Models.Models;
using Microsoft.AspNetCore.Identity;
using RestaurantManagementSystem.Models;
using Utility.SignalR;
using RestaurantManagementSystem.Utility;
using infrastructures.Repository;
using infrastructures.Services;

[Route("api/restaurant-manager")]
[ApiController]
[Authorize(Roles = SD.RestaurantManagerRole)]
public class RestaurantManagerController : ControllerBase
{
    private readonly IMenuItemService _menuItemService;
    private readonly IOrderService _orderService;
    private readonly IReservationService _reservationService;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IRestaurantService _restaurantService;
    private readonly IHubContext<AdminHub> _hubContext;
    private readonly ITimeSlotService _timeSlotService;
    private readonly ITableService _tableService;
    private readonly IFoodCategoryService _foodCategoryService;

    public RestaurantManagerController(
        IMenuItemService menuItemService,
        IOrderService orderService,
        IReservationService reservationService,
        UserManager<ApplicationUser> userManager,
        IRestaurantService restaurantService,
        IHubContext<AdminHub> hubContext,
        ITimeSlotService timeSlotService,
        ITableService tableService,
        IFoodCategoryService foodCategoryService
        )
    {
        _menuItemService = menuItemService;
        _orderService = orderService;
        _reservationService = reservationService;
        _userManager = userManager;
        _restaurantService = restaurantService;
        _hubContext = hubContext;
        _timeSlotService = timeSlotService;
        _tableService = tableService;
        _foodCategoryService = foodCategoryService;
    }

    // ------------------------ Restaurant Management ------------------------
    

    [HttpGet("GetRestaurant")]
    public async Task<IActionResult> GetRestaurant([FromQuery] string? search, [FromQuery] int pageNumber = 1)
    {
        int pageSize = 10;
        try
        {

            var userManagerId = _userManager.GetUserId(User);
            var restaurants = await _restaurantService.GetAllRestaurantsAsync(userManagerId);

            if (restaurants == null || !restaurants.Any(r => r.Status == RestaurantStatus.Approved))
                return NotFound(new { Message = "No approved restaurant assigned to this manager." });

            var approvedRestaurants = restaurants.Where(r => r.Status == RestaurantStatus.Approved);

            if (!string.IsNullOrEmpty(search))
            {
                approvedRestaurants = approvedRestaurants.Where(r => r.Name.Contains(search, StringComparison.OrdinalIgnoreCase));
            }

            var totalRecords = approvedRestaurants.Count();
            var pagedRestaurants = approvedRestaurants
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            return Ok(new
            {
                TotalRecords = totalRecords,
                PageNumber = pageNumber,
                PageSize = pageSize,
                Restaurants = pagedRestaurants
            });
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

    [HttpPost("CreateMangerRestaurant")]
    public async Task<IActionResult> CreateRestaurant([FromForm] Models.Models.Restaurant restaurant, IFormFile? RestImg)
    {
        try
        {
            var userManagerId = _userManager.GetUserId(User);
            if (userManagerId == null)
                return Unauthorized(new { Message = "Unauthorized access." });

            restaurant.ManagerID = userManagerId;
            restaurant.Status = (RestaurantStatus)ReservationStatus.Pending;
            await _restaurantService.CreateRestaurantAsync(restaurant, RestImg);
            await _hubContext.Clients.All.SendAsync("ReceiveUpdate", "RestaurantAdded", restaurant);
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"❌ Error: {ex.Message}");
        }
    }
    [HttpPut("UpdateMangerRestaurant")]
    public async Task<IActionResult> UpdateRestaurant(int restaurantId, [FromForm] Models.Models.Restaurant restaurant, IFormFile? RestImg)
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
    [HttpDelete("DeleteMangerRestaurant/{restaurantId}")]
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
    // ------------------------ Menu Management ------------------------

    [HttpGet("GetMenuItems")]
    public async Task<IActionResult> GetMenuItems(int restaurantId, string? search = null, int page = 1)
    {
        int pageSize = 10;
        try
        {
            var restaurant = await _restaurantService.GetRestaurantByIdAsync(restaurantId);
            if (restaurant == null)
                return NotFound(new { Message = "Restaurant not found." });

            var menuItems = await _menuItemService.GetMenuItemsByRestaurantAsync(restaurant.RestaurantID);

            if (!string.IsNullOrEmpty(search))
            {
                menuItems = menuItems.Where(m => m.Name.Contains(search, StringComparison.OrdinalIgnoreCase));
            }

            var pagedMenuItems = menuItems.Skip((page - 1) * pageSize).Take(pageSize);

            return Ok(new { TotalItems = menuItems.Count(), Page = page, PageSize = pageSize, Items = pagedMenuItems });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "An error occurred while retrieving menu items.", Error = ex.Message });
        }
    }

    [HttpPost("CreateMenuItem")]
    public async Task<IActionResult> CreateMenuItem(int restaurantId, [FromForm] Models.Models.MenuItem menuItem, IFormFile? MenuImg)
    {
        try
        {
            var restaurant = await _restaurantService.GetRestaurantByIdAsync(restaurantId);
            if (restaurant == null)
                return NotFound(new { Message = "Restaurant not found." });

            menuItem.RestaurantID = restaurant.RestaurantID;
            await _menuItemService.CreateMenuItemAsync(menuItem, MenuImg);

            return CreatedAtAction(nameof(GetMenuItems), new { id = menuItem.MenuItemID }, menuItem);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
        catch (Exception ex)
        {
            var baseException = ex.GetBaseException().Message;
            return StatusCode(500, new
            {
                Message = "An unexpected error occurred.",
                Error = baseException
            });
        }

    }
    [HttpGet("GetMenuItemById/{menuItemId}")]
    public async Task<IActionResult> GetMenuItemById(int menuItemId)
    {
        try
        {
            var menuItem = await _menuItemService.GetMenuItemByIdAsync(menuItemId);
            if (menuItem == null)
                return NotFound(new { Message = $"Menu item with ID {menuItemId} not found." });

            return Ok(menuItem);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "An error occurred while retrieving the menu item.", Error = ex.Message });
        }
    }


    [HttpPut("UpdateMenuItem/{menuItemId}")]
    public async Task<IActionResult> UpdateMenuItem(int menuItemId, [FromForm] Models.Models.MenuItem menuItem, IFormFile? MenuImg)
    {
        try
        {
            var existingItem = await _menuItemService.GetMenuItemByIdAsync(menuItemId);
            if (existingItem == null)
                return NotFound(new { Message = "Menu item not found." });

            var updatedItem = await _menuItemService.UpdateMenuItemAsync(menuItemId, menuItem, MenuImg);
            if (updatedItem == null)
                return StatusCode(500, new { Message = "Failed to update menu item." });

            return Ok(new { Message = "Menu item updated successfully.", MenuItem = updatedItem });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "An error occurred while updating the menu item.", Error = ex.Message });
        }
    }

    [HttpDelete("DeleteMenuItem/{id}")]
    public async Task<IActionResult> DeleteMenuItem(int id)
    {
        try
        {
            var existingItem = await _menuItemService.GetMenuItemByIdAsync(id);
            if (existingItem == null)
                return NotFound(new { Message = "Menu item not found." });

            await _menuItemService.DeleteMenuItemAsync(id);
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "An error occurred while deleting the menu item.", Error = ex.Message });
        }
    }

    // ------------------------ Order Management ------------------------
    [HttpGet("GetAllOrdersByRestaurant/{restaurantId}")]
    public async Task<IActionResult> GetAllOrdersByRestaurant(int restaurantId)
    {
        try
        {
            var restaurant = await _restaurantService.GetRestaurantByIdAsync(restaurantId);
            if (restaurant == null)
                return NotFound(new { Message = $"Restaurant with ID {restaurantId} not found." });

            var orders = await _orderService.GetAllOrdersAsync(restaurantId);
            return Ok(orders);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "An error occurred while retrieving orders.", Error = ex.Message });
        }
    }
    [HttpGet("GetOrderById/{orderId}")]
    public async Task<IActionResult> GetOrderById(int orderId)
    {
        try
        {
            var order = await _orderService.GetOrderByIdAsync(orderId);
            if (order == null)
                return NotFound(new { Message = $"Order with ID {orderId} not found." });

            return Ok(order);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "An error occurred while retrieving the order.", Error = ex.Message });
        }
    }

    [HttpPut("orders/{orderId}/UpdateOrderStatus")]
    public async Task<IActionResult> UpdateOrderStatus(int orderId,OrderStatus newStatus)
    {
        try
        {
            var order = await _orderService.GetOrderByIdAsync(orderId);
            if (order == null)
                return NotFound(new { Message = "Order not found." });

            await _orderService.UpdateOrderStatusAsync(orderId, newStatus);
            return Ok(new { Message = $"Order {orderId} status updated to {newStatus}." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "An error occurred while updating order status.", Error = ex.Message });
        }
    }

    [HttpDelete("orders/{orderId}/cancel")]
    public async Task<IActionResult> DeleteOrder(int orderId)
    {
        try
        {
            var order = await _orderService.CancelOrderAsync(orderId);
            if (order == null)
                return NotFound(new { Message = "Order not found or already cancelled." });

            return Ok(new { Message = $"Order {orderId} has been cancelled." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "An error occurred while canceling the order.", Error = ex.Message });
        }
    }

    // ------------------------ Reservation Management ------------------------
    [HttpGet("GetAllReservationByRestaurant/{restaurantId}")]
    public async Task<IActionResult> GetAllReservationByRestaurant(
     int restaurantId,
     string? search = null,
     int pageNumber = 1
     )
    {
        int pageSize = 15;
        try
        {
            var restaurant = await _restaurantService.GetRestaurantByIdAsync(restaurantId);
            if (restaurant == null)
                return NotFound(new { Message = $"Restaurant with ID {restaurantId} not found." });

            var reservations = await _reservationService.GetReservationsByRestaurantAsync(restaurantId);

            // Apply search by email if provided
            if (!string.IsNullOrEmpty(search))
            {
                reservations = reservations
                    .Where(r => r.Customer != null && r.Customer.Email.ToLower().Contains(search.ToLower()))
                    .ToList();
            }

            
            var totalCount = reservations.Count();
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            var pagedReservations = reservations
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(r => new
                {
                    ReservationID = r.ReservationID,
                    RestaurantID = r.RestaurantID,
                    TimeSlotID = r.TimeSlotID,
                    TableId = r.TableId,
                    ReservationDate = r.ReservationDate,
                    CreatedAt = r.CreatedAt,
                    Status = r.Status,
                    CustomerEmail = r.Customer?.Email
                })
                .ToList();

            return Ok(new
            {
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalCount = totalCount,
                TotalPages = totalPages,
                Data = pagedReservations
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "An error occurred while retrieving reservations.", Error = ex.Message });
        }
    }


    [HttpGet("GetReservationById/{reservationId}")]
    public async Task<IActionResult> GetReservationById(int reservationId)
    {
        try
        {
            var reservation = await _reservationService.GetReservationByIdAsync(reservationId);
            if (reservation == null)
                return NotFound(new { Message = $"Reservation with ID {reservationId} not found." });

            return Ok(reservation);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "An error occurred while retrieving the Reservation.", Error = ex.Message });
        }
    }


    [HttpPut("reservations/{reservationId}/accept")]
    public async Task<IActionResult> AcceptReservation(int reservationId)
    {
        try
        {
            var reservation = await _reservationService.ApproveReservationAsync(reservationId);
            if (reservation == null)
                return NotFound(new { Message = "Reservation not found or already approved." });
            await _hubContext.Clients.User(reservation.UserID)
                    .SendAsync("ReceiveNotification", $"Your reservation {reservationId} has been Accept!");
            return Ok(new { Message = "Reservation accepted." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "An error occurred while accepting the reservation.", Error = ex.Message });
        }
    }

    [HttpPut("reservations/{reservationId}/reject")]
    public async Task<IActionResult> RejectReservation(int reservationId)
    {
        try
        {
            var reservation = await _reservationService.RejectReservationAsync(reservationId);
            if (reservation == null)
                return NotFound(new { Message = "Reservation not found or already rejected." });
            await _hubContext.Clients.User(reservation.UserID)
                    .SendAsync("ReceiveNotification", $"Your reservation {reservationId} has been REJECTED!");
            return Ok(new { Message = "Reservation rejected." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "An error occurred while rejecting the reservation.", Error = ex.Message });
        }
    }
    // ------------------------ TimeSlot Management ------------------------

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

    [HttpPost("CreateTimeSlot")]
    public async Task<IActionResult> CreateTimeSlot(int restaurantId, Models.Models.TimeSlot timeSlot)
    {
        try
        {
            timeSlot.RestaurantID = restaurantId;
            await _timeSlotService.CreateTimeSlotAsync(timeSlot);
            return CreatedAtAction(nameof(GetTimeSlots), new { restaurantId }, timeSlot);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "An error occurred while creating the time slot.", Error = ex.Message });
        }
    }

    [HttpDelete("DeleteTimeSlot/{timeSlotId}")]
    public async Task<IActionResult> DeleteTimeSlot(int timeSlotId)
    {
        try
        {
            var timeSlot = await _timeSlotService.GetTimeSlotByIdAsync(timeSlotId);
            if (timeSlot == null)
                return NotFound(new { Message = "Time slot not found." });

            await _timeSlotService.DeleteTimeSlotAsync(timeSlotId);
            return Ok(new { Message = "Time slot deleted successfully." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "An error occurred while deleting the time slot.", Error = ex.Message });
        }
    }

    // ------------------------ Table Management ------------------------

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
    [HttpGet("GetTableById/{tableID}")]
    public async Task<IActionResult> GetTableById(int tableID)
    {
        try
        {
            var Table = await _tableService.GetTableByIdAsync(tableID);
            if (Table == null)
                return NotFound(new { Message = $"Table with ID {tableID} not found." });

            return Ok(Table);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "An error occurred while retrieving the Table.", Error = ex.Message });
        }
    }

    [HttpPost("CreateTable")]
    public async Task<IActionResult> CreateTable(int restaurantId, Models.Models.Table table)
    {
        try
        {
            table.RestaurantId = restaurantId;
            await _tableService.CreateTableAsync(table);
            return CreatedAtAction(nameof(GetTables), new { restaurantId }, table);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "An error occurred while creating the table.", Error = ex.Message });
        }
    }

    [HttpPut("UpdateTable/{tableId}")]
    public async Task<IActionResult> UpdateTable(int tableId, Models.Models.Table table)
    {
        try
        {
            var existingTable = await _tableService.GetTableByIdAsync(tableId);
            if (existingTable == null)
                return NotFound(new { Message = "Table not found." });

            await _tableService.UpdateTableAsync(tableId, table);
            return Ok(new { Message = "Table updated successfully." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "An error occurred while updating the table.", Error = ex.Message });
        }
    }

    [HttpDelete("DeleteTable/{tableId}")]
    public async Task<IActionResult> DeleteTable(int tableId)
    {
        try
        {
            var table = await _tableService.GetTableByIdAsync(tableId);
            if (table == null)
                return NotFound(new { Message = "Table not found." });

            await _tableService.DeleteTableAsync(tableId);
            return Ok(new { Message = "Table deleted successfully." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "An error occurred while deleting the table.", Error = ex.Message });
        }


    }
    // ------------------------ Food Category Management ------------------------

    [HttpGet("GetAllMangerFoodCategoriesAsync")]
    public async Task<IActionResult> GetAllMangerFoodCategoriesAsync(
     [FromQuery] int restaurantId,
     [FromQuery] int page = 1,
     [FromQuery] string searchQuery = "")
    {
        try
        {
            if (restaurantId == 0)
                return BadRequest(new { Message = "❌ RestaurantId is required." });

            int pageSize = 10;
            var categories = await _foodCategoryService.GetAllCategoriesAsync(restaurantId);

            if (!string.IsNullOrEmpty(searchQuery))
            {
                categories = categories.Where(c => c.Name.Contains(searchQuery, StringComparison.OrdinalIgnoreCase));
            }

            int totalCount = categories.Count();
            var paginatedCategories = categories
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            return Ok(new
            {
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                Data = paginatedCategories
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"❌ Error: {ex.Message}");
        }
    }

    [HttpGet("GetFoodCategoryByd/{categoryId}")]
    public async Task<IActionResult> GetFoodCategoryByd(int categoryId)
    {
        try
        {
            var Category = await _foodCategoryService.GetCategoryByIdAsync(categoryId);
            if (Category == null)
                return NotFound(new { Message = $"Category with ID {categoryId} not found." });

            return Ok(Category);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "An error occurred while retrieving the order.", Error = ex.Message });
        }
    }

    [HttpPost("AddMangerFoodCategory")]
    public async Task<IActionResult> AddMangerFoodCategory(
        [FromBody] Models.Models.FoodCategory category,
        [FromQuery] int restaurantId)
    {
        if (category == null)
            return BadRequest(new { Success = false, Message = "Invalid category data." });

        try
        {
            if (restaurantId == 0)
                return BadRequest(new { Success = false, Message = "❌ RestaurantId is required." });

            category.RestaurantId = restaurantId;

            await _foodCategoryService.CreateCategoryAsync(category);
            await _hubContext.Clients.All.SendAsync("CategoryAdded", category);

            return Ok(new
            {
                Success = true,
                Message = "Category created successfully",
                Category = category
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Success = false, Message = ex.Message });
        }
    }


    [HttpPut("UpdateMangerFoodCategory/{categoryId}")]
    public async Task<IActionResult> UpdateMangerFoodCategory(
        int categoryId,
        [FromBody] Models.Models.FoodCategory category,
        [FromQuery] int restaurantId)
    {
        if (category == null || category.CategoryID != categoryId)
            return BadRequest(new { Success = false, Message = "Invalid category ID." });

        try
        {
            if (restaurantId != 0)
                category.RestaurantId = restaurantId;

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
    [HttpDelete("DeleteMangerFoodCategory/{categoryId}")]
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

}

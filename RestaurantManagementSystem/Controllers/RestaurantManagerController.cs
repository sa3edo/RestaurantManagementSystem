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

    public RestaurantManagerController(
        IMenuItemService menuItemService,
        IOrderService orderService,
        IReservationService reservationService,
        UserManager<ApplicationUser> userManager,
        IRestaurantService restaurantService,
        IHubContext<AdminHub> hubContext,
        ITimeSlotService timeSlotService,
        ITableService tableService
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
    }

    // ------------------------ Restaurant Management ------------------------

    [HttpGet("GetRestaurant")]
    public async Task<IActionResult> GetRestaurant()
    {
        try
        {
            var userManagerId = _userManager.GetUserId(User);
            var restaurants = await _restaurantService.GetAllRestaurantsAsync(userManagerId);

            if (restaurants == null || !restaurants.Any(r => r.Status == RestaurantStatus.Approved))
                return NotFound(new { Message = "No approved restaurant assigned to this manager." });

            var approvedRestaurants = restaurants.Where(r => r.Status == RestaurantStatus.Approved);

            return Ok(approvedRestaurants);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "An error occurred while retrieving the restaurant.", Error = ex.Message });
        }
    }

    [HttpPut("CreateRestaurant")]
    public async Task<IActionResult> CreateRestaurant([FromBody] Models.Models.Restaurant restaurant, IFormFile? RestImg)
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
    [HttpPut("UpdateRestaurant")]
    public async Task<IActionResult> UpdateRestaurant(int restaurantId, [FromBody] Models.Models.Restaurant restaurant, IFormFile? RestImg)
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
    // ------------------------ Menu Management ------------------------

    [HttpGet("GetMenuItems")]
    public async Task<IActionResult> GetMenuItems(int restaurantId)
    {
        try
        {
            var restaurant = await _restaurantService.GetRestaurantByIdAsync(restaurantId);
            if (restaurant == null)
                return NotFound(new { Message = "Restaurant not found." });

            var menuItems = await _menuItemService.GetMenuItemsByRestaurantAsync(restaurant.RestaurantID);
            return Ok(menuItems);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "An error occurred while retrieving menu items.", Error = ex.Message });
        }
    }

    [HttpPost("CreateMenuItem")]
    public async Task<IActionResult> CreateMenuItem(int restaurantId, [FromBody] Models.Models.MenuItem menuItem,IFormFile? MenuImg)
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
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "An error occurred while creating the menu item.", Error = ex.Message });
        }
    }
    [HttpPut("UpdateMenuItem/{menuItemId}")]
    public async Task<IActionResult> UpdateMenuItem(int menuItemId, [FromBody] Models.Models.MenuItem menuItem, IFormFile? MenuImg)
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

    [HttpPut("orders/{orderId}/UpdateOrderStatus")]
    public async Task<IActionResult> UpdateOrderStatus(int orderId, [FromBody] OrderStatus newStatus)
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
    public async Task<IActionResult> CreateTimeSlot(int restaurantId, [FromBody] Models.Models.TimeSlot timeSlot)
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

    [HttpPost("CreateTable")]
    public async Task<IActionResult> CreateTable(int restaurantId, [FromBody] Models.Models.Table table)
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
    public async Task<IActionResult> UpdateTable(int tableId, [FromBody] Models.Models.Table table)
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

}

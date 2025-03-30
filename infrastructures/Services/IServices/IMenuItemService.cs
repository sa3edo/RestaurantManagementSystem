using Microsoft.AspNetCore.Http;
using Models.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace infrastructures.Services.IServices
{
    public interface IMenuItemService
    {
        Task<IEnumerable<MenuItem>> GetMenuItemsByRestaurantAsync(int restaurantId);
        Task<MenuItem?> GetMenuItemByIdAsync(int menuItemId);
        Task<MenuItem> CreateMenuItemAsync(MenuItem menuItem, IFormFile? RestImgs);
        Task<MenuItem?> UpdateMenuItemAsync(int menuItemId, MenuItem menuItem , IFormFile? RestImgs);
        Task<bool> DeleteMenuItemAsync(int menuItemId);
    }

}

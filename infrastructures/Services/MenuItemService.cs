using infrastructures.Repository;
using infrastructures.Repository.IRepository;
using infrastructures.Services.IServices;
using infrastructures.UnitOfWork;
using Microsoft.AspNetCore.Http;
using Models.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace infrastructures.Services
{
    public class MenuItemService : IMenuItemService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly string _imagePath = Path.Combine(Directory.GetCurrentDirectory(), "MenuImages");

        public MenuItemService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<Models.Models.MenuItem>> GetMenuItemsByRestaurantAsync(int restaurantId) =>
            await _unitOfWork.menuItem.GetAsync(expression: m => m.RestaurantID == restaurantId);

        public async Task<Models.Models.MenuItem?> GetMenuItemByIdAsync(int menuItemId) =>
            await _unitOfWork.menuItem.GetOneAsync(expression: m => m.MenuItemID == menuItemId);

        public async Task<Models.Models.MenuItem> CreateMenuItemAsync(Models.Models.MenuItem menuItem, IFormFile? menuImg)
        {
            if (menuImg != null && menuImg.Length > 0)
            {
                EnsureImageDirectoryExists();
                menuItem.ImgUrl = await SaveImageAsync(menuImg);
            }
            else
            {
                menuItem.ImgUrl = string.Empty;
            }

            await _unitOfWork.menuItem.CreateAsync(menuItem);
            await _unitOfWork.CompleteAsync();
            return menuItem;
        }

        public async Task<Models.Models.MenuItem?> UpdateMenuItemAsync(int menuItemId, Models.Models.MenuItem menuItem, IFormFile? menuImg)
        {
            var existingMenuItem = await _unitOfWork.menuItem.GetOneAsync(expression: m => m.MenuItemID == menuItemId, tracked: false);
            if (existingMenuItem == null) return null;

            if (menuImg != null && menuImg.Length > 0)
            {
                EnsureImageDirectoryExists();
                var newImage = await SaveImageAsync(menuImg);
                DeleteImage(existingMenuItem.ImgUrl);
                menuItem.ImgUrl = newImage;
            }
            else
            {
                menuItem.ImgUrl = existingMenuItem.ImgUrl;
            }

            existingMenuItem.Name = menuItem.Name;
            existingMenuItem.Price = menuItem.Price;
            existingMenuItem.ImgUrl = menuItem.ImgUrl;

            _unitOfWork.menuItem.Edit(existingMenuItem);
            await _unitOfWork.CompleteAsync();
            return existingMenuItem;
        }

        public async Task<bool> DeleteMenuItemAsync(int menuItemId)
        {
            var menuItem = await _unitOfWork.menuItem.GetOneAsync(expression: m => m.MenuItemID == menuItemId);
            if (menuItem == null) return false;

            DeleteImage(menuItem.ImgUrl);
            _unitOfWork.menuItem.Delete(menuItem);
            await _unitOfWork.CompleteAsync();
            return true;
        }

        private void EnsureImageDirectoryExists()
        {
            if (!Directory.Exists(_imagePath))
            {
                Directory.CreateDirectory(_imagePath);
            }
        }

        private async Task<string> SaveImageAsync(IFormFile image)
        {
            var fileName = Guid.NewGuid() + Path.GetExtension(image.FileName);
            var filePath = Path.Combine(_imagePath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await image.CopyToAsync(stream);
            }
            return fileName;
        }

        private void DeleteImage(string? imageUrl)
        {
            if (!string.IsNullOrEmpty(imageUrl))
            {
                var filePath = Path.Combine(_imagePath, imageUrl);
                if (File.Exists(filePath))
                {
                    File.Delete(filePath);
                }
            }
        }
    }
}

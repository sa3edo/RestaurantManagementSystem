using infrastructures.Services.IServices;
using infrastructures.UnitOfWork;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Models.Models;
using RestaurantManagementSystem.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace infrastructures.Services
{
    public class RestaurantService : IRestaurantService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly string _imageFolderPath = Path.Combine(Directory.GetCurrentDirectory(), "RestImages");

        public RestaurantService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
            
        }

        public async Task<IEnumerable<Restaurant>> GetAllRestaurantsAsync(string userId = " ")
        {
            return !string.IsNullOrWhiteSpace(userId)
                ? await _unitOfWork.restaurant.GetAsync(expression: e => e.ManagerID == userId)
                : await _unitOfWork.restaurant.GetAsync();
        }

        public async Task<Restaurant?> GetRestaurantByIdAsync(int restaurantId) =>
            await _unitOfWork.restaurant.GetOneAsync(expression: r => r.RestaurantID == restaurantId);
        
        public async Task<Restaurant> CreateRestaurantAsync(Restaurant restaurant, IFormFile? restImgs)
        {
            var Duplicate = await _unitOfWork.restaurant.GetOneAsync(expression: e =>
                e.Location == restaurant.Location && e.Name == restaurant.Name);
            var DuplicateName = await _unitOfWork.restaurant.GetOneAsync(expression:e=> e.ManagerID != restaurant.ManagerID && e.Name == restaurant.Name);

            if (Duplicate !=null)
                throw new InvalidOperationException("A restaurant with the samelocation already exists.");
            if(DuplicateName !=null)
                throw new InvalidOperationException("restaurant with the same name is managed by a different manager.");          
            restaurant.ImgUrl = await SaveImageAsync(restImgs);
            await _unitOfWork.restaurant.CreateAsync(restaurant);
            await _unitOfWork.CompleteAsync();
            return restaurant;
        }

        public async Task<Restaurant?> UpdateRestaurantAsync(int restaurantId, Restaurant restaurant, IFormFile? restImgs)
        {
            var existingRestaurant = await _unitOfWork.restaurant.GetOneAsync(expression: e => e.RestaurantID == restaurantId);
            if (existingRestaurant == null) return null;

  
            var duplicate = await _unitOfWork.restaurant.GetOneAsync(expression: e =>
                e.Location == restaurant.Location && e.Name == restaurant.Name && e.RestaurantID != restaurantId);
            if (duplicate != null)
                throw new InvalidOperationException("A restaurant with the same location already exists.");

            var duplicateName = await _unitOfWork.restaurant.GetOneAsync(expression: e =>
                e.ManagerID != restaurant.ManagerID && e.Name == restaurant.Name && e.RestaurantID != restaurantId);
            if (duplicateName != null)
                throw new InvalidOperationException("A restaurant with the same name is managed by a different manager.");

            if (restImgs != null && restImgs.Length > 0)
            {
                await DeleteImage(existingRestaurant.ImgUrl);
                existingRestaurant.ImgUrl = await SaveImageAsync(restImgs);
            }
            existingRestaurant.Name = restaurant.Name;
            existingRestaurant.Description = restaurant.Description;
            existingRestaurant.Location = restaurant.Location;

            _unitOfWork.restaurant.Edit(existingRestaurant);
            await _unitOfWork.CompleteAsync();

            return existingRestaurant;
        }


        public async Task<bool> DeleteRestaurantAsync(int restaurantId)
        {
            var restaurant = await _unitOfWork.restaurant.GetOneAsync(
                [
            r => r.foodCategories,
            r => r.Tables,
            r => r.TimeSlot,
            r => r.Reservations,
            r => r.Orders,
            r => r.MenuItems
                ],
                expression: r => r.RestaurantID == restaurantId);

            if (restaurant == null)
                throw new Exception("❌ Restaurant not found.");

            try
            {
                if (restaurant.Tables?.Any() == true)
                    _unitOfWork.table.DeleteRange(restaurant.Tables);

                if (restaurant.TimeSlot?.Any() == true)
                    _unitOfWork.timeSlots.DeleteRange(restaurant.TimeSlot);

                if (restaurant.MenuItems?.Any() == true)
                    _unitOfWork.menuItem.DeleteRange(restaurant.MenuItems);

                if (restaurant.foodCategories?.Any() == true)
                    _unitOfWork.foodCategory.DeleteRange(restaurant.foodCategories);

                if (restaurant.Reservations?.Any() == true)
                    _unitOfWork.reservation.DeleteRange(restaurant.Reservations);

                if (restaurant.Orders?.Any() == true)
                    _unitOfWork.order.DeleteRange(restaurant.Orders);

                if (!string.IsNullOrEmpty(restaurant.ImgUrl))
                    await DeleteImage(restaurant.ImgUrl);

                _unitOfWork.restaurant.Delete(restaurant);

                // Save changes
                await _unitOfWork.CompleteAsync();

                return true;
            }
            catch (Exception ex)
            {
                throw new Exception("❌ Failed to delete restaurant and its related entities.\nDetails: " +
                                    (ex.InnerException?.Message ?? ex.Message));
            }
        }

        public async Task<Restaurant?> ApproveRestaurantAsync(int restaurantId)
        {
            var Restaurant = await _unitOfWork.restaurant.GetOneAsync(expression: r => r.RestaurantID == restaurantId);

            if (Restaurant.Status != RestaurantStatus.Pending)
                throw new InvalidOperationException("Reservation is already processed.");
            return await ChangeRestaurantStatusAsync(restaurantId, RestaurantStatus.Approved);
        }

        public async Task<Restaurant?> RejectRestaurantAsync(int restaurantId)
        {
            var restaurant = await _unitOfWork.restaurant.GetOneAsync(expression: r => r.RestaurantID == restaurantId);
            if (restaurant == null)
                return null;
                if (!string.IsNullOrEmpty(restaurant.ImgUrl))
                {
                    await DeleteImage(restaurant.ImgUrl);
                }
                _unitOfWork.restaurant.Delete(restaurant);
                await _unitOfWork.CompleteAsync();
                return restaurant;
        }


        private async Task<Restaurant?> ChangeRestaurantStatusAsync(int restaurantId, RestaurantStatus status)
        {
            var restaurant = await _unitOfWork.restaurant.GetOneAsync(expression: r => r.RestaurantID == restaurantId);
            if (restaurant == null) return null;

            restaurant.Status = status;
            _unitOfWork.restaurant.Edit(restaurant);
            await _unitOfWork.CompleteAsync();
            return restaurant;
        }

        private async Task<string> SaveImageAsync(IFormFile? imageFile)
        {
            if (imageFile == null || imageFile.Length == 0) return string.Empty;

            EnsureImageDirectoryExists();
            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(imageFile.FileName)}";
            var filePath = Path.Combine(_imageFolderPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await imageFile.CopyToAsync(stream);
            }
            return fileName;
        }

        private async Task DeleteImage(string? fileName)
        {
            if (string.IsNullOrEmpty(fileName)) return;

            var filePath = Path.Combine(_imageFolderPath, fileName);
            if (File.Exists(filePath))
            {
                await Task.Run(() => File.Delete(filePath));
            }
        }

        private void EnsureImageDirectoryExists()
        {
            if (!Directory.Exists(_imageFolderPath))
            {
                Directory.CreateDirectory(_imageFolderPath);
            }
        }
    }
}

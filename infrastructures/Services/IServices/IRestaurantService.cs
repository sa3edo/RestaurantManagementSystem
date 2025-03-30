using Microsoft.AspNetCore.Http;
using Models.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace infrastructures.Services.IServices
{
    public interface IRestaurantService
    {
        Task<IEnumerable<Restaurant>> GetAllRestaurantsAsync(string UserId = " ");
        Task<Restaurant?> GetRestaurantByIdAsync(int restaurantId);
        Task<Restaurant> CreateRestaurantAsync(Restaurant restaurant, IFormFile?  RestImgs);
        Task<Restaurant?> UpdateRestaurantAsync(int restaurantId, Restaurant restaurant, IFormFile? RestImgs);
        Task<bool> DeleteRestaurantAsync(int restaurantId);
        Task<Restaurant?> ApproveRestaurantAsync(int restaurantId);
        Task<Restaurant?> RejectRestaurantAsync(int restaurantId);
    }

}

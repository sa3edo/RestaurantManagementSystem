
using Models.Models;
using System.Collections.Generic;

namespace infrastructures.Services.IServices
{
    public interface IAdminService
    {
        IEnumerable<Restaurant> GetAllRestaurants();
        void ApproveRestaurant(int restaurantId);
        void RejectRestaurant(int restaurantId);
        IEnumerable<Models.Models.FoodCategory> GetAllFoodCategories();
        void AddFoodCategory(FoodCategory category);
        void UpdateFoodCategory(FoodCategory category);
        void DeleteFoodCategory(int categoryId);
        void MonitorOrders();
        void CreateRestaurant(Restaurant restaurant);
        void UpdateRestaurant(Restaurant restaurant);
        void DeleteRestaurant(int restaurantId);
        //void HandleCustomerSupport(int requestId);
        
    }
}

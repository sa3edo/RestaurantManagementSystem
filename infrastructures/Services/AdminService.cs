using infrastructures.Repository;
using infrastructures.Services.IServices;
using infrastructures.UnitOfWork;
using Models.Models;
using System;
using System.Collections.Generic;

namespace infrastructures.Services
{
    public class AdminService : IAdminService
    {
        private readonly IUnitOfWork _unitOfWork;

        public AdminService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        // ------------------------ Restaurant Management ------------------------

        public IEnumerable<Models.Models.Restaurant> GetAllRestaurants()
        {
            return _unitOfWork.restaurant.Get();
        }

        public void CreateRestaurant(Models.Models.Restaurant restaurant)
        {
            if (restaurant != null)
            {
                _unitOfWork.restaurant.Create(restaurant);
                _unitOfWork.Complete();
            }
        }

        public void UpdateRestaurant(Models.Models.Restaurant restaurant)
        {
            if (restaurant != null)
            {
                _unitOfWork.restaurant.Edit(restaurant);
                _unitOfWork.Complete();
            }
        }

        public void DeleteRestaurant(int restaurantId)
        {
            var restaurant = _unitOfWork.restaurant.GetOne(expression: r => r.RestaurantID == restaurantId);
            if (restaurant != null)
            {
                _unitOfWork.restaurant.Delete(restaurant);
                _unitOfWork.Complete();
            }
        }

        public void ApproveRestaurant(int restaurantId)
        {
            var restaurant = _unitOfWork.restaurant.GetOne(expression: r => r.RestaurantID == restaurantId);
            if (restaurant != null && restaurant.Status == RestaurantStatus.Pending)
            {
                restaurant.Status = RestaurantStatus.Approved;
                _unitOfWork.restaurant.Edit(restaurant);
                _unitOfWork.Complete();
            }
        }

        public void RejectRestaurant(int restaurantId)
        {
            var restaurant = _unitOfWork.restaurant.GetOne(expression: r => r.RestaurantID == restaurantId);
            if (restaurant != null && restaurant.Status == RestaurantStatus.Pending)
            {
                restaurant.Status = RestaurantStatus.Rejected;
                _unitOfWork.restaurant.Edit(restaurant);
                _unitOfWork.Complete();
            }
        }

        // ------------------------ Food Category Management ------------------------

        public IEnumerable<Models.Models.FoodCategory> GetAllFoodCategories()
        {
            return _unitOfWork.foodCategory.Get();
        }

        public void AddFoodCategory(Models.Models.FoodCategory category)
        {
            if (category != null)
            {
                _unitOfWork.foodCategory.Create(category);
                _unitOfWork.Complete();
            }
        }

        public void UpdateFoodCategory(Models.Models.FoodCategory category)
        {
            if (category != null)
            {
                _unitOfWork.foodCategory.Edit(category);
                _unitOfWork.Complete();
            }
        }

        public void DeleteFoodCategory(int categoryId)
        {
            var category = _unitOfWork.foodCategory.GetOne(expression: c => c.CategoryID == categoryId);
            if (category != null)
            {
                _unitOfWork.foodCategory.Delete(category);
                _unitOfWork.Complete();
            }
        }

        // ------------------------ Order Monitoring ------------------------

        public void MonitorOrders()
        {
            var orders = _unitOfWork.order.Get();
            foreach (var order in orders)
            {
                Console.WriteLine($"Order ID: {order.OrderID}, Status: {order.Status}");
            }
        }
    }
}

using infrastructures.Services.IServices;
using infrastructures.UnitOfWork;
using Models.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace infrastructures.Services
{
    public class RestaurantService : IRestaurantService
    {
        private readonly IUnitOfWork _unitOfWork;

        public RestaurantService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }


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

    }
}

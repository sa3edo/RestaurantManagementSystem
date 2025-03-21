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
        IEnumerable<Restaurant> GetAllRestaurants();
        void ApproveRestaurant(int restaurantId);
        void RejectRestaurant(int restaurantId);
        void CreateRestaurant(Restaurant restaurant);
        void UpdateRestaurant(Restaurant restaurant);
        void DeleteRestaurant(int restaurantId);
    }
}

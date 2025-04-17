using Models.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace infrastructures.Services.IServices
{
    public interface IFoodCategoryService
    {
        Task<IEnumerable<FoodCategory>> GetAllCategoriesAsync(int RestaurantId);
        Task<FoodCategory?> GetCategoryByIdAsync(int categoryId);
        Task<FoodCategory> CreateCategoryAsync(FoodCategory category);
        Task<FoodCategory?> UpdateCategoryAsync(int categoryId, FoodCategory category);
        Task<bool> DeleteCategoryAsync(int categoryId);
    }

}

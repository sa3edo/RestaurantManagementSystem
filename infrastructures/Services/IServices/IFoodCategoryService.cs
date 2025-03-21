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
        IEnumerable<FoodCategory> GetAllFoodCategories();
        void AddFoodCategory(FoodCategory category);
        void UpdateFoodCategory(FoodCategory category);
        void DeleteFoodCategory(int categoryId);
    }
}

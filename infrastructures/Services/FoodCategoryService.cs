using infrastructures.Repository.IRepository;
using infrastructures.Services.IServices;
using infrastructures.UnitOfWork;
using Models.Models;
using RestaurantManagementSystem.Repository.IRepository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace infrastructures.Services
{
    public class FoodCategoryService : IFoodCategoryService
    {
        private readonly IUnitOfWork _unitOfWork;

        public FoodCategoryService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<FoodCategory>> GetAllCategoriesAsync(string UserId = " ")
        {
            return !string.IsNullOrWhiteSpace(UserId)
               ? await _unitOfWork.foodCategory.GetAsync(expression: e => e.UserId == UserId)
               : await _unitOfWork.foodCategory.GetAsync();
        }

        public async Task<FoodCategory?> GetCategoryByIdAsync(int categoryId) =>
            await _unitOfWork.foodCategory.GetOneAsync(expression: c => c.CategoryID == categoryId);

        public async Task<FoodCategory> CreateCategoryAsync(FoodCategory category)
        {
            await _unitOfWork.foodCategory.CreateAsync(category);
            await _unitOfWork.CompleteAsync();
            return category;
        }

        public async Task<FoodCategory?> UpdateCategoryAsync(int categoryId, FoodCategory category)
        {
            var existingCategory = await _unitOfWork.foodCategory.GetOneAsync(expression: c => c.CategoryID == categoryId);
            if (existingCategory == null) return null;


            existingCategory.Name = category.Name;
            existingCategory.UserId = category.UserId;
            _unitOfWork.foodCategory.Edit(existingCategory);
            await _unitOfWork.CompleteAsync();
            return existingCategory;
        }

        public async Task<bool> DeleteCategoryAsync(int categoryId)
        {
            var category = await _unitOfWork.foodCategory.GetOneAsync(expression: c => c.CategoryID == categoryId);
            if (category == null) return false;

            _unitOfWork.foodCategory.Delete(category);
            await _unitOfWork.CompleteAsync();
            return true;
        }
    }

}

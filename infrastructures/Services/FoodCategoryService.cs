using infrastructures.Repository.IRepository;
using infrastructures.Services.IServices;
using infrastructures.UnitOfWork;
using Models.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace infrastructures.Services
{
    public class FoodCategoryService : IFoodCategoryService
    {
        private readonly IUnitOfWork _unitOfWork;

        public FoodCategoryService(IUnitOfWork unitOfWork)
        {
            this._unitOfWork = unitOfWork;
        }
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
        
    }
}

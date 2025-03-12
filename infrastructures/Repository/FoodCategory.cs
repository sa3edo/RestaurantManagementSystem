using infrastructures.Repository.IRepository;
using Models.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using RestaurantManagementSystem.Repository;

namespace infrastructures.Repository
{
     public class FoodCategory : Repository<FoodCategory>,IFoodCtegory
    {
        public FoodCategory(ApplicationDbContext dbContext) : base(dbContext)
        {
        }

    }
}

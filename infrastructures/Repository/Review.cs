using infrastructures.Repository.IRepository;
using Models.Models;
using RestaurantManagementSystem.Repository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace infrastructures.Repository
{
    class Review : Repository<Models.Models.Review> ,IReview
    {
        public Review(ApplicationDbContext dbContext) : base(dbContext)
        {

        }
    }
}

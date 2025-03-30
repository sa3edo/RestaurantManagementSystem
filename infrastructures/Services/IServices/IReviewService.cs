using Models.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace infrastructures.Services.IServices
{
    public interface IReviewService
    {
        Task<IEnumerable<Review>> GetReviewsByRestaurantAsync(int restaurantId);
        Task<Review> CreateReviewAsync(Review review);
        Task<bool> DeleteReviewAsync(int reviewId);
    }

}

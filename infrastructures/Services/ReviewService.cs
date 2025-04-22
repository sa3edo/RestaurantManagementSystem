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
    public class ReviewService : IReviewService
    {
        private readonly IUnitOfWork _unitOfWork;

        public ReviewService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<Review>> GetReviewsByRestaurantAsync(int restaurantId) =>
            await _unitOfWork.review.GetAsync([e=>e.Customer],expression: r => r.RestaurantID == restaurantId);

        public async Task<Review> CreateReviewAsync(Review review)
        {
            await _unitOfWork.review.CreateAsync(review);
            await _unitOfWork.CompleteAsync();
            return review;
        }

        public async Task<bool> DeleteReviewAsync(int reviewId)
        {
            var review = await _unitOfWork.review.GetOneAsync(expression: r => r.ReviewID == reviewId);
            if (review == null) return false;

            _unitOfWork.review.Delete(review);
            await _unitOfWork.CompleteAsync();
            return true;
        }
    }

}

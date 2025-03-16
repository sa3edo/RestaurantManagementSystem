using infrastructures.Repository.IRepository;
using Microsoft.EntityFrameworkCore.Storage;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace infrastructures.UnitOfWork
{
    public interface IUnitOfWork : IDisposable
    {
       public IFoodCtegory foodCategory { get; }
        public IMenuItem menuItem { get; }
        public IOrder order { get; }
        public IOrderItem orderItem { get; }
        public IReservation reservation { get; }
        public IRestaurant restaurant { get; }
        public IReview review { get; }
        public ITimeSlots timeSlots { get; }

        int Complete();
        Task CompleteAsync();
        Task<IDbContextTransaction> BeginTransactionAsync();
    }
}

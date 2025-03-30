using infrastructures.Repository;
using infrastructures.Repository.IRepository;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using System;
using System.Threading.Tasks;

namespace infrastructures.UnitOfWork
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly ApplicationDbContext _context;

        public UnitOfWork(ApplicationDbContext context)
        {
            _context = context;
            foodCategory = new FoodCategory(_context);
            menuItem = new MenuItem(_context);
            order = new Order(_context);
            orderItem = new OrderItem(_context);
            reservation = new Rservation(_context);
            restaurant = new Restaurant(_context);
            review = new Review(_context);
            timeSlots = new TimeSlot(_context);
            table = new Table(_context);
        }

        public IFoodCtegory foodCategory { get; private set; }
        public IMenuItem menuItem { get; private set; }
        public IOrder order { get; private set; }
        public IOrderItem orderItem { get; private set; }
        public IReservation reservation { get; private set; }
        public IRestaurant restaurant { get; private set; }
        public IReview review { get; private set; }
        public ITimeSlots timeSlots { get; private set; }
        public ITable table { get; private set; }


        public int Complete() => _context.SaveChanges();
        public Task CompleteAsync() => _context.SaveChangesAsync();
        public Task<IDbContextTransaction> BeginTransactionAsync() => _context.Database.BeginTransactionAsync();
        public void Dispose() => _context.Dispose();
    }
}

using infrastructures.Repository.IRepository;
using Models.Chat;
using RestaurantManagementSystem.Repository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;


namespace infrastructures.Repository
{
    public class ConversationRepository : Repository<Conversation>, IConversation
    {
        private readonly ApplicationDbContext _db;

        public ConversationRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }

        public async Task<Conversation?> GetConversationAsync(string userId, string vendorId)
        {
            return await _db.Conversation
                .Include(c => c.Messages)
                .FirstOrDefaultAsync(c =>
                    (c.UserId == userId && c.VendorId == vendorId) ||
                    (c.UserId == vendorId && c.VendorId == userId));
        }

        public async Task<IEnumerable<Conversation>> GetUserConversationsAsync(string userId)
        {
            return await _db.Conversation
                .Include(c => c.Messages)
                .Where(c => c.UserId == userId || c.VendorId == userId)
                .OrderByDescending(c => c.LastMessageAt)
                .ToListAsync();
        }

    }
}

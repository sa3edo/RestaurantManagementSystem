using infrastructures.Repository.IRepository;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using Models.Chat;
using RestaurantManagementSystem.Models;
using RestaurantManagementSystem.Repository;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace infrastructures.Repository
{
    public class ChatRepository : Repository<ChatMessage>, IChat
    {
        private readonly ApplicationDbContext _db;

        public ChatRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }

        public async Task<IEnumerable<ChatMessage>> GetConversationAsync(string userId1, string userId2, int page = 1, int pageSize = 20)
        {
            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 20;

            var messages = await _db.chatMessages
                .Where(m => (m.SenderId == userId1 && m.ReceiverId == userId2) ||
                            (m.SenderId == userId2 && m.ReceiverId == userId1))
                .OrderByDescending(m => m.SentAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .OrderBy(m => m.SentAt)
                .ToListAsync();

            return messages;
        }

        public async Task<int> GetConversationCountAsync(string userId1, string userId2)
        {
            return await _db.chatMessages
                .Where(m => (m.SenderId == userId1 && m.ReceiverId == userId2) ||
                            (m.SenderId == userId2 && m.ReceiverId == userId1))
                .CountAsync();
        }

        public async Task<bool> MarkAsReadAsync(int messageId, string userId)
        {
            var message = await _db.chatMessages
                .FirstOrDefaultAsync(m => m.Id == messageId && m.ReceiverId == userId);

            if (message == null)
                return false;

            message.IsRead = true;
            _db.Entry(message).State = EntityState.Modified;
            return true;
        }

        public async Task<int> GetUnreadCountAsync(string userId)
        {
            return await _db.chatMessages
                .Where(m => m.ReceiverId == userId && !m.IsRead)
                .CountAsync();
        }

        public async Task<IEnumerable<ApplicationUser>> GetUsersWhoChattedWithAsync(string managerId)
        {
            var users = await _db.chatMessages
                .Where(m => m.ReceiverId == managerId || m.SenderId == managerId)
                .Select(m => m.SenderId == managerId ? m.Receiver : m.Sender)
                .Distinct()
                .ToListAsync();

            return users;
        }


        public async Task<IEnumerable<ChatMessage>> GetMessagesBetweenAsync(string userId1, string userId2)
        {
            var messages = await _db.chatMessages
                .Where(m => (m.SenderId == userId1 && m.ReceiverId == userId2) ||
                            (m.SenderId == userId2 && m.ReceiverId == userId1))
                .OrderBy(m => m.SentAt)
                .ToListAsync();

            return messages;
        }
    }
}

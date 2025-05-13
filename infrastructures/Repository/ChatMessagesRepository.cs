using infrastructures.Repository.IRepository;
using Microsoft.EntityFrameworkCore;
using Models.Chat;
using RestaurantManagementSystem.Repository;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace infrastructures.Repository
{
    public class ChatMessagesRepository : Repository<ChatMessage>, IChatMessages
    {
        private readonly ApplicationDbContext _context;

        public ChatMessagesRepository(ApplicationDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ChatMessage>> GetMessagesByConversationIdAsync(int conversationId)
        {
            return await _context.Messages
                .Where(m => m.ConversationId == conversationId)
                .OrderBy(m => m.SentAt)
                .ToListAsync();
        }
    }
}

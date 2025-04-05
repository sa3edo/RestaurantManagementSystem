using Models.Chat;
using RestaurantManagementSystem.Repository.IRepository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace infrastructures.Repository.IRepository
{
   public interface IChat : IRepository<Models.Chat.ChatMessage>
    {
        Task<IEnumerable<ChatMessage>> GetConversationAsync(string userId1, string userId2, int page = 1, int pageSize = 20);
        Task<int> GetConversationCountAsync(string userId1, string userId2);
        Task<bool> MarkAsReadAsync(int messageId, string userId);
        Task<int> GetUnreadCountAsync(string userId);
    }
}


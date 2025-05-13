using Models.Chat;
using RestaurantManagementSystem.Repository.IRepository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace infrastructures.Repository.IRepository
{
    public interface IConversation: IRepository<Conversation>
    {
        Task<Conversation?> GetConversationAsync(string userId, string vendorId);
        Task<IEnumerable<Conversation>> GetUserConversationsAsync(string userId);
    }
}

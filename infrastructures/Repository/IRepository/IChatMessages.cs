using Models.Chat;
using RestaurantManagementSystem.Repository.IRepository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace infrastructures.Repository.IRepository
{
     public interface IChatMessages : IRepository<ChatMessage>
    {
        Task<IEnumerable<ChatMessage>> GetMessagesByConversationIdAsync(int conversationId);

    }
}

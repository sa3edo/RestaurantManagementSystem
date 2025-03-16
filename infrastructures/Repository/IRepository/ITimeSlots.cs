using Models.Models;
using RestaurantManagementSystem.Repository.IRepository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace infrastructures.Repository.IRepository
{
    public interface ITimeSlots : IRepository<Models.Models.TimeSlot>
    {
    }
}

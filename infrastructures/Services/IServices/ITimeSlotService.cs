using Models.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace infrastructures.Services.IServices
{
    public interface ITimeSlotService
    {
        Task<IEnumerable<TimeSlot>> GetAvailableTimeSlotsAsync(int restaurantId);
        Task<TimeSlot?> GetTimeSlotByIdAsync(int timeSlotId);
        Task<TimeSlot> CreateTimeSlotAsync(TimeSlot timeSlot);
        Task<bool> DeleteTimeSlotAsync(int timeSlotId);
    }

}

using infrastructures.Services.IServices;
using infrastructures.UnitOfWork;
using Models.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace infrastructures.Services
{
    public class TimeSlotService : ITimeSlotService
    {
        private readonly IUnitOfWork _unitOfWork;

        public TimeSlotService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<TimeSlot>> GetAvailableTimeSlotsAsync(int restaurantId) =>
            await _unitOfWork.timeSlots.GetAsync(expression: t => t.RestaurantID == restaurantId);

        public async Task<TimeSlot?> GetTimeSlotByIdAsync(int timeSlotId) =>
            await _unitOfWork.timeSlots.GetOneAsync(expression: t => t.TimeSlotID == timeSlotId);

        public async Task<TimeSlot> CreateTimeSlotAsync(TimeSlot timeSlot)
        {
            await _unitOfWork.timeSlots.CreateAsync(timeSlot);
            await _unitOfWork.CompleteAsync();
            return timeSlot;
        }

        public async Task<bool> DeleteTimeSlotAsync(int timeSlotId)
        {
            var timeSlot = await _unitOfWork.timeSlots.GetOneAsync(expression: t => t.TimeSlotID == timeSlotId);
            if (timeSlot == null) return false;

            _unitOfWork.timeSlots.Delete(timeSlot);
            await _unitOfWork.CompleteAsync();
            return true;
        }
    }

}

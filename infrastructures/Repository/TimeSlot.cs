using infrastructures.Repository.IRepository;
using RestaurantManagementSystem.Repository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace infrastructures.Repository
{
    class TimeSlot : Repository<Models.Models.TimeSlot> , ITimeSlots
    {
        public TimeSlot(ApplicationDbContext dbContext) : base(dbContext)
        {

        }
    }
}

using Models.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace infrastructures.Services.IServices
{
    public interface IReservationService
    {
        Task<IEnumerable<Reservation>> GetReservationsByRestaurantAsync(int restaurantId);
        Task<Reservation?> GetReservationByIdAsync(int reservationId);
        Task<Reservation> CreateReservationAsync(Reservation reservation);
        Task<bool> CancelReservationAsync(int reservationId);
        Task<Reservation?> ApproveReservationAsync(int reservationId);
        Task<Reservation?> RejectReservationAsync(int reservationId);

    }
}

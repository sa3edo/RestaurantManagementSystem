using infrastructures.Repository;
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
    public class ReservationService : IReservationService
    {
        private readonly IUnitOfWork _unitOfWork;

        public ReservationService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<Reservation>> GetReservationsByRestaurantAsync(int restaurantId) =>
            await _unitOfWork.reservation.GetAsync(expression: r => r.RestaurantID == restaurantId);

        public async Task<Reservation?> GetReservationByIdAsync(int reservationId) =>
            await _unitOfWork.reservation.GetOneAsync(expression: r => r.ReservationID == reservationId);

        public async Task<Reservation?> CreateReservationAsync(Reservation reservation)
        {
            // Check if there's an existing reservation for the same restaurant, table, date, and time slot
            var existingReservation = await _unitOfWork.reservation.GetOneAsync(expression: r =>
                r.RestaurantID == reservation.RestaurantID &&
                r.TableId == reservation.TableId &&  // Ensure the table is not double-booked
               r.ReservationDate == reservation.ReservationDate &&
               r.TimeSlotID == reservation.TimeSlotID // Same time slot
            );

            
            if (existingReservation != null)
            {
                return null;
            }

            
            await _unitOfWork.reservation.CreateAsync(reservation);
            await _unitOfWork.CompleteAsync();
            return reservation;
        }


        public async Task<bool> CancelReservationAsync(int reservationId)
        {
            var reservation = await _unitOfWork.reservation.GetOneAsync(expression: r => r.ReservationID == reservationId);
            if (reservation == null) return false;

            _unitOfWork.reservation.Delete(reservation);
            await _unitOfWork.CompleteAsync();
            return true;
        }

        public async Task<Reservation?> ApproveReservationAsync(int reservationId)
        {
            var reservation = await _unitOfWork.reservation.GetOneAsync(expression: r => r.ReservationID == reservationId);
            if (reservation == null) return null;

            reservation.Status = ReservationStatus.Confirmed;
            _unitOfWork.reservation.Edit(reservation);
            await _unitOfWork.CompleteAsync();
            return reservation;
        }

        public async Task<Reservation?> RejectReservationAsync(int reservationId)
        {
            var reservation = await _unitOfWork.reservation.GetOneAsync(expression: r => r.ReservationID == reservationId);
            if (reservation == null) return null;

            reservation.Status = ReservationStatus.Rejected;
            _unitOfWork.reservation.Edit(reservation);
            await _unitOfWork.CompleteAsync();
            return reservation;
        }

        
    }

}

using infrastructures.Repository;
using infrastructures.Services.IServices;
using infrastructures.UnitOfWork;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.EntityFrameworkCore;
using Models.Models;
using RestaurantManagementSystem.Models;
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
        private readonly IEmailSender _emailSender;
        private readonly UserManager<ApplicationUser> _userManager;
        public ReservationService(IUnitOfWork unitOfWork,IEmailSender emailSender, UserManager<ApplicationUser> userManager)
        {
            _unitOfWork = unitOfWork;
            _emailSender = emailSender;
            _userManager = userManager;
        }

        public async Task<IEnumerable<Reservation>> GetReservationsByRestaurantAsync(int restaurantId) =>
            await _unitOfWork.reservation.GetAsync(expression: r => r.RestaurantID == restaurantId);

        public async Task<Reservation?> GetReservationByIdAsync(int reservationId) =>
            await _unitOfWork.reservation.GetOneAsync(expression: r => r.ReservationID == reservationId);
        public async Task<Reservation> CreateReservationAsync(Reservation reservation)
        {
            var existingReservation = await _unitOfWork.reservation.GetOneAsync(expression: r =>
                r.RestaurantID == reservation.RestaurantID &&
                r.TableId == reservation.TableId &&
                r.ReservationDate == reservation.ReservationDate &&
                r.TimeSlotID == reservation.TimeSlotID &&
                r.Status == ReservationStatus.Confirmed
            );

            if (existingReservation != null)
                throw new InvalidOperationException("❌ This table is already reserved for the selected date and time.");
            var exists = await _unitOfWork.reservation.GetOneAsync(expression: r =>
            r.UserID == reservation.UserID &&
            r.TableId == reservation.TableId && 
            r.ReservationDate == reservation.ReservationDate &&
            r.TimeSlotID == reservation.TimeSlotID);
            if (exists !=null)
            {
                throw new InvalidOperationException("You already have a reservation for this time.");
            }
            await _unitOfWork.reservation.CreateAsync(reservation);
            await _unitOfWork.CompleteAsync();

            var user = await _userManager.FindByIdAsync(reservation.UserID);
            if (user != null)
            {
                string message = $@"
            <h3>Reservation Submitted!</h3>
            <p>Restaurant ID: {reservation.RestaurantID}</p>
            <p>Table ID: {reservation.TableId}</p>
            <p>Date: {reservation.ReservationDate:yyyy-MM-dd}</p>
            <p>Time Slot ID: {reservation.TimeSlotID}</p>
            <p>Status: {reservation.Status}</p>
        ";

                await _emailSender.SendEmailAsync(user.Email, "✅ Reservation Submitted", message);
            }

            return reservation;
        }


        public async Task<bool> CancelReservationAsync(int reservationId)
        {
            var reservation = await _unitOfWork.reservation.GetOneAsync(expression: r => r.ReservationID == reservationId);
            if (reservation == null) return false;

            _unitOfWork.reservation.Delete(reservation);
            await _unitOfWork.CompleteAsync();
            var user = await _userManager.FindByIdAsync(reservation.UserID);
            if (user != null)
            {
                string message = $@"
            <h3>Reservation Cancelled</h3>
            <p>Your reservation for {reservation.ReservationDate:yyyy-MM-dd} has been <b>cancelled</b>.</p>
            <p>If this was a mistake, feel free to book again.</p>";

                await _emailSender.SendEmailAsync(user.Email, "❌ Reservation Cancelled", message);
            }

            return true;
        }


        public async Task<Reservation?> ApproveReservationAsync(int reservationId)
        {
            var reservation = await _unitOfWork.reservation.GetOneAsync(expression: r => r.ReservationID == reservationId);
            if (reservation == null) return null;
            if (reservation.Status != ReservationStatus.Pending)
                throw new InvalidOperationException("Reservation is already processed.");
            var isDuplicate = await _unitOfWork.reservation.GetOneAsync(expression: r =>
        r.ReservationID != reservation.ReservationID && // exclude current
        r.UserID == reservation.UserID &&
        r.TableId == reservation.TableId &&
        r.ReservationDate == reservation.ReservationDate &&
        r.TimeSlotID == reservation.TimeSlotID &&
        r.Status == ReservationStatus.Confirmed);

            if (isDuplicate !=null)
                throw new InvalidOperationException("Another confirmed reservation exists for this time and table.");
            reservation.Status = ReservationStatus.Confirmed;
            _unitOfWork.reservation.Edit(reservation);
            await _unitOfWork.CompleteAsync();

            var user = await _userManager.FindByIdAsync(reservation.UserID);
            if (user != null)
            {
                string message = $@"
            <h3>Reservation Approved</h3>
            <p>Your reservation for {reservation.ReservationDate:yyyy-MM-dd} has been <b>approved</b>.</p>
            <p>We look forward to seeing you!</p>";

                await _emailSender.SendEmailAsync(user.Email, "✅ Reservation Approved", message);
            }

            return reservation;
        }

        public async Task<Reservation?> RejectReservationAsync(int reservationId)
        {
            var reservation = await _unitOfWork.reservation.GetOneAsync(expression: r => r.ReservationID == reservationId);
            if (reservation == null) return null;
            if (reservation.Status != ReservationStatus.Pending)
                throw new InvalidOperationException("Reservation is already processed.");
            reservation.Status = ReservationStatus.Rejected;
            _unitOfWork.reservation.Edit(reservation);
            await _unitOfWork.CompleteAsync();
            var user = await _userManager.FindByIdAsync(reservation.UserID);
            if (user != null)
            {
                string message = $@"
            <h3>Reservation Rejected</h3>
            <p>We regret to inform you that your reservation for {reservation.ReservationDate:yyyy-MM-dd} was <b>rejected</b>.</p>
            <p>Please try booking another time slot.</p>";

                await _emailSender.SendEmailAsync(user.Email, "❌ Reservation Rejected", message);
            }

            return reservation;
        }


        public async Task<IEnumerable<Reservation>> GetUserReservations(string UserId = "")
        {
            return await _unitOfWork.reservation.GetAsync(expression: e => e.UserID == UserId);
        }
    }

}

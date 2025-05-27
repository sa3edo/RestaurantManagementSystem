import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import '../../Customer/myReservations/MyReservations.css';

const MySwal = withReactContent(Swal);

export default function ViewReservations() {
  const { restaurantID } = useParams();
  const [reservations, setReservations] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `https://localhost:7251/api/restaurant-manager/GetAllReservationByRestaurant/${restaurantID}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }
        );

        const slotsRes = await axios.get(
          `https://localhost:7251/api/restaurant-manager/GetTimeSlots?restaurantId=${restaurantID}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }
        );

        const fetchedReservations = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setReservations(fetchedReservations);
        console.log(fetchedReservations)
        setTimeSlots(slotsRes.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('❌ Error fetching reservations');
        setLoading(false);
      }
    };

    fetchData();
  }, [restaurantID]);

  const getTimeRange = (timeSlotID) => {
    const slot = timeSlots.find(t => t.timeSlotID === timeSlotID);
    if (!slot) return "Unknown Time";
    return `${formatTo12Hour(slot.startTime)} - ${formatTo12Hour(slot.endTime)}`;
  };

  const formatTo12Hour = (time) => {
    const [hour, minute] = time.split(':');
    const date = new Date();
    date.setHours(hour, minute);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const handleConfirm = async (id) => {
    const result = await MySwal.fire({
      title: 'Are you sure?',
      text: "You are about to confirm this reservation!",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, confirm it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await axios.put(
          `https://localhost:7251/api/restaurant-manager/reservations/${id}/accept`,
          {},
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        setReservations(prev => prev.map(r => r.reservationID === id ? { ...r, status: 1 } : r));
        MySwal.fire('✅ Confirmed!', 'Reservation has been confirmed.', 'success');
      } catch (err) {
        console.error(err);
        MySwal.fire('❌ Error', 'Failed to confirm reservation.', 'error');
      }
    }
  };

  const handleReject = async (id) => {
    const result = await MySwal.fire({
      title: 'Reject this reservation?',
      text: "This action cannot be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, reject it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await axios.put(
          `https://localhost:7251/api/restaurant-manager/reservations/${id}/reject`,
          {},
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        setReservations(prev => prev.map(r => r.reservationID === id ? { ...r, status: 2 } : r));
        MySwal.fire('🗑️ Rejected!', 'Reservation has been rejected.', 'success');
      } catch (err) {
        console.error(err);
        MySwal.fire('❌ Error', 'Failed to reject reservation.', 'error');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex-center">
        <div className="loader"></div>
      </div>
    );
  }

  if (error) {
    return <div className="error-message text-center mt-5">{error}</div>;
  }

  return (
    <div className="reservations-wrapper">
      <h2 className="reservations-title">📅 Reservations</h2>
      {reservations.length === 0 ? (
        <p className="no-data">No reservations found.</p>
      ) : (
        <div className="reservations-grid">
          {reservations.map((res, index) => (
            <div className="card " key={index}>
              <div className="card-body">
                <h5 className="card-title text-primary">
                  <i className="fas fa-envelope me-2"></i>
                  {res.customerEmail}
                </h5>
                <ul className="list-unstyled mt-3">
                  <li className="mb-2">
                    <i className="fas fa-calendar-alt me-2 text-secondary"></i>
                    <strong>Date:</strong> {res.reservationDate?.split('T')[0]}
                  </li>
                  <li><i class="fa-solid fa-clock text-secondary"></i><strong>Time:</strong> {formatTo12Hour(res.startTime)} - {formatTo12Hour(res.endTime)}</li>

                  <li className="mb-2">
                    <i className="fas fa-chair me-2 text-secondary"></i>
                    <strong>Table:</strong> {res.tableId}
                  </li>
                  <li className="mb-2">
                    <i className="fas fa-clipboard-list me-2 text-secondary"></i>
                    <strong>Status:</strong>
                    <span className={`status-pill ${res.status === 0 ? 'status-pending' : res.status === 1 ? 'status-complete' : 'status-cancel'}`}>
                      {res.status === 0 ? 'Pending' : res.status === 1 ? 'Confirmed' : 'Cancelled'}
                    </span>
                  </li>
                  {res.status === 0 && (
                    <li className="mt-3">
                      <button
                        className="btn btn-success btn-sm me-2"
                        onClick={() => handleConfirm(res.reservationID)}
                      >
                        ✅ Confirm
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleReject(res.reservationID)}
                      >
                        ❌ Reject
                      </button>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

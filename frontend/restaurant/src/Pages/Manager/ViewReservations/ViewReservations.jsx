import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

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

  const getStatusBadge = (status) => {
    switch (status) {
      case 0: return <span className="badge bg-warning text-dark">Pending</span>;
      case 1: return <span className="badge bg-success">Confirmed</span>;
      case 2: return <span className="badge bg-danger">Cancelled</span>;
      default: return <span className="badge bg-secondary">Unknown</span>;
    }
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

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (error) return <div className="text-danger text-center mt-5">{error}</div>;

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">📅 Reservations</h2>
      {reservations.length === 0 ? (
        <p className="text-center text-muted">No reservations found.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover text-center shadow-sm">
            <thead className="table-primary">
              <tr>
                <th>#</th>
                <th>Table #</th>
                <th>Customer Email</th>
                <th>Reservation Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((reservation, index) => (
                <tr key={reservation.reservationID}>
                  <td>{index + 1}</td>
                  <td>{reservation.tableId}</td>
                  <td>{reservation.customerEmail}</td>
                  <td>{reservation.reservationDate}</td>
                  <td>{getTimeRange(reservation.timeSlotID)}</td>
                  <td>{getStatusBadge(reservation.status)}</td>
                  <td>
  {reservation.status === 0 ? (
    <>
      <button
        className="btn btn-success btn-sm me-2"
        onClick={() => handleConfirm(reservation.reservationID)}
      >
        ✅ Confirm
      </button>
      <button
        className="btn btn-outline-danger btn-sm"
        onClick={() => handleReject(reservation.reservationID)}
      >
        ❌ Reject
      </button>
    </>
  ) : (
    <button className="btn btn-secondary btn-sm" disabled>
      No actions available
    </button>
  )}
</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

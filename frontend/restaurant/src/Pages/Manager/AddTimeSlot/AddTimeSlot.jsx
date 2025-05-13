import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';


export default function AddTimeSlot() {
  const { restaurantID } = useParams();
  const navigate = useNavigate();

  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `https://localhost:7251/api/restaurant-manager/CreateTimeSlot?restaurantId=${restaurantID}`,
        {
          timeSlotID: 0,
          startTime,
          endTime,
          isAvailable,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setSuccess('✅ Time Slot added successfully!');
      setError('');
      setStartTime('');
      setEndTime('');
      setIsAvailable(true);

      setTimeout(() => navigate(-1), 2000);
    } catch (err) {
      console.error('❌ Error adding time slot:', err.response?.data || err.message);
      setError('❌ Failed to add Time Slot.');
      setSuccess('');
    }
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-4 text-center text-info">🕒 Add New Reservation Time Slot</h3>
      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      <form className="p-4 shadow rounded bg-light" onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Start Time</label>
          <input type="time" className="form-control" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label className="form-label">End Time</label>
          <input type="time" className="form-control" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
        </div>
        <div className="form-check mb-3">
          <input type="checkbox" className="form-check-input" id="isAvailable" checked={isAvailable} onChange={() => setIsAvailable(!isAvailable)} />
          <label className="form-check-label" htmlFor="isAvailable">Is Available</label>
        </div>
        <button type="submit" className="btn btn-primary w-100">➕ Add Time Slot</button>
        <button type="button" className="btn btn-outline-dark w-100 mt-2" onClick={() => navigate(-1)}>🔙 Back</button>
      </form>
    </div>
  );
}

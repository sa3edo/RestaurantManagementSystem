import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const formatTime = (time) => {
  const [hours, minutes] = time.split(':');
  let formattedHours = parseInt(hours, 10);
  const ampm = formattedHours >= 12 ? 'PM' : 'AM';
  formattedHours = formattedHours % 12 || 12;
  return `${formattedHours}:${minutes} ${ampm}`;
};

export default function AllTimeSlots() {
  const { restaurantID } = useParams();
  const restaurantId = parseInt(restaurantID);
  const [timeSlots, setTimeSlots] = useState([]);
  const [restaurantName, setRestaurantName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRestaurantDetails = async () => {
    try {
      const response = await axios.get(
        `https://localhost:7251/api/restaurant-manager/GetRestaurantDetails?RestaurantId=${restaurantId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      setRestaurantName(response.data?.name || 'Unknown Restaurant');
    } catch (err) {
      console.error('❌ Error fetching restaurant details:', err);
      setError('❌ Failed to fetch restaurant details.');
    }
  };

  const fetchTimeSlots = async () => {
    try {
      const response = await axios.get(
        `https://localhost:7251/api/restaurant-manager/GetTimeSlots?restaurantId=${restaurantId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      setTimeSlots(Array.isArray(response.data) ? response.data : []);
      setLoading(false);
    } catch (err) {
      console.error('❌ Error fetching time slots:', err);
      setError('❌ Failed to fetch time slots.');
      setLoading(false);
    }
  };

  const deleteTimeSlot = async (timeSlotID) => {
    if (!window.confirm('Are you sure you want to delete this time slot?')) return;

    try {
      await axios.delete(
        `https://localhost:7251/api/restaurant-manager/DeleteTimeSlot/${timeSlotID}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      alert('✅ Time slot deleted successfully!');
      fetchTimeSlots();
    } catch (err) {
      console.error('❌ Error deleting time slot:', err);
      alert('❌ Failed to delete time slot.');
    }
  };

  useEffect(() => {
    if (restaurantId) {
      fetchRestaurantDetails();
      fetchTimeSlots();
    }
  }, [restaurantId]);

  if (loading) return <p className="text-center mt-5">Loading time slots...</p>;
  if (error) return <p className="text-danger text-center mt-5">{error}</p>;

  return (
    <div className="container mt-5">
      <h3 className="text-center mb-4">🕒 Time Slots for <span className="text-primary">{restaurantName}</span></h3>

      {timeSlots.length === 0 ? (
        <p className="text-center text-muted">No time slots available.</p>
      ) : (
        <div className="row">
          {timeSlots.map((slot) => (
            <div key={slot.timeSlotID} className="col-md-4 mb-4">
              <div className="card shadow-sm h-100 rounded-4">
                <div className="card-body text-center">
                  <h5 className="card-title">
                    ⏰ {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                  </h5>
                  <p>Status: {slot.isAvailable ? '✅ Available' : '❌ Unavailable'}</p>
                  <button className="btn btn-danger w-100" onClick={() => deleteTimeSlot(slot.timeSlotID)}>
                    🗑️ Delete Time Slot
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-center mt-4">
        <button
          className="btn btn-success px-4"
          onClick={() => window.location.href = `/manager/addTimeSlot/${restaurantId}`}
        >
          ➕ Add Time Slot
        </button>
      </div>
    </div>
  );
}

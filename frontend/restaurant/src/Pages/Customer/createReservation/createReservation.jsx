import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import './CreateReservation.css';

export default function CreateReservation() {
    const { restaurantId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [timeSlots, setTimeSlots] = useState([]);
    const [tables, setTables] = useState([]);
    const [formData, setFormData] = useState({
        timeSlotID: '',
        tableId: '',
        reservationDate: ''
    });

    const formatTime = (timeString) => {
        try {
            const [hours, minutes] = timeString.split(':');
            const date = new Date();
            date.setHours(parseInt(hours));
            date.setMinutes(parseInt(minutes));
            return date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        } catch (error) {
            console.error('Error formatting time:', error);
            return timeString;
        }
    };

    useEffect(() => {
        const fetchTimeSlots = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const response = await axios.get(
                    `https://localhost:7251/api/User/GetTimeSlots?restaurantId=${restaurantId}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'accept': '*/*'
                        }
                    }
                );
                if (response.data && Array.isArray(response.data)) {
                    const sorted = response.data.sort((a, b) =>
                        a.startTime.localeCompare(b.startTime)
                    );
                    setTimeSlots(sorted);
                } else {
                    setTimeSlots([]);
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to fetch time slots.'
                });
            } finally {
                setLoading(false);
            }
        };

        if (restaurantId) fetchTimeSlots();
    }, [restaurantId]);

    useEffect(() => {
        const fetchTables = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(
                    `https://localhost:7251/api/User/GetTables?restaurantId=${restaurantId}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'accept': '*/*'
                        }
                    }
                );
                if (response.data && Array.isArray(response.data)) {
                    setTables(response.data);
                } else {
                    setTables([]);
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to fetch tables.'
                });
            }
        };

        if (restaurantId) fetchTables();
    }, [restaurantId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            await axios.post(
                'https://localhost:7251/api/User/CreateReservation',
                {
                    reservationID: 0,
                    restaurantID: parseInt(restaurantId),
                    timeSlotID: parseInt(formData.timeSlotID),
                    tableId: parseInt(formData.tableId),
                    reservationDate: formData.reservationDate
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'accept': '*/*'
                    }
                }
            );

            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Your reservation has been created successfully.',
                showConfirmButton: true
            }).then(() => {
                navigate('/customer/allRestaurants');
            });

        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Failed to create reservation.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="reservation-container rounded-2">
            <div className="reservation-card">
                <h2 className="heading">Make a Reservation</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Date</label>
                        <input
                            type="date"
                            name="reservationDate"
                            value={formData.reservationDate}
                            onChange={handleChange}
                            min={new Date().toISOString().split('T')[0]}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Time Slot</label>
                        <select
                            name="timeSlotID"
                            value={formData.timeSlotID}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        >
                            <option value="">Select a time slot</option>
                            {timeSlots.map(slot => (
                                <option key={slot.id || slot.timeSlotID} value={slot.id || slot.timeSlotID}>
                                    {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                </option>
                            ))}
                        </select>
                        {loading && <p>Loading time slots...</p>}
                    </div>

                    <div className="form-group">
                        <label>Table</label>
                        <select
                            name="tableId"
                            value={formData.tableId}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select a table</option>
                            {tables.map(table => (
                                <option key={table.tableId} value={table.tableId}>
                                    Table {table.tableId} - {table.seats} seats
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            onClick={() => navigate('/customer/allRestaurants')}
                            className="cancel-btn"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="submit-btn"
                        >
                            {loading ? 'Creating...' : 'Create Reservation'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

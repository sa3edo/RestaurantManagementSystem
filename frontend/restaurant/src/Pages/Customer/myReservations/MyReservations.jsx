import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './MyReservations.css';

function MyReservations() {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReservations = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(
                    'https://localhost:7251/api/User/GetUserReservations',
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'accept': '*/*'
                        }
                    }
                );
                if (Array.isArray(response.data)) {
                    setReservations(response.data);
                } else {
                    setReservations([]);
                }
            } catch (err) {
                setError('Failed to fetch reservations.');
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to fetch reservations. Please try again later.'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchReservations();
    }, []);

    if (loading) {
        return (
            <div className="text-center my-5">
                <div className="spinner-border text-primary" role="status" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-danger my-5">
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="container my-5">
            <h2 className="text-center mb-4">My Reservations</h2>
            <div className="row">
                {reservations.length > 0 ? (
                    reservations.map((res, index) => (
                        <div className="col-md-4 mb-4" key={index}>
                            <div className="card shadow-sm h-100">
                                <div className="card-body ">
                                    <h5 className="card-title text-primary">
                                        <i className="fas fa-utensils me-2"></i>
                                        {res.restaurantName || 'Restaurant'}
                                    </h5>
                                    <ul className="list-unstyled mt-3">
                                        <li className="mb-2">
                                            <i className="fas fa-calendar-alt me-2 text-secondary"></i>
                                            <strong>Date:</strong> {res.reservationDate?.split('T')[0]}
                                        </li>
                                        <li className="mb-2">
                                            <i className="fas fa-clock me-2 text-secondary"></i>
                                            <strong>Start Time:</strong> {res.startTime || 'N/A'}
                                        </li>
                                        <li className="mb-2">
                                            <i className="fas fa-clock me-2 text-secondary"></i>
                                            <strong>End Time:</strong> {res.endTime || 'N/A'}
                                        </li>
                                        <li className="mb-2">
                                            <i className="fas fa-chair me-2 text-secondary"></i>
                                            <strong>Table:</strong> {res.tableId}
                                        </li>
                                        <li>
                                            <i className="fas fa-clipboard-list me-2 text-secondary"></i>
                                            <strong>Status:</strong>
                                            <span
                                                className={`status-pill ${res.status === 0 ? 'status-pending' : res.status === 1 ? 'status-complete' : 'status-cancel'}`}
                                            >
                                                {res.status === 0
                                                    ? 'Pending'
                                                    : res.status === 1
                                                        ? 'Completed'
                                                        : 'Cancelled'}
                                            </span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center">
                        <p>No reservations found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MyReservations;

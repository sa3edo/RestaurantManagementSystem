import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';

const ShowReservations = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    const fetchReservations = async () => {
        try {
            setLoading(true);
            console.log("Fetching reservations started...");

            const token = localStorage.getItem('token');
            console.log("Token from localStorage:", token);
            if (!token) {
                throw new Error('No authentication token found');
            }

            const searchParams = new URLSearchParams(location.search);
            const restaurantId = searchParams.get('restaurantId');
            console.log("Extracted restaurantId:", restaurantId);

            if (!restaurantId) {
                throw new Error('Restaurant ID is required');
            }

            const url = `https://localhost:7251/api/admin/GetAllReservations?restaurantId=${restaurantId}&search=&pageNumber=1`;
            console.log('Fetching reservations with URL:', url);

            const response = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'accept': '*/*'
                }
            });

            console.log('API Response:', response.data);

            let reservationsData = [];
            if (Array.isArray(response.data)) {
                reservationsData = response.data;
            } else if (response.data && typeof response.data === 'object') {
                if (Array.isArray(response.data.data)) {
                    reservationsData = response.data.data;
                } else if (Array.isArray(response.data.items)) {
                    reservationsData = response.data.items;
                } else if (Array.isArray(response.data.reservations)) {
                    reservationsData = response.data.reservations;
                } else {
                    const firstArray = Object.values(response.data).find(value => Array.isArray(value));
                    if (firstArray) {
                        reservationsData = firstArray;
                    }
                }
            }

            console.log('Processed Reservations Data:', reservationsData);
            setReservations(reservationsData);
            setError(null);
        } catch (err) {
            setError('Failed to fetch reservations');
            console.error('Error fetching reservations:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.response?.data?.message || err.message || 'Failed to fetch reservations'
            });
        } finally {
            setLoading(false);
            console.log("Loading set to false");
        }
    };

    useEffect(() => {
        console.log("useEffect triggered, location.search:", location.search);
        try {
            fetchReservations();
        } catch (e) {
            console.error("Unexpected Error in useEffect:", e);
        }
    }, [location.search]);

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    if (error) return (
        <div className="text-center p-4">
            <div className="text-red-500 mb-4">Error: {error}</div>
            <button 
                onClick={() => window.location.reload()} 
                className="btn btn-primary"
            >
                Retry
            </button>
        </div>
    );

    return (
    <div className="min-vh-100 p-4">
<div className="container">
<div className="">
    <div className="main p-5 rounded-4 shadow">
    <h1 className=" fw-bold mb-4 text-dark">Restaurant Reservations</h1>

    {reservations && reservations.length > 0 ? (
        <div className="row g-3">
        {reservations.map((reservation) => {
            const {
            reservationID,
            customerEmail,
            reservationDate,
            startTime,
            endTime,
            status
            } = reservation;

            const dateOnly = reservationDate?.split('T')[0] || 'N/A';

            let statusText = 'Unknown';
            let badgeClass = 'bg-secondary';

            if (status === 1) {
            statusText = 'Confirmed';
            badgeClass = 'bg-success';
            } else if (status === 0) {
            statusText = 'Pending';
            badgeClass = 'bg-warning text-dark';
            }

            return (
            <div className="col-md-6 col-lg-4" key={reservationID}>
                <div className="card h-100 shadow-sm border-0">
                <div className="card-body">
                    <h5 className="card-title">Reservation #{reservationID}</h5>
                    <p className="mb-1"><strong>Customer:</strong> {customerEmail || 'N/A'}</p>
                    <p className="mb-1"><strong>Date:</strong> {dateOnly}</p>
                    <p className="mb-1"><strong>Start Time:</strong> {startTime || 'N/A'}</p>
                    <p className="mb-2"><strong>End Time:</strong> {endTime || 'N/A'}</p>
                    <span className={`badge ${badgeClass}`}>{statusText}</span>
                </div>
                </div>
            </div>
            );
        })}
        </div>
    ) : (
        <div className="text-center text-muted">No reservations found</div>
    )}
    </div>
</div>
</div>
    </div>

    
    );
};

export default ShowReservations;

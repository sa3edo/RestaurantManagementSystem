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
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">Restaurant Reservations</h2>
                    
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reservation ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Time</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {reservations && reservations.length > 0 ? (
                                    reservations.map((reservation) => (
                                        <tr key={reservation.reservationID} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {reservation.reservationID}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {reservation.customerEmail || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {reservation.reservationDate?.split('T')[0] || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {reservation.startTime || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {reservation.endTime || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${reservation.status === 1 ? 'bg-green-100 text-green-800' : 
                                                      reservation.status === 0 ? 'bg-yellow-100 text-yellow-800' : 
                                                      'bg-gray-100 text-gray-800'}`}>
                                                    {reservation.status === 1 ? 'Confirmed' : 
                                                     reservation.status === 0 ? 'Pending' : 
                                                     'Unknown'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                            No reservations found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShowReservations;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const AdminRes = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
    };

    const fetchAdminRestaurants = async (page) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await axios.get(
                `https://localhost:7251/api/admin/GetAdminRestaurants?page=${page}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'accept': '*/*'
                    }
                }
            );

            console.log('Full API Response:', response.data);
            
            let restaurantsData = [];
            if (Array.isArray(response.data)) {
                restaurantsData = response.data;
            } else if (response.data && typeof response.data === 'object') {
                if (Array.isArray(response.data.data)) {
                    restaurantsData = response.data.data;
                } else if (Array.isArray(response.data.items)) {
                    restaurantsData = response.data.items;
                } else if (Array.isArray(response.data.restaurants)) {
                    restaurantsData = response.data.restaurants;
                } else if (response.data.restaurants && Array.isArray(response.data.restaurants)) {
                    restaurantsData = response.data.restaurants;
                } else {
                    const firstArray = Object.values(response.data).find(value => Array.isArray(value));
                    if (firstArray) {
                        restaurantsData = firstArray;
                    }
                }

                if (response.data.totalPages) {
                    setTotalPages(response.data.totalPages);
                } else if (response.data.total) {
                    setTotalPages(Math.ceil(response.data.total / 10));
                }
            }

            console.log('Processed Restaurants Data:', restaurantsData);
            if (restaurantsData.length > 0) {
                console.log('First restaurant object structure:', restaurantsData[0]);
                console.log('All properties of first restaurant:', Object.keys(restaurantsData[0]));
            }

            setRestaurants(restaurantsData);
            setError(null);
        } catch (err) {
            setError('Failed to fetch restaurants');
            console.error('Error fetching restaurants:', err);
            if (err.response?.status === 401) {
                handleLogout();
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdminRestaurants(currentPage);
    }, [currentPage]);

    if (loading) return <div className="text-center p-4">Loading...</div>;
    if (error) return <div className="text-center p-4 text-red-500">Error: {error}</div>;

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Admin Restaurants</h1>
                    <div className="flex space-x-4">
                        <button
                            onClick={() => navigate('/admin/add-restaurant')}
                            className="btn btn-primary"
                        >
                            Add Restaurant
                        </button>
                        <button
                            onClick={handleLogout}
                            className="btn btn-danger"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="bg-white shadow rounded-lg p-6">
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border border-gray-300">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-3 border-b border-gray-300 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            ID
                                        </th>
                                        <th className="px-6 py-3 border-b border-gray-300 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 border-b border-gray-300 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Description
                                        </th>
                                        <th className="px-6 py-3 border-b border-gray-300 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Location
                                        </th>
                                        <th className="px-6 py-3 border-b border-gray-300 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 border-b border-gray-300 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Image
                                        </th>
                                        <th className="px-6 py-3 border-b border-gray-300 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {restaurants.map((restaurant) => {
                                        const restaurantId = restaurant.restaurantID;
                                        console.log('Current restaurant:', restaurant);
                                        console.log('Restaurant ID to use:', restaurantId);
                                        
                                        const imagePath = restaurant.restImg || 
                                                        restaurant.imgUrl || 
                                                        restaurant.image || 
                                                        restaurant.imageUrl || 
                                                        restaurant.restaurantImage;
                                        
                                        return (
                                            <tr key={restaurantId} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-300">
                                                    {restaurantId}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-300">
                                                    {restaurant.name}
                                                </td>
                                                <td className="px-6 py-4 border-b border-gray-300">
                                                    {restaurant.description}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-300">
                                                    {restaurant.location}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-300">
                                                    {restaurant.email}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-300">
                                                    {imagePath && (
                                                        <div className="flex items-center justify-center">
                                                            <img 
                                                                src={`https://localhost:7251/RestImages/${imagePath}`}
                                                                alt={restaurant.name}
                                                                className="h-20 w-20 object-cover rounded"
                                                                style={{ height: '100px', objectFit: 'cover' }}
                                                                onError={(e) => {
                                                                    console.error('Image failed to load:', e.target.src);
                                                                    e.target.onerror = null;
                                                                    e.target.src = 'https://via.placeholder.com/100';
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-300">
                                                    <button
                                                        onClick={() => {
                                                            try {
                                                                console.log('Update clicked for restaurant:', restaurant);
                                                                const id = restaurant.restaurantID || restaurant.id || restaurant.RestaurantID;
                                                                console.log('Restaurant ID being passed:', id);
                                                                
                                                                if (!id) {
                                                                    throw new Error('No valid restaurant ID found');
                                                                }

                                                                console.log('Navigating to update page with ID:', id);
                                                                navigate(`/admin/update-restaurant/${id}?restaurantId=${id}`);
                                                            } catch (error) {
                                                                console.error('Error navigating to update page:', error);
                                                                Swal.fire({
                                                                    icon: 'error',
                                                                    title: 'Error',
                                                                    text: error.message || 'Failed to navigate to update page'
                                                                });
                                                            }
                                                        }}
                                                        className="btn btn-warning"
                                                    >
                                                        Update
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="mt-4 flex justify-center items-center">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="btn btn-info"
                            >
                                Previous
                            </button>
                            <span className="px-4 py-2">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                disabled={currentPage >= totalPages}
                                className="btn btn-success"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminRes;

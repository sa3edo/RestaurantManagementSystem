import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const ShowAllRes = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [foodCategories, setFoodCategories] = useState({});
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
    };

    const fetchFoodCategories = async (restaurantId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `https://localhost:7251/api/admin/GetFoodCategories?restaurantId=${restaurantId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'accept': '*/*'
                    }
                }
            );
            return response.data || [];
        } catch (error) {
            console.error(`Error fetching food categories for restaurant ${restaurantId}:`, error);
            return [];
        }
    };

    const fetchRestaurants = async (page) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await axios.get(
                `https://localhost:7251/api/admin/GetAllRestaurants?page=${page}`,
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
                // Try different possible response structures
                if (Array.isArray(response.data.data)) {
                    restaurantsData = response.data.data;
                } else if (Array.isArray(response.data.items)) {
                    restaurantsData = response.data.items;
                } else if (Array.isArray(response.data.restaurants)) {
                    restaurantsData = response.data.restaurants;
                } else if (response.data.restaurants && Array.isArray(response.data.restaurants)) {
                    restaurantsData = response.data.restaurants;
                } else {
                    // If none of the above, try to get the first array in the response
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

            // Log the processed data
            console.log('Processed Restaurants Data:', restaurantsData);

            // Fetch food categories for each restaurant
            const categoriesPromises = restaurantsData.map(async restaurant => {
                try {
                    const categories = await fetchFoodCategories(restaurant.restaurantID);
                    return { restaurantId: restaurant.restaurantID, categories };
                } catch (error) {
                    console.warn(`Skipping food categories for restaurant ${restaurant.restaurantID} due to error:`, error);
                    return { restaurantId: restaurant.restaurantID, categories: [] };
                }
            });

            const categoriesResults = await Promise.all(categoriesPromises);

            const categoriesMap = {};
            categoriesResults.forEach(({ restaurantId, categories }) => {
                if (restaurantId) {
                    categoriesMap[restaurantId] = categories;
                }
            });

            setFoodCategories(categoriesMap);
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
        fetchRestaurants(currentPage);
    }, [currentPage]);

    const handleDeleteRestaurant = async (restaurantId) => {
        try {
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!'
            });

            if (result.isConfirmed) {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No authentication token found');
                }

                const response = await axios.delete(
                    `https://localhost:7251/api/admin/DeleteRestaurant/${restaurantId}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (response.status === 200) {
                    // Remove the deleted restaurant from the state
                    setRestaurants(prevRestaurants =>
                        prevRestaurants.filter(restaurant => {
                            const currentId = restaurant.id || restaurant.restaurantID || restaurant.RestaurantID;
                            return currentId !== restaurantId;
                        })
                    );

                    // Show success alert with timer
                    await Swal.fire({
                        title: 'Success!',
                        text: 'This restaurant and all its related data were deleted successfully.',
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false,
                        position: 'top-end',
                        toast: true,
                        background: '#4CAF50',
                        color: 'white'
                    });

                    // Refresh the restaurants list
                    fetchRestaurants(currentPage);
                }
            }
        } catch (err) {
            console.error('Delete error:', err);

            let errorMessage = 'Failed to delete restaurant.';

            if (err.response) {
                if (err.response.status === 401) {
                    errorMessage = 'Unauthorized. Please login again.';
                    handleLogout();
                } else if (err.response.status === 404) {
                    errorMessage = 'Restaurant not found.';
                } else if (err.response.data) {
                    errorMessage = typeof err.response.data === 'string'
                        ? err.response.data
                        : JSON.stringify(err.response.data);
                }
            }

            Swal.fire(
                'Error!',
                errorMessage,
                'error'
            );
        }
    };


    const handleApproveRestaurant = async (restaurantId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            console.log('Approving restaurant with ID:', restaurantId);

            const response = await axios.put(
                `https://localhost:7251/api/admin/restaurants/${restaurantId}/approve`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'accept': '*/*',
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.status === 200) {
                // Update the restaurant status in the local state
                setRestaurants(prevRestaurants =>
                    prevRestaurants.map(restaurant =>
                        restaurant.restaurantID === restaurantId
                            ? { ...restaurant, status: 1 }
                            : restaurant
                    )
                );

                // Show success message
                Swal.fire({
                    title: 'Success!',
                    text: 'Restaurant has been approved successfully.',
                    icon: 'success',
                    confirmButtonText: 'OK'
                });
            }
        } catch (err) {
            console.error('Error approving restaurant:', err);
            Swal.fire(
                'Error!',
                'Failed to approve restaurant',
                'error'
            );
        }
    };

    const handleRejectRestaurant = async (restaurantId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            console.log('Rejecting restaurant with ID:', restaurantId);

            const response = await axios.put(
                `https://localhost:7251/api/admin/restaurants/${restaurantId}/reject`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'accept': '*/*',
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.status === 200) {
                // Update the restaurant status in the local state
                setRestaurants(prevRestaurants =>
                    prevRestaurants.map(restaurant =>
                        restaurant.restaurantID === restaurantId
                            ? { ...restaurant, status: 2 }
                            : restaurant
                    )
                );

                // Show success message
                Swal.fire({
                    title: 'Success!',
                    text: 'Restaurant has been rejected successfully.',
                    icon: 'success',
                    confirmButtonText: 'OK'
                });
            }
        } catch (err) {
            console.error('Error rejecting restaurant:', err);
            Swal.fire(
                'Error!',
                'Failed to reject restaurant',
                'error'
            );
        }
    };

    if (loading) return <div className="text-center p-4">Loading...</div>;
    if (error) return <div className="text-center p-4 text-red-500">Error: {error}</div>;

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">All Restaurants</h1>
                    <div className="flex space-x-4">
                    <button
                                onClick={() => navigate('/admin/add-restaurant')}
                                className="btn btn-primary"
                            >
                                Create Restaurant
                            </button>
                            <button
                                onClick={() => navigate('/admin/all-restaurants')}
                                className="btn btn-primary"
                            >
                                Show All Restaurants
                            </button>
                            <button
                                onClick={() => navigate('/admin/add-restaurant-manager')}
                                className="btn btn-primary"
                            >
                                Add Restaurant Manager
                            </button>
                            <button
                                onClick={() => navigate('/admin/admin-restaurants')}
                                className="btn btn-primary"
                            >
                                Show Admin Restaurants
                            </button>
                            {/* <button
                                onClick={() => navigate('/admin/getAllOrders')}
                                className="btn btn-primary"
                            >
                                Show All Orders
                            </button> */}
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
                                            Status
                                        </th>
                                        <th className="px-6 py-3 border-b border-gray-300 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Show Categories
                                        </th>
                                        <th className="px-6 py-3 border-b border-gray-300 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Add Food Category
                                        </th>
                                        <th className="px-6 py-3 border-b border-gray-300 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {restaurants.map((restaurant) => {
                                        const restaurantId = restaurant.restaurantID;
                                        const categories = foodCategories[restaurantId] || [];

                                        // Try different possible image property names
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
                                                    {restaurant.status === 0 ? (
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={() => {
                                                                    console.log('Button clicked for restaurant:', restaurant);
                                                                    const idToApprove = restaurant.restaurantID;

                                                                    console.log('ID to approve:', idToApprove);

                                                                    if (idToApprove) {
                                                                        handleApproveRestaurant(idToApprove);
                                                                    } else {
                                                                        console.error('No valid ID found for restaurant:', restaurant);
                                                                        Swal.fire(
                                                                            'Error!',
                                                                            'Could not find restaurant ID',
                                                                            'error'
                                                                        );
                                                                    }
                                                                }}
                                                                className="btn btn-primary"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    console.log('Button clicked for restaurant:', restaurant);
                                                                    const idToReject = restaurant.restaurantID;

                                                                    console.log('ID to reject:', idToReject);

                                                                    if (idToReject) {
                                                                        handleRejectRestaurant(idToReject);
                                                                    } else {
                                                                        console.error('No valid ID found for restaurant:', restaurant);
                                                                        Swal.fire(
                                                                            'Error!',
                                                                            'Could not find restaurant ID',
                                                                            'error'
                                                                        );
                                                                    }
                                                                }}
                                                                className="btn btn-danger"
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        restaurant.status === 1 ? 'Approved' :
                                                            restaurant.status === 2 ? 'Rejected' : 'Unknown'
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-300">
                                                    <button
                                                        onClick={() => navigate(`/admin/show-food-categories/${restaurantId}`)}
                                                        className="btn btn-info"
                                                    >
                                                        Show Categories
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-300">
                                                    {categories.length === 0 && (
                                                        <button
                                                            onClick={() => {
                                                                const restaurantId = restaurant.restaurantID;
                                                                if (restaurantId) {
                                                                    navigate(`/admin/addFoodCategory/${restaurantId}`);
                                                                } else {
                                                                    Swal.fire(
                                                                        'Error!',
                                                                        'Could not find restaurant ID',
                                                                        'error'
                                                                    );
                                                                }
                                                            }}
                                                            className="btn btn-success"
                                                        >
                                                            Add Food Category
                                                        </button>
                                                    )}
                                                    {categories.length > 0 && (
                                                        <div className="flex flex-wrap gap-1">
                                                            {categories.map(category => (
                                                                <span
                                                                    key={category.categoryID || category.id}
                                                                    className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm"
                                                                >
                                                                    {category.name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-300">
                                                    <button
                                                        onClick={() => {
                                                            console.log('Delete button clicked for restaurant:', restaurant);
                                                            console.log('Restaurant ID to delete:', restaurantId);
                                                            if (restaurantId) {
                                                                handleDeleteRestaurant(restaurantId);
                                                            } else {
                                                                console.error('No valid ID found for restaurant:', restaurant);
                                                                Swal.fire(
                                                                    'Error!',
                                                                    'Could not find restaurant ID',
                                                                    'error'
                                                                );
                                                            }
                                                        }}
                                                        className="btn btn-danger"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => navigate(`/admin/getAllOrders?RestaurantId=${restaurant.restaurantID}`)}
                                                            className="btn btn-warning"
                                                        >
                                                            Get All Orders
                                                        </button>
                                                        <button
                                                            onClick={() => navigate(`/admin/ShowReservations?restaurantId=${restaurant.restaurantID}`)}
                                                            className="btn btn-warning"
                                                        >
                                                            Show Reservations
                                                        </button>
                                                        <button
                                                            onClick={() => navigate(`/admin/GetRestaurantReviews?RestID=${restaurant.restaurantID}`)}
                                                            className="btn btn-info"
                                                        >
                                                            Review
                                                        </button>
                                                    </div>
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

export default ShowAllRes;

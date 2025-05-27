import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../../../App.css'

const ShowAllRes = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [foodCategories, setFoodCategories] = useState({});
    const navigate = useNavigate();



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


            setRestaurants(restaurantsData);
            setError(null);
        } catch (err) {
            setError('Failed to fetch restaurants');
            console.error('Error fetching restaurants:', err);
           
            
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRestaurants(currentPage);
    }, [currentPage]);

    const handleDeleteRestaurant = async (restaurantId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }
    
            // Show confirmation dialog
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, delete it!'
            });
    
            if (result.isConfirmed) {
                await axios.delete(
                   ` https://localhost:7251/api/admin/DeleteRestaurant/${restaurantId}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'accept': '/',
                        }
                    }
                );
    
                // Show success message
                await Swal.fire(
                    'Deleted!',
                    'Restaurant and all related data have been deleted.',
                    'success'
                );
    
                // Refresh the restaurants list
                fetchRestaurants(currentPage);
            }
        } catch (err) {
            console.error('Delete error:', err);

            let errorMessage = 'Failed to delete restaurant.';

            if (err.response) {
                if (err.response.status === 401) {
                    errorMessage = 'Unauthorized. Please login again.';
                  
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
            // ✅ Re-fetch data from API to reflect the new status
            fetchRestaurants(currentPage);

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
            // ✅ Re-fetch data from API to reflect the new status
            fetchRestaurants(currentPage);

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
        <div className=" container-fluid min-vh-100 main" >
            {/* Header */}
            <header className="">
                <div className="container-fluid py-3 d-flex justify-content-between align-items-center">
                    <h1 className="section-title">All Restaurants</h1>
                    <div className="d-flex flex-wrap gap-2">
                        <button onClick={() => navigate('/admin/add-restaurant')} className="btn1 btn2 ">
                            Create Restaurant
                        </button>
                        <button onClick={() => navigate('/admin/add-restaurant-manager')} className="btn1  btn2">
                            Add Restaurant Manager
                        </button>
                        <button onClick={() => navigate('/admin/admin-restaurants')} className="btn1 btn2 ">
                            Show Admin Restaurants
                        </button>
                        <button onClick={() => navigate('/admin/GetAllUsers')} className="btn1 btn2 ">
                            Show All Users
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container-fluid py-5">
                <div className="cards p-4">
                    {/* Card Grid for Restaurants */}
                    <div className="row g-4">
                        {restaurants.map((restaurant) => {
                            const restaurantId = restaurant.restaurantID;
                            const categories = foodCategories[restaurantId] || [];
                            const imagePath =
                                restaurant.restImg ||
                                restaurant.imgUrl ||
                                restaurant.image ||
                                restaurant.imageUrl ||
                                restaurant.restaurantImage;

                            return (
                                <div key={restaurantId} className="col-md-6 col-lg-4">
                                    <div className="card admin-card bg-white shadow-sm h-100">
                                        {imagePath && (
                                            <img
                                                src={`https://localhost:7251/RestImages/${imagePath}`}
                                                alt={restaurant.name}
                                                className="card-img-top"
                                                style={{ height: '200px', objectFit: 'cover' }}
                                                onError={(e) => {
                                                    console.error('Image failed to load:', e.target.src);
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://via.placeholder.com/200';
                                                }}
                                            />
                                        )}
                                        <div className="card-body d-flex flex-column">
                                            <h5 className="card-title">{restaurant.name}</h5>
                                            <p className="card-text">
                                                <strong>Location:</strong> {restaurant.location}
                                            </p>
                                            <div className="mb-2">
                                                <strong>Status:</strong>{' '}
                                                {restaurant.status === 0 ? 'Pending' : restaurant.status === 1 ? 'Approved' : restaurant.status === 2 ? 'Rejected' : 'Unknown'}
                                            </div>

                                            {restaurant.status === 0 && (
                                                <div className="d-flex gap-2 mb-2">
                                                    <button onClick={() => handleApproveRestaurant(restaurantId)} className="btn btn-success btn-sm w-100">
                                                        Approve
                                                    </button>
                                                    <button onClick={() => handleRejectRestaurant(restaurantId)} className="btn btn-danger btn-sm w-100">
                                                        Reject
                                                    </button>
                                                </div>
                                            )}

                                            <div className="d-flex gap-2 mt-auto">

                                                {/* Categories Dropdown */}
                                                <div className="dropdown">
                                                    <button
                                                        className=" btn1 "
                                                        type="button"
                                                        data-bs-toggle="dropdown"
                                                        aria-expanded="false"
                                                    >
                                                        <i className="fas fa-folder-open me-1"></i> Categories
                                                    </button>
                                                    <ul className="dropdown-menu shadow-sm border-0 rounded-3 p-2 ">
                                                        <li>
                                                            <button
                                                                className="dropdown-item"
                                                                onClick={() => navigate(`/admin/show-food-categories/${restaurantId}`)}
                                                            >
                                                                <i className="fas fa-eye me-2"></i> Show Categories
                                                            </button>
                                                        </li>
                                                        {categories.length === 0 && (
                                                            <li>
                                                                <button
                                                                    className="dropdown-item"
                                                                    onClick={() => navigate(`/admin/addFoodCategory/${restaurantId}`)}
                                                                >
                                                                    <i className="fas fa-plus me-2"></i> Add Food Category
                                                                </button>
                                                            </li>
                                                        )}
                                                    </ul>
                                                </div>

                                                {/* Orders & Reservations Dropdown */}
                                                <div className="dropdown">
                                                    <button
                                                        className=" btn1 "
                                                        type="button"
                                                        data-bs-toggle="dropdown"
                                                        aria-expanded="false"
                                                    >
                                                        <i className="fas fa-receipt me-1"></i> Orders & <i className="fas fa-calendar-alt ms-1"></i> Reservations
                                                    </button>
                                                    <ul className="dropdown-menu shadow-sm border-0 rounded-3 p-2 ">
                                                        <li>
                                                            <button
                                                                className="dropdown-item"
                                                                onClick={() => navigate(`/admin/getAllOrders?RestaurantId=${restaurantId}`)}
                                                            >
                                                                <i className="fas fa-box me-2"></i> Get All Orders
                                                            </button>
                                                        </li>
                                                        <li>
                                                            <button
                                                                className="dropdown-item"
                                                                onClick={() => navigate(`/admin/ShowReservations?restaurantId=${restaurantId}`)}
                                                            >
                                                                <i className="fas fa-calendar-check me-2"></i> Show Reservations
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </div>

                                                {/* Other Actions Dropdown */}
                                                <div className="dropdown">
                                                    <button
                                                        className=" btn1 "
                                            
                                                        type="button"
                                                        data-bs-toggle="dropdown"
                                                        aria-expanded="false"
                                                    >
                                                        <i className="fas fa-cogs me-1"></i> Other Actions
                                                    </button>
                                                    <ul className="dropdown-menu shadow-sm border-0 rounded-3 p-2 ">
                                                        <li>
                                                            <button
                                                                className="dropdown-item"
                                                                onClick={() => navigate(`/admin/GetRestaurantReviews?RestID=${restaurantId}`)}
                                                            >
                                                                <i className="fas fa-star me-2"></i> Show Reviews
                                                            </button>
                                                        </li>
                                                        <li>
                                                            <button
                                                                className="dropdown-item text-danger"
                                                                onClick={() => handleDeleteRestaurant(restaurantId)}
                                                            >
                                                                <i className="fas fa-trash-alt me-2"></i> Delete Restaurant
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </div>

                                            </div>


                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    <div className="d-flex justify-content-center align-items-center mt-4 gap-3">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="btn btn-outline-primary"
                        >
                            Previous
                        </button>
                        <span className="fw-medium text-black">Page {currentPage} of {totalPages}</span>
                        <button
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            // disabled={currentPage >= totalPages}
                            className="btn btn-primary"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </main>
        </div>



    );
};

export default ShowAllRes;

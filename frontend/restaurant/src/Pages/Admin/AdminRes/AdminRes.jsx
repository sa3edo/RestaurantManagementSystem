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
        <div className="min-vh-100 main">
        <main className="container py-5 ">
        <div className="mb-4">
        <h1 className="mb-4 text-center fs-1">My Restaurants</h1>
        </div>

        <div className="row">
        {restaurants.map((restaurant) => {
            const restaurantId = restaurant.restaurantID;
            const imagePath =
            restaurant.restImg ||
            restaurant.imgUrl ||
            restaurant.image ||
            restaurant.imageUrl ||
            restaurant.restaurantImage;

            return (
            <div className="col-md-4 mb-4" key={restaurantId}>
                <div className="card shadow h-100">
                {imagePath && (
                    <img
                    src={`https://localhost:7251/RestImages/${imagePath}`}
                    alt={restaurant.name}
                    className="card-img-top"
                    style={{ height: '200px', objectFit: 'cover' }}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/200';
                    }}
                    />
                )}
                <div className="card-body d-flex flex-column">
                    <h5 className="card-title">Name : {restaurant.name}</h5>
                    <p className="card-text">Description : {restaurant.description}</p>
                    <p className="card-text text-muted">Location : {restaurant.location}</p>
                    <button
                    className="btn1 mt-auto"
                    onClick={() => {
                        try {
                        const id =
                            restaurant.restaurantID ||
                            restaurant.id ||
                            restaurant.RestaurantID;

                        if (!id) throw new Error('No valid restaurant ID found');

                        navigate(`/admin/update-restaurant/${id}?restaurantId=${id}`);
                        } catch (error) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: error.message || 'Failed to navigate to update page',
                        });
                        }
                    }}
                    >
                    Update
                    </button>
                </div>
                </div>
            </div>
            );
        })}
        </div>

        {/* Pagination */}
        <div className="d-flex justify-content-center align-items-center mt-4 gap-3">
        <button
            className="btn btn-info"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        >
            Previous
        </button>
        <span>
            Page {currentPage} of {totalPages}
        </span>
        <button
            className="btn btn-success"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
        >
            Next
        </button>
        </div>
        </main>
        </div>
    

    );
};

export default AdminRes;

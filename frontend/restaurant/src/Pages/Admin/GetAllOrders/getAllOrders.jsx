import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function GetAllOrders() {
const [orders, setOrders] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [currentPage, setCurrentPage] = useState(1);
const navigate = useNavigate();
const location = useLocation();

useEffect(() => {
const fetchOrders = async () => {
    try {
    setLoading(true);
    const token = localStorage.getItem('token');
    const searchParams = new URLSearchParams(location.search);
    const restaurantId = searchParams.get('RestaurantId');
    const page = searchParams.get('page') || 1;
    const status = searchParams.get('status') || 1; // Default to status 1 if not specified
    
    // Log the parameters for debugging
    console.log('Fetching orders with params:', {
        restaurantId,
        page,
        status,
        token: token ? 'Token exists' : 'No token'
    });

    let url = 'https://localhost:7251/api/admin/GetAllOrders';
    const params = new URLSearchParams();
    
    if (restaurantId) {
        params.append('RestaurantId', restaurantId);
    }
    if (page) {
        params.append('page', page);
    }
    if (status) {
        params.append('status', status);
    }

    // Add parameters to URL if they exist
    if (params.toString()) {
        url += `?${params.toString()}`;
    }

    console.log('Final URL:', url);

    const response = await axios.get(url, {
        headers: {
        'Authorization': `Bearer ${token}`,
        'accept': '*/*'
        }
    });
    
    console.log('API Response:', response.data);

    // Handle different possible response structures
    let ordersData = [];
    if (response.data) {
        if (Array.isArray(response.data)) {
        ordersData = response.data;
        } else if (response.data.orders) {
        ordersData = response.data.orders;
        } else if (response.data.items) {
        ordersData = response.data.items;
        } else if (response.data.data) {
        ordersData = response.data.data;
        } else {
        // Try to get the first array in the response
        const firstArray = Object.values(response.data).find(value => Array.isArray(value));
        if (firstArray) {
            ordersData = firstArray;
        }
        }
    }

    console.log('Processed Orders Data:', ordersData);
    setOrders(ordersData);
    setCurrentPage(parseInt(page));
    setLoading(false);
    } catch (error) {
    console.error('Error fetching orders:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
    });
    
    setError(error.response?.data?.message || error.message);
    setLoading(false);
    
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to fetch orders. Please try again later.'
    });
    }
};

fetchOrders();
}, [location.search]);

const handleOrderClick = (orderId) => {
navigate(`/admin/order-details/${orderId}`);
};

const handlePageChange = (newPage) => {
const searchParams = new URLSearchParams(location.search);
const restaurantId = searchParams.get('RestaurantId');
if (restaurantId) {
    navigate(`/admin/getAllOrders?RestaurantId=${restaurantId}&page=${newPage}`);
} else {
    navigate(`/admin/getAllOrders?page=${newPage}`);
}
};

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
            <h1 className=" fw-bold mb-4 text-dark">All Orders</h1>

            {orders && orders.length > 0 ? (
            <div className="row g-3">
                {orders.map((order) => {
                const orderId = order.orderID || order.id;
                const userName = order.userName || order.user?.userName || 'N/A';
                const restaurantName = order.restaurantName || order.restaurant?.name || 'N/A';
                const total = (order.totalAmount || order.total || 0).toFixed(2);

                let statusText = 'Unknown';
                let badgeClass = 'bg-secondary';

                switch (order.status) {
                    case 0:
                    statusText = 'Pending';
                    badgeClass = 'bg-warning text-dark';
                    break;
                    case 1:
                    statusText = 'Preparing';
                    badgeClass = 'bg-success';
                    break;
                    case 2:
                    statusText = 'Ready';
                    badgeClass = 'bg-danger';
                    break;
                    case 3:
                    statusText = 'Delivered';
                    badgeClass = 'bg-primary';
                    break;
                }

                return (
                    <div className="col-md-6 col-lg-4" key={orderId}>
                    <div className="card h-100 shadow-sm border-0">
                        <div className="card-body">
                        <h5 className="card-title">Order #{orderId}</h5>
                        <p className="card-text mb-1"><strong>User:</strong> {userName}</p>
                        <p className="card-text mb-1"><strong>Restaurant:</strong> {restaurantName}</p>
                        <p className="card-text mb-2"><strong>Total:</strong> ${total}</p>
                        <span className={`badge ${badgeClass}`}>{statusText}</span>
                        </div>
                    </div>
                    </div>
                );
                })}
            </div>
            ) : (
            <div className="text-center text-muted">No orders found</div>
            )}

            {/* Pagination */}
            <div className="d-flex justify-content-between align-items-center mt-4">
            <button
                className="btn btn-outline-primary"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                Previous
            </button>
            <span className="text-muted">Page {currentPage}</span>
            <button
                className="btn btn-outline-primary"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={orders.length === 0}
            >
                Next
            </button>
            </div>
        </div>
        </div>
    </div>
    </div>


);
}

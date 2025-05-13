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
<div className="min-h-screen bg-gray-100 p-4">
    <div className="max-w-7xl mx-auto">
    <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">All Orders</h2>
        
        <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
            <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Restaurant Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
            {orders && orders.length > 0 ? (
                orders.map((order) => (
                <tr 
                    key={order.orderID || order.id} 
                    className="hover:bg-gray-50"
                >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.orderID || order.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.userName || order.user?.userName || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.restaurantName || order.restaurant?.name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${(order.totalAmount || order.total || 0).toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${order.status === 1 ? 'bg-green-100 text-green-800' : 
                        order.status === 0 ? 'bg-yellow-100 text-yellow-800' : 
                        order.status === 2 ? 'bg-red-100 text-red-800' : 
                        'bg-gray-100 text-gray-800'}`}>
                        {order.status === 0 ? 'Pending' : 
                        order.status === 1 ? 'Preparing' : 
                        order.status === 2 ? 'Ready' : 
                        order.status === 3 ? 'Delivered' : 
                        'Unknown'}
                    </span>
                    </td>
                </tr>
                ))
            ) : (
                <tr>
                <td colSpan="9" className="px-6 py-4 text-center text-gray-500">
                    No orders found
                </td>
                </tr>
            )}
            </tbody>
        </table>
        </div>

        <div className="flex justify-between items-center mt-4">
        <button 
            className="btn btn-primary"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
        >
            Previous
        </button>
        <span className="text-gray-600">
            Page {currentPage}
        </span>
        <button 
            className="btn btn-primary"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={orders.length === 0}
        >
            Next
        </button>
        </div>
    </div>
    </div>
</div>
);
}

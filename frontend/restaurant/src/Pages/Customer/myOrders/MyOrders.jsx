import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './MyOrders.css';

// تعيين التوكن في الإعدادات الافتراضية لـ axios
const token = localStorage.getItem('token');
if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    axios.defaults.headers.common['accept'] = '*/*';
}

export default function MyOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await axios.get('https://localhost:7251/api/User/orders');
            
            // Now fetch the restaurant name for each order
            const ordersWithRestaurantDetails = await Promise.all(response.data.map(async (order) => {
                if (order.restaurantID) {
                    const restaurantResponse = await axios.get(`https://localhost:7251/api/User/GetRestaurantDetails?RestaurantId=${order.restaurantID}`);
                    return {
                        ...order,
                        restaurantName: restaurantResponse.data?.name || 'Unknown Restaurant'
                    };
                }
                return order;
            }));

            console.log('Orders with restaurant details:', ordersWithRestaurantDetails);
            setOrders(ordersWithRestaurantDetails);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setError(error.response?.data?.message || 'Failed to fetch orders');
            setLoading(false);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to fetch your orders. Please try again later.'
            });
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleDelete = async (orderId) => {
        try {
            await axios.delete(`https://localhost:7251/api/User/orders/${orderId}`);

            Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: 'Order deleted successfully!'
            });

            fetchOrders();
        } catch (error) {
            console.error('Error deleting order:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to delete order. Please try again later.'
            });
        }
    };

    if (loading) {
        return (
            <div className="flex-center">
                <div className="loader"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-center">
                <p className="text-red-600 mb-4">{error}</p>
                <button className="orange-gradient-btn" onClick={() => window.location.reload()}>
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="orders-wrapper">
            <h2 className="orders-title">My Orders</h2>
            <div className="orders-grid">
                {orders.length > 0 ? (
                    orders.map(order => (
                        <div key={order.orderID} className="order-card">
                            <h3>Order #{order.orderID}</h3>
                            <p><strong>Restaurant:</strong> {order.restaurantName}</p>
                            <p><strong>Total:</strong> ${order.totalAmount?.toFixed(2)}</p>
                            <p><strong>Status:</strong>
                                <span className={`status-pill ${order.status === 1 ? 'status-complete' :
                                        order.status === 0 ? 'status-pending' :
                                            order.status === 2 ? 'status-cancel' :
                                                'status-unknown'
                                    }`}>
                                    {order.status === 1 ? 'Completed' :
                                        order.status === 0 ? 'Pending' :
                                            order.status === 2 ? 'Cancelled' :
                                                'Unknown'}
                                </span>
                            </p>
                            <div className="card-buttons">
                                <button
                                    onClick={() => navigate(`/customer/payment/${order.orderID}`)}
                                    className="orange-gradient-btn"
                                >
                                    Pay Now
                                </button>
                                <button
                                    onClick={() => {
                                        Swal.fire({
                                            title: 'Are you sure?',
                                            text: "You won't be able to revert this!",
                                            icon: 'warning',
                                            showCancelButton: true,
                                            confirmButtonColor: '#d33',
                                            cancelButtonColor: '#3085d6',
                                            confirmButtonText: 'Yes, delete it!'
                                        }).then((result) => {
                                            if (result.isConfirmed) {
                                                handleDelete(order.orderID);
                                            }
                                        });
                                    }}
                                    className="delete-btn"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No orders found.</p>
                )}
            </div>
        </div>
    );
}

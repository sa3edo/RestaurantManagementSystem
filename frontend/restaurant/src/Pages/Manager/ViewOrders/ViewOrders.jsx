import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import 'animate.css';

const MySwal = withReactContent(Swal);

export default function ViewOrders() {
    const { restaurantID } = useParams();
    const [orders, setOrders] = useState([]);
    const [orderDetails, setOrderDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalOpen, setModalOpen] = useState(false);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `https://localhost:7251/api/restaurant-manager/GetAllOrdersByRestaurant/${restaurantID}`,
                { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
            );
            setOrders(response.data);
            setLoading(false);
        } catch (err) {
            console.error('❌ Error fetching orders:', err);
            setError('Error fetching orders!');
            setLoading(false);
        }
    };

    const fetchOrderDetails = async (orderId) => {
        try {
            const response = await axios.get(
                `https://localhost:7251/api/restaurant-manager/orders/${orderId}`,
                { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
            );
            setOrderDetails(response.data);
            setModalOpen(true);
        } catch (err) {
            console.error(`❌ Error fetching order details for ${orderId}:`, err);
            setError('Error fetching order details!');
        }
    };

    const handleAccept = async (orderId) => {
        try {
            await axios.put(
                `https://localhost:7251/api/restaurant-manager/orders/${orderId}/UpdateOrderStatus?newStatus=1`,
                {},
                { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
            );
            MySwal.fire({
                icon: 'success',
                title: 'Order Accepted!',
                text: `Order #${orderId} has been accepted.`,
                showClass: { popup: 'animate__animated animate__bounceIn' },
                hideClass: { popup: 'animate__animated animate__bounceOut' }
            });
            fetchOrders();
        } catch (err) {
            console.error(`❌ Error accepting order ${orderId}:`, err);
            MySwal.fire({
                icon: 'error',
                title: 'Error!',
                text: `Could not accept Order #${orderId}.`,
                showClass: { popup: 'animate__animated animate__shakeX' },
                hideClass: { popup: 'animate__animated animate__fadeOut' }
            });
        }
    };

    const handleCancel = async (orderId) => {
        try {
            const result = await MySwal.fire({
                title: 'Are you sure?',
                text: `You are about to cancel Order #${orderId}!`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, cancel it!',
                cancelButtonText: 'No, keep it',
                reverseButtons: true,
                showClass: { popup: 'animate__animated animate__fadeInDown' },
                hideClass: { popup: 'animate__animated animate__fadeOutUp' }
            });

            if (result.isConfirmed) {
                await axios.delete(
                    `https://localhost:7251/api/restaurant-manager/orders/${orderId}/cancel`,
                    { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
                );
                MySwal.fire({
                    icon: 'success',
                    title: 'Order Cancelled!',
                    text: `Order #${orderId} has been cancelled.`,
                    showClass: { popup: 'animate__animated animate__zoomIn' },
                    hideClass: { popup: 'animate__animated animate__zoomOut' }
                });
                fetchOrders();
            }
        } catch (err) {
            console.error(`❌ Error cancelling order ${orderId}:`, err);
            MySwal.fire({
                icon: 'error',
                title: 'Error!',
                text: `Could not cancel Order #${orderId}.`,
                showClass: { popup: 'animate__animated animate__shakeX' },
                hideClass: { popup: 'animate__animated animate__fadeOut' }
            });
        }
    };

    useEffect(() => { fetchOrders(); }, []);

    if (loading) return <div className="text-center mt-5">🔄 Loading Orders...</div>;
    if (error) return <div className="text-danger text-center mt-5">{error}</div>;

    return (
        <div className="container mt-5 mb-5 animate__animated animate__fadeIn">
            <h2 className="text-center mb-4">📋 Orders List</h2>
            {orders.length === 0 ? (
                <p className="text-center text-muted">No orders found.</p>
            ) : (
                <div className="table-responsive">
                    <table className="table table-hover table-striped align-middle shadow-sm">
                        <thead className="table-dark">
                            <tr>
                                <th>Order ID</th>
                                <th>Total Amount</th>
                                <th>Customer email</th>
                                <th>Status</th>
                                <th>Created At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.orderID}>
                                    <td>#{order.orderID}</td>
                                    <td>${order.totalAmount}</td>
                                    <td>{order.userName}</td>
                                    <td>
                                        {order.status === 0 && <span className="badge bg-warning text-dark">Pending</span>}
                                        {order.status === 1 && <span className="badge bg-success">Completed</span>}
                                        {order.status === 2 && <span className="badge bg-danger">Cancelled</span>}
                                    </td>
                                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <div className="d-flex gap-2">
                                            <button className="btn btn-outline-primary btn-sm" onClick={() => fetchOrderDetails(order.orderID)}>
                                                🔍 View
                                            </button>
                                            {order.status === 0 && (
                                                <>
                                                    <button className="btn btn-success btn-sm" onClick={() => handleAccept(order.orderID)}>
                                                        ✅ Accept
                                                    </button>
                                                    <button className="btn btn-danger btn-sm" onClick={() => handleCancel(order.orderID)}>
                                                        ❌ Cancel
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {modalOpen && orderDetails && (
                <div className="modal show fade" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setModalOpen(false)}>
                    <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content rounded-4 animate__animated animate__fadeInDown">
                            <div className="modal-header">
                                <h5 className="modal-title">Order Details — ID #{orderDetails.orderId}</h5>
                                <button type="button" className="btn-close" onClick={() => setModalOpen(false)}></button>
                            </div>
                            <div className="modal-body">
                                <p><strong>Customer Email:</strong> {orderDetails.userName}</p>
                                <p><strong>Restaurant Name:</strong> {orderDetails.restaurantName}</p>
                                <p><strong>Status:</strong>{' '}
                                    {orderDetails.status === 0 && <span className="badge bg-warning text-dark">Pending</span>}
                                    {orderDetails.status === 1 && <span className="badge bg-success">Completed</span>}
                                    {orderDetails.status === 2 && <span className="badge bg-danger">Cancelled</span>}
                                </p>
                                <p><strong>Total Amount:</strong> ${orderDetails.totalAmount}</p>

                                <h6 className="mt-4">🧾 Ordered Items:</h6>
                                <ul className="list-group mb-3">
                                    {orderDetails.menuItems?.map(item => (
                                        <li key={item.menuItemId} className="list-group-item d-flex justify-content-between align-items-center">
                                            {item.name} (x{item.quantity})
                                            <span className="badge bg-primary rounded-pill">${item.price}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

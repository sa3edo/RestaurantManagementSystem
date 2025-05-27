import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import 'animate.css';
import './ViewOrders.css'; // لو حابب تضيف CSS خارجي

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

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <div className="text-center mt-5">🔄 Loading Orders...</div>;
  if (error) return <div className="text-danger text-center mt-5">{error}</div>;

  return (
    <div className="container mt-5 mb-5 animate__animated animate__fadeIn">
      <h2 className="text-center mb-4"><i className="fas fa-clipboard-list me-2"></i>Orders List</h2>

      {orders.length === 0 ? (
        <p className="text-center text-muted">No orders found.</p>
      ) : (
        <div className="row g-4">
          {orders.map(order => (
            <div key={order.orderID} className="col-md-6 col-lg-4">
              <div className="card order-card shadow-sm h-100">
                <div className="card-body">
                  <h5 className="card-title">Order #{order.orderID}</h5>
                  <p className="card-text mb-1"><strong>Total:</strong> ${order.totalAmount}</p>
                  <p className="card-text mb-1"><strong>Customer:</strong> {order.userName}</p>
                  <p className="card-text mb-2">
                    <strong>Status:</strong>{' '}
                    {order.status === 0 && <span className="badge bg-warning text-dark">Pending</span>}
                    {order.status === 1 && <span className="badge bg-success">Completed</span>}
                    {order.status === 2 && <span className="badge bg-danger">Cancelled</span>}
                  </p>
                  <p className="text-muted small">{new Date(order.createdAt).toLocaleDateString()}</p>

                  <div className="d-flex flex-wrap gap-2 mt-3">
                    <button className="btn btn-outline-primary btn-sm" onClick={() => fetchOrderDetails(order.orderID)}>
                      <i className="fas fa-eye me-1"></i> View
                    </button>
                    {order.status === 0 && (
                      <>
                        <button className="btn btn-success btn-sm" onClick={() => handleAccept(order.orderID)}>
                          <i className="fas fa-check me-1"></i> Accept
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleCancel(order.orderID)}>
                          <i className="fas fa-times me-1"></i> Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && orderDetails && (
        <div className="modal show fade " style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setModalOpen(false)}>
          <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content rounded-4 animate__animated animate__fadeInDown">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-file-alt me-2"></i> Order Details — #{orderDetails.orderId}
                </h5>
                <button type="button" className="btn-close" onClick={() => setModalOpen(false)}></button>
              </div>
              <div className="modal-body">
                <p><strong><i className="fas fa-envelope me-1"></i> Customer Email:</strong> {orderDetails.userName}</p>
                <p><strong><i className="fas fa-store me-1"></i> Restaurant:</strong> {orderDetails.restaurantName}</p>
                <p><strong><i className="fas fa-info-circle me-1"></i> Status:</strong>{' '}
                  {orderDetails.status === 0 && <span className="badge bg-warning text-dark">Pending</span>}
                  {orderDetails.status === 1 && <span className="badge bg-success">Completed</span>}
                  {orderDetails.status === 2 && <span className="badge bg-danger">Cancelled</span>}
                </p>
                <p><strong><i className="fas fa-money-bill-wave me-1"></i> Total:</strong> ${orderDetails.totalAmount}</p>

                <h6 className="mt-4"><i className="fas fa-list me-2"></i> Ordered Items:</h6>
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

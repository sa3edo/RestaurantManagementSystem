import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

function Payment() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const handlePayment = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await axios.post(
                'https://localhost:7251/api/Payment/CreateCheckoutSession',
                {
                    orderId: parseInt(orderId),

                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        Accept: '*/*'
                    }
                }
            );
            if (response.data && response.data.url) {
                // Redirect to the payment URL
                window.location.href = response.data.url;
            } else {
                throw new Error('No payment URL received');
            }
        } catch (err) {
            setError('Failed to process payment');
            console.error('Payment error:', err);
            Swal.fire({
                icon: 'error',
                title: 'Payment Error',
                text: err.response?.data?.message || 'Failed to process payment'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        handlePayment();
    }, [orderId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-4">
                <div className="text-red-500 mb-4">Error: {error}</div>
                <button
                    onClick={() => navigate('/customer/my-orders')}
                    className="btn btn-primary"
                >
                    Back to Orders
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold mb-4 text-center">Processing Payment</h2>
                <p className="text-center text-gray-600 mb-4">
                    Please wait while we redirect you to the payment page...
                </p>
                <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </div>
        </div>
    );
}

export default Payment;

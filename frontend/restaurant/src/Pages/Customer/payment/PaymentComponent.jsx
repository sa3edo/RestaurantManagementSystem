import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

function PaymentComponent() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const handleCancel = async () => {
        try {
            navigate('/payment/cancel');
        } catch (err) {
            console.error('Error navigating to cancel page:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to cancel payment. Please try again.',
            });
        }
    };

    const handlePayment = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const formData = new FormData();
            formData.append('orderId', orderId);

            const response = await axios.post(
                'https://localhost:7251/api/Payment/CreateCheckoutSession',
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                        'accept': '*/*'
                    }
                }
            );

            if (response.data && response.data.url) {
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
            <div className="min-h-screen bg-gray-100 p-4">
                <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                        <button
                            onClick={() => navigate('/payment/cancel')}
                            className="btn btn-outline-secondary"
                        >
                            ← Back
                        </button>
                        <h2 className="text-2xl font-bold text-center">Processing Payment</h2>
                    </div>
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

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 p-4">
                <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                        <button
                            onClick={() => navigate('/payment/cancel')}
                            className="btn btn-outline-secondary"
                        >
                            ← Back
                        </button>
                        <h2 className="text-2xl font-bold text-center">Payment Error</h2>
                    </div>
                    <div className="text-red-500 mb-4">Error: {error}</div>
                    <div className="flex justify-center">
                        <button
                            onClick={() => navigate('/customer/my-orders')}
                            className="btn btn-primary"
                        >
                            Back to Orders
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                    <button
                        onClick={() => navigate('/payment/cancel')}
                        className="btn btn-outline-secondary"
                    >
                        ← Back
                    </button>
                    <h2 className="text-2xl font-bold text-center">Processing Payment</h2>
                </div>
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

export default PaymentComponent; 
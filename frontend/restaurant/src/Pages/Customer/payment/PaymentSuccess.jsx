import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

function PaymentSuccess() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [paymentInfo, setPaymentInfo] = useState(null);
    const [error, setError] = useState(null);

    const location = useLocation();
    useEffect(() => {
        const fetchPaymentSuccess = async () => {
            try {
                setLoading(true);
                // Extract session_id from query params
                const params = new URLSearchParams(location.search);
                const sessionId = params.get('session_id');
                if (!sessionId) {
                    setError('Missing session_id in URL.');
                    setLoading(false);
                    return;
                }
                const token = localStorage.getItem('token');
                const response = await axios.get(
                    `https://localhost:7251/api/Payment/PaymentSuccess?session_id=${sessionId}`,
                    {
                        headers: {
                            'accept': '*/*',
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );
                setPaymentInfo(response.data);
            } catch (err) {
                let message = 'Could not fetch payment success information.';
                if (err.response && err.response.data) {
                    if (typeof err.response.data === 'string') {
                        message += ` Server: ${err.response.data}`;
                    } else if (err.response.data.message) {
                        message += ` Server: ${err.response.data.message}`;
                    }
                }
                setError(message);
            } finally {
                setLoading(false);
            }
        };
        fetchPaymentSuccess();
    }, [location.search]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-4">
                <div className="text-red-500 mb-4">{error}</div>
                <button onClick={() => navigate('/customer/allRestaurants')} className="btn btn-primary">Back to Restaurants</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
                <div className="text-center">
                    <div className="text-green-500 text-6xl mb-4">✓</div>
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">Payment Process Successful!</h2>
                    <p className="text-gray-600 mb-6">
                        Your payment has been processed successfully. Thank you for your order.
                    </p>
                    {paymentInfo && (
                        <div className="mb-6 text-left">
                            {/* Display payment info details if available */}
                            {Object.entries(paymentInfo).map(([key, value]) => (
                                <div key={key} className="text-sm text-gray-700">
                                    <strong>{key}:</strong> {String(value)}
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="flex justify-center space-x-4">
                        <button
                            onClick={() => navigate('/customer/my-orders')}
                            className="btn btn-primary"
                        >
                            View My Orders
                        </button>
                        <button
                            onClick={() => navigate('/customer/allRestaurants')}
                            className="btn btn-outline-primary"
                        >
                            Back to Restaurants
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PaymentSuccess;
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

function CancelPayment() {
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCancelStatus = async () => {
            try {
                const token = localStorage.getItem('token');
                await axios.get(
                    'https://localhost:7251/api/Payment/PaymentCancel',
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'accept': '*/*'
                        }
                    }
                );

                Swal.fire({
                    icon: 'warning',
                    title: 'Payment Cancelled',
                    text: 'Your payment has been cancelled.',
                    confirmButtonText: 'View Orders',
                    showCancelButton: true,
                    cancelButtonText: 'Back to Restaurants'
                }).then((result) => {
                    if (result.isConfirmed) {
                        navigate('/customer/my-orders');
                    } else {
                        navigate('/customer/allRestaurants');
                    }
                });
            } catch (error) {
                console.error('Error fetching cancel status:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'There was an error processing your cancellation.',
                }).then(() => {
                    navigate('/customer/my-orders');
                });
            }
        };

        fetchCancelStatus();
    }, [navigate]);

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
                <div className="text-center">
                    <div className="text-yellow-500 text-6xl mb-4">✕</div>
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">Payment Cancelled</h2>
                    <p className="text-gray-600 mb-6">
                        Your payment has been cancelled. No charges have been made to your account.
                    </p>
                    <div className="flex justify-center space-x-4">
                        <button
                            onClick={() => navigate('/customer/my-orders')}
                            className="btn btn-primary"
                        >
                            View Orders
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

export default CancelPayment; 
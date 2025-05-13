import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

function PaymentSuccess() {
    const navigate = useNavigate();

    useEffect(() => {
        // Show success message immediately
        Swal.fire({
            icon: 'success',
            title: 'Payment Process Successful!',
            text: 'Your payment has been processed successfully.',
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
    }, [navigate]);

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
                <div className="text-center">
                    <div className="text-green-500 text-6xl mb-4">✓</div>
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">Payment Process Successful!</h2>
                    <p className="text-gray-600 mb-6">
                        Your payment has been processed successfully. Thank you for your order.
                    </p>
                    <div className="flex justify-center space-x-4">
                        <button
                            onClick={() => navigate('/customer/my-orders')}
                            className="btn btn-primary"
                        >
                            Home
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
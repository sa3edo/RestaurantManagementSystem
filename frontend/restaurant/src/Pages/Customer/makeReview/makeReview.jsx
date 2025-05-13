import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function MakeReview() {
    const { restaurantId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        rating: 5,
        comment: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                'https://localhost:7251/api/User/CreateReview',
                {
                    reviewID: 0,
                    userID: "string", // This will be handled by the backend using the token
                    restaurantID: parseInt(restaurantId),
                    rating: parseInt(formData.rating),
                    comment: formData.comment,
                    createdAt: new Date().toISOString()
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'accept': '*/*'
                    }
                }
            );

            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Your review has been submitted successfully.',
                showConfirmButton: true
            }).then(() => {
                navigate('/customer/allRestaurants');
            });

        } catch (error) {
            console.error('Error submitting review:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Failed to submit review. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
            <div className="relative py-3 sm:max-w-xl sm:mx-auto">
                <div className="relative px-4 py-10 bg-white mx-8 md:mx-0 shadow rounded-3xl sm:p-10">
                    <div className="max-w-md mx-auto">
                        <div className="flex items-center space-x-5">
                            <div className="block pl-2 font-semibold text-xl self-start text-gray-700">
                                <h2 className="leading-relaxed">Add Your Review</h2>
                            </div>
                        </div>
                        <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
                            <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                                <div className="flex flex-col">
                                    <label className="leading-loose">Rating</label>
                                    <select
                                        name="rating"
                                        value={formData.rating}
                                        onChange={handleChange}
                                        className="form-select px-4 py-2 border focus:ring-blue-500 focus:border-blue-500 w-full sm:text-sm border-gray-300 rounded-md"
                                        required
                                    >
                                        <option value="5">⭐⭐⭐⭐⭐ (5 stars)</option>
                                        <option value="4">⭐⭐⭐⭐ (4 stars)</option>
                                        <option value="3">⭐⭐⭐ (3 stars)</option>
                                        <option value="2">⭐⭐ (2 stars)</option>
                                        <option value="1">⭐ (1 star)</option>
                                    </select>
                                </div>
                                <div className="flex flex-col">
                                    <label className="leading-loose">Comment</label>
                                    <textarea
                                        name="comment"
                                        value={formData.comment}
                                        onChange={handleChange}
                                        className="form-textarea px-4 py-2 border focus:ring-blue-500 focus:border-blue-500 w-full sm:text-sm border-gray-300 rounded-md"
                                        rows="4"
                                        placeholder="Share your experience..."
                                        required
                                    ></textarea>
                                </div>
                            </div>
                            <div className="pt-4 flex items-center space-x-4">
                                <button
                                    type="button"
                                    onClick={() => navigate('/customer/allRestaurants')}
                                    className="btn btn-secondary flex justify-center items-center w-full text-gray-900 px-4 py-3 rounded-md focus:outline-none"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn btn-primary flex justify-center items-center w-full text-white px-4 py-3 rounded-md focus:outline-none"
                                >
                                    {loading ? 'Submitting...' : 'Submit Review'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

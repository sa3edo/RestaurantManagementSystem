import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import './MakeReview.css'; // تأكد إن فيه ألوان مثل --primary-color معرفه هنا
import '../../../App.css'
export default function MakeReview() {
    const { restaurantId } = useParams();
    const navigate = useNavigate();
    const [hoveredRating, setHoveredRating] = useState(0);

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        rating: 0,
        comment: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            await axios.post(
                'https://localhost:7251/api/User/CreateReview',
                {
                    reviewID: 0,
                    userID: "string",
                    restaurantID: parseInt(restaurantId),
                    rating: formData.rating,
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
                title: 'Review Submitted',
                text: 'Thanks for your feedback!',
            }).then(() => navigate('/customer/allRestaurants'));
        } catch (error) {
            console.error('Error submitting review:', error);
            Swal.fire({
                icon: 'error',
                title: 'Submission Failed',
                text: error.response?.data?.message || 'Please try again later.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleStarClick = (ratingValue) => {
        setFormData(prev => ({
            ...prev,
            rating: ratingValue
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="container my-5">
            <div className="card shadow-lg rounded-4 p-4 mx-auto" style={{ maxWidth: "600px", backgroundColor: 'var(--card-bg)' }}>
                <h3 className="text-center mb-4" style={{ color: 'var(--primary-color)' }}>
                    <i className="fas fa-pen-alt me-2"></i>
                    Add Your Review
                </h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label fw-semibold">Rating</label>
                        <div className="star-rating mb-2">
                            {[1, 2, 3, 4, 5].map((value) => (
                                <i
                                    key={value}
                                    className={`fa-star fa-2x me-1 star ${(hoveredRating || formData.rating) >= value ? 'fas text-warning' : 'far text-secondary'
                                        }`}
                                    onClick={() => handleStarClick(value)}
                                    onMouseEnter={() => setHoveredRating(value)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    style={{ cursor: 'pointer' }}
                                ></i>
                            ))}
                        </div>

                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-semibold">Comment</label>
                        <textarea
                            name="comment"
                            value={formData.comment}
                            onChange={handleChange}
                            className="form-control"
                            rows="4"
                            placeholder="Tell us about your experience..."
                            required
                        ></textarea>
                    </div>
                    <div className="d-flex justify-content-between mt-4">
                        <button
                            type="button"
                            onClick={() => navigate('/customer/allRestaurants')}
                            className="btn custom-cancel-btn w-50 me-2"
                        >
                            <i className="fas fa-times-circle me-1"></i> Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn custom-submit-btn w-50 text-white"

                        >
                            <i className="fas fa-paper-plane me-2"></i>
                            {loading ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

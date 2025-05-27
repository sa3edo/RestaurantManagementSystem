import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';

const GetRestaurantReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();
    const location = useLocation();

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No authentication token found');

            const searchParams = new URLSearchParams(location.search);
            const restaurantId = searchParams.get('RestID');
            if (!restaurantId) throw new Error('Restaurant ID is required');

            const url = `https://localhost:7251/api/admin/GetRestaurantReview?RestID=${restaurantId}&page=${currentPage}`;

            const response = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'accept': '*/*'
                }
            });

            let reviewsData = [];
            if (Array.isArray(response.data)) {
                reviewsData = response.data;
            } else if (response.data && typeof response.data === 'object') {
                if (Array.isArray(response.data.data)) reviewsData = response.data.data;
                else if (Array.isArray(response.data.items)) reviewsData = response.data.items;
                else if (Array.isArray(response.data.reviews)) reviewsData = response.data.reviews;
                else {
                    const firstArray = Object.values(response.data).find(value => Array.isArray(value));
                    if (firstArray) reviewsData = firstArray;
                }

                if (response.data.totalPages) setTotalPages(response.data.totalPages);
            }

            setReviews(reviewsData);
            setError(null);
        } catch (err) {
            setError('Failed to fetch reviews');
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.response?.data?.message || 'Failed to fetch reviews'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [location.search, currentPage]);

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );

    if (error) return (
        <div className="text-center p-4">
            <div className="text-danger fw-bold mb-3">Error: {error}</div>
            <button
                onClick={() => window.location.reload()}
                className="btn btn-primary"
            >
                Retry
            </button>
        </div>
    );

    return (
        <div className="container py-4">
            <div className="main bg-white p-4 rounded-4 shadow-sm">
                <h2 className="fw-bold mb-4">⭐ Restaurant Reviews</h2>

                <div className="row g-4">
                    {reviews && reviews.length > 0 ? (
                        reviews.map((review) => (
                            <div key={review.reviewID} className="col-12 col-md-6 col-lg-4">
                                <div className="card h-100 shadow-sm border-0 rounded-3">
                                    <div className="card-body">
                                        <h5 className="card-title fw-bold text-primary">{review.userName || 'Anonymous'}</h5>
                                        <div className="mb-2">
                                            {[...Array(5)].map((_, i) => (
                                                <i
                                                    key={i}
                                                    className={`fas fa-star ${i < review.rating ? 'text-warning' : 'text-secondary'}`}
                                                ></i>
                                            ))}
                                        </div>
                                        <p className="card-text text-muted">{review.comment || 'No comment provided'}</p>
                                    </div>
                                    <div className="card-footer bg-white border-0 text-end">
                                        <small className="text-muted">Review ID: {review.reviewID}</small>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-muted">No reviews found.</div>
                    )}
                </div>

                {/* Pagination */}
                <div className="mt-4 d-flex justify-content-center align-items-center gap-3">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="btn btn-outline-primary btn-sm"
                    >
                        ⬅ Previous
                    </button>
                    <span className="fw-semibold">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        disabled={currentPage >= totalPages}
                        className="btn btn-outline-success btn-sm"
                    >
                        Next ➡
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GetRestaurantReviews;

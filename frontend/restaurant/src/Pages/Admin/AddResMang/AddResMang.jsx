import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';

const AddResMang = () => {
    const location = useLocation();
    const initialEmail = location.state?.email || '';
    const [email, setEmail] = useState(initialEmail);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const formData = new FormData();
            formData.append('Email', email);

            const response = await axios.put(
                'https://localhost:7251/api/admin/AddRestaurantManager',
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            Swal.fire({
                title: 'Success!',
                text: 'User has been promoted to Restaurant Manager.',
                icon: 'success',
                confirmButtonText: 'OK'
            }).then(() => {
                navigate('/admin/GetAllUsers');
            });

        } catch (err) {
            console.error('Error:', err);
            let errorMessage = 'Failed to add restaurant manager.';

            if (err.response) {
                if (err.response.status === 401) {
                    errorMessage = 'Unauthorized. Please login again.';
                    handleLogout();
                } else if (err.response.data) {
                    errorMessage = typeof err.response.data === 'string'
                        ? err.response.data
                        : JSON.stringify(err.response.data);
                }
            }

            Swal.fire({
                title: 'Error!',
                text: errorMessage,
                icon: 'error',
                confirmButtonText: 'OK'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <main className="container vh-90 d-flex justify-content-center align-items-center">
                <div className="card w-100 mt-5 border-0" style={{ maxWidth: '500px' }}>
                    <div className="card-body main rounded-4 shadow">
                        <h1 className="card-title text-center mb-4">Add Restaurant Manager</h1>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label htmlFor="email" className="form-label">User Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="form-control"
                                    placeholder="Enter user's email"
                                    required
                                />
                            </div>
                            <div className="d-flex justify-content-end">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn1"
                                >
                                    {loading ? 'Processing...' : 'Add Restaurant Manager'}
                                </button>
                            </div>
                        </form>
                        {error && (
                            <div className="alert alert-danger mt-4" role="alert">
                                {error}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AddResMang;

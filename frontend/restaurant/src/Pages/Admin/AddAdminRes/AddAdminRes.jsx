import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import * as signalR from "@microsoft/signalr";
import { useEffect } from "react";


const AddAdminRes = () => {
    const [formData, setFormData] = useState({
        Name: '',
        Description: '',
        Location: '',
        Email: '',
        RestImg: null
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({
            ...prev,
            RestImg: e.target.files[0]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const data = new FormData();
            data.append('Name', formData.Name);
            data.append('Description', formData.Description);
            data.append('Location', formData.Location);
            data.append('Email', formData.Email);
            if (formData.RestImg) {
                data.append('RestImg', formData.RestImg);
            }

            await axios.post(
                'https://localhost:7251/api/admin/CreateAdminRestaurant',
                data,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            Swal.fire({
                title: 'Success!',
                text: 'Restaurant created successfully.',
                icon: 'success',
                confirmButtonText: 'OK'
            });

            // Clear the form
            setFormData({
                Name: '',
                Description: '',
                Location: '',
                Email: '',
                RestImg: null
            });
        } catch (err) {
            console.error('Error creating restaurant:', err);
            let errorMessage = 'Failed to create restaurant.';
            
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
        <div className="container-fluid d-flex justify-content-center align-items-center ">
            {/* Main Content */}
            <main className="container vh-100 d-flex justify-content-center align-items-center">
                <div className="card w-100 border-0" style={{ maxWidth: '600px' }}>
                    <div className="card-body main shadow rounded-4">
                    <h1 className="card-title text-center mb-4">Create New Restaurant</h1>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                        <label htmlFor="Name" className="form-label">
                            Restaurant Name
                        </label>
                        <input
                            type="text"
                            id="Name"
                            name="Name"
                            value={formData.Name}
                            onChange={handleInputChange}
                            className="form-control"
                            required
                        />
                        </div>

                        <div className="mb-3">
                        <label htmlFor="Description" className="form-label">
                            Description
                        </label>
                        <textarea
                            id="Description"
                            name="Description"
                            value={formData.Description}
                            onChange={handleInputChange}
                            className="form-control"
                            rows="3"
                            required
                        ></textarea>
                        </div>

                        <div className="mb-3">
                        <label htmlFor="Location" className="form-label">
                            Location
                        </label>
                        <input
                            type="text"
                            id="Location"
                            name="Location"
                            value={formData.Location}
                            onChange={handleInputChange}
                            className="form-control"
                            required
                        />
                        </div>

                        <div className="mb-3">
                        <label htmlFor="Email" className="form-label">
                            Email
                        </label>
                        <input
                            type="email"
                            id="Email"
                            name="Email"
                            value={formData.Email}
                            onChange={handleInputChange}
                            className="form-control"
                            required
                        />
                        </div>

                        <div className="mb-3">
                        <label htmlFor="RestImg" className="form-label">
                            Restaurant Image
                        </label>
                        <input
                            type="file"
                            id="RestImg"
                            name="RestImg"
                            onChange={handleFileChange}
                            className="form-control"
                            accept="image/*"
                        />
                        </div>

                        <div className="d-flex justify-content-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn1"
                        >
                            {loading ? 'Creating...' : 'Create Restaurant'}
                        </button>
                        </div>
                    </form>
                    </div>
                </div>
                </main>

        </div>
    );
};


export default AddAdminRes;

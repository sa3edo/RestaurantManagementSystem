import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';

const UpdateRes = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        Name: '',
        Description: '',
        Location: '',
        Email: '',
        RestImg: null,
        RestaurantID: id
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Validate ID on component mount
        const restaurantId = searchParams.get('restaurantId') || id;
        if (!restaurantId) {
            Swal.fire({
                title: 'Error!',
                text: 'No restaurant ID provided',
                icon: 'error',
                confirmButtonText: 'OK'
            }).then(() => {
                navigate('/admin/admin-restaurants');
            });
        }
    }, [id, searchParams, navigate]);

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

            // Get ID from URL params or search params
            const restaurantId = searchParams.get('restaurantId') || id;
            if (!restaurantId) {
                throw new Error('No valid restaurant ID found');
            }

            console.log('Initial ID from URL params:', id);
            console.log('ID from search params:', searchParams.get('restaurantId'));
            console.log('Using restaurant ID:', restaurantId);

            const data = new FormData();
            data.append('Name', formData.Name);
            data.append('Description', formData.Description);
            data.append('Location', formData.Location);
            data.append('Email', formData.Email);
            data.append('RestaurantID', restaurantId);
            if (formData.RestImg) {
                data.append('RestImg', formData.RestImg);
            }

            // Log all form data entries
            console.log('FormData contents:');
            for (let [key, value] of data.entries()) {
                console.log(`${key}: ${value} (type: ${typeof value})`);
            }

            const endpoint = `https://localhost:7251/api/admin/UpdateAdminRestaurant?restaurantId=${restaurantId}`;
            console.log('Making PUT request to:', endpoint);

            const response = await axios.put(
                endpoint,
                data,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            console.log('Update response:', response.data);

            Swal.fire({
                title: 'Success!',
                text: 'Restaurant updated successfully.',
                icon: 'success',
                confirmButtonText: 'OK'
            }).then(() => {
                navigate('/admin/admin-restaurants');
            });
        } catch (err) {
            console.error('Error updating restaurant:', err);
            console.error('Error details:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status,
                url: err.config?.url,
                method: err.config?.method,
                headers: err.config?.headers,
                data: err.config?.data
            });
            
            let errorMessage = 'Failed to update restaurant.';
            
            if (err.response) {
                if (err.response.status === 401) {
                    errorMessage = 'Unauthorized. Please login again.';
                    localStorage.removeItem('token');
                    localStorage.removeItem('role');
                    navigate('/login');
                } else if (err.response.data) {
                    errorMessage = typeof err.response.data === 'string' 
                        ? err.response.data 
                        : JSON.stringify(err.response.data);
                }
            }

            Swal.fire({
                title: 'Error!',
                text: `Error: ${errorMessage}\nStatus: ${err.response?.status}\nURL: ${err.config?.url}`,
                icon: 'error',
                confirmButtonText: 'OK'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Update Restaurant</h1>
                    <button
                        onClick={() => navigate('/admin/admin-restaurants')}
                        className="btn btn-secondary"
                    >
                        Back to Restaurants
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">Update Restaurant Details</h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="Name" className="block text-sm font-medium text-gray-700">
                                    Restaurant Name
                                </label>
                                <input
                                    type="text"
                                    id="Name"
                                    name="Name"
                                    value={formData.Name}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="Description" className="block text-sm font-medium text-gray-700">
                                    Description
                                </label>
                                <textarea
                                    id="Description"
                                    name="Description"
                                    value={formData.Description}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    rows="3"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="Location" className="block text-sm font-medium text-gray-700">
                                    Location
                                </label>
                                <input
                                    type="text"
                                    id="Location"
                                    name="Location"
                                    value={formData.Location}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="Email" className="block text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="Email"
                                    name="Email"
                                    value={formData.Email}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="RestImg" className="block text-sm font-medium text-gray-700">
                                    Restaurant Image
                                </label>
                                <input
                                    type="file"
                                    id="RestImg"
                                    name="RestImg"
                                    onChange={handleFileChange}
                                    className="mt-1 block w-full text-sm text-gray-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-md file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-indigo-50 file:text-indigo-700
                                    hover:file:bg-indigo-100"
                                    accept="image/*"
                                />
                            </div>

                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={() => navigate('/admin/admin-restaurants')}
                                    className="btn btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn btn-primary"
                                >
                                    {loading ? 'Updating...' : 'Update Restaurant'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UpdateRes;

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
    <div className="min-vh-100">

    {/* Main Content */}
    <main className="container">
        <div className="card shadow border-0 rounded-4">
        <div className="card-body main">
            <h1 className="card-title mb-4 text-center">Update Restaurant Details</h1>

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
                />
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

            <div className="mb-4">
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

            <div className="d-flex justify-content-end gap-2">
                <button
                type="button"
                onClick={() => navigate('/admin/admin-restaurants')}
                className="btn btn-outline-danger"
                >
                Cancel
                </button>
                <button
                type="submit"
                disabled={loading}
                className="btn1"
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

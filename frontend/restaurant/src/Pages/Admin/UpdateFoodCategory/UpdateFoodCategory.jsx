import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';

const UpdateFoodCategory = () => {
    const { categoryId } = useParams();
    const location = useLocation();
    const restaurantId = new URLSearchParams(location.search).get('restaurantId');
    const navigate = useNavigate();
    const [categoryName, setCategoryName] = useState('');

    // Fetch current category name when component mounts
    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No authentication token found');
                }

                const response = await axios.get(
                    `https://localhost:7251/api/admin/GetAllFoodCategoriesAsync`,
                    {
                        params: {
                            restaurantId: restaurantId,
                            page: 1
                        },
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'accept': '*/*'
                        }
                    }
                );

                let categories = [];
                if (Array.isArray(response.data)) {
                    categories = response.data;
                } else if (response.data && typeof response.data === 'object') {
                    if (Array.isArray(response.data.data)) {
                        categories = response.data.data;
                    } else if (Array.isArray(response.data.items)) {
                        categories = response.data.items;
                    }
                }

                const category = categories.find(c => (c.id || c.categoryID) === parseInt(categoryId));
                if (category) {
                    setCategoryName(category.name);
                }
            } catch (err) {
                console.error('Error fetching category:', err);
            }
        };

        fetchCategory();
    }, [categoryId, restaurantId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const data = {
                categoryId: parseInt(categoryId),
                restaurantId: parseInt(restaurantId),
                name: categoryName
            };

            console.log('Sending update request with data:', data);

            await axios.put(
                `https://localhost:7251/api/admin/UpdateFoodCategory/${categoryId}?restaurantId=${restaurantId}`,
                data,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'accept': '*/*'
                    }
                }
            );

            Swal.fire({
                title: 'Success!',
                text: 'Category updated successfully!',
                icon: 'success',
                confirmButtonText: 'OK'
            }).then(() => {
                navigate(-1); // Go back to the categories list
            });

        } catch (err) {
            console.error('Error updating category:', err);
            let errorMessage = 'Failed to update food category';
            
            if (err.response) {
                console.error('Error response data:', err.response.data);
                if (err.response.status === 401) {
                    errorMessage = 'Unauthorized. Please login again.';
                    navigate('/login');
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
        }
    };

    return (
        <div className="min-vh-100 bg-light">
    <header className="bg-white border-bottom py-3 mb-4">
        <div className="container d-flex justify-content-between align-items-center">
            <h1 className="section-title m-0">Update Food Category</h1>
            <button onClick={() => navigate(-1)} className="btn btn-primary">
                Back
            </button>
        </div>
    </header>

    <main className="container">
        <div className="card shadow-sm">
            <div className="card-body">
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="categoryName" className="form-label">
                            Category Name
                        </label>
                        <input
                            type="text"
                            id="categoryName"
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                            className="form-control"
                            placeholder="Enter category name"
                            required
                        />
                    </div>

                    <div className="d-flex justify-content-end gap-2">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="btn btn-secondary"
                        >
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-success">
                            Update Category
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </main>
</div>

    );
};

export default UpdateFoodCategory; 
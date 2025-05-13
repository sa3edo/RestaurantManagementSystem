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
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Update Food Category</h1>
                    <button
                        onClick={() => navigate(-1)}
                        className="btn btn-primary"
                    >
                        Back
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="bg-white shadow rounded-lg p-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700">
                                    Category Name
                                </label>
                                <input
                                    type="text"
                                    id="categoryName"
                                    value={categoryName}
                                    onChange={(e) => setCategoryName(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    required
                                    placeholder="Enter category name"
                                />
                            </div>
                            
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => navigate(-1)}
                                    className="btn btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-success"
                                >
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
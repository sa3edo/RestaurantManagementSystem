import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';

const ShowFoodCategory = () => {
    const { restaurantId } = useParams();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();

    const fetchCategories = async (page) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await axios.get(
                `https://localhost:7251/api/admin/GetAllFoodCategoriesAsync`,
                {
                    params: {
                        restaurantId: restaurantId,
                        page: page
                    },
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'accept': '*/*'
                    }
                }
            );

            console.log('API Response:', response.data);

            let categoriesData = [];
            let totalPagesCount = 1;

            if (Array.isArray(response.data)) {
                categoriesData = response.data;
            } else if (response.data && typeof response.data === 'object') {
                if (Array.isArray(response.data.data)) {
                    categoriesData = response.data.data;
                } else if (Array.isArray(response.data.items)) {
                    categoriesData = response.data.items;
                } else if (Array.isArray(response.data.categories)) {
                    categoriesData = response.data.categories;
                }
                
                if (response.data.totalPages) {
                    totalPagesCount = response.data.totalPages;
                } else if (response.data.total) {
                    totalPagesCount = Math.ceil(response.data.total / 10);
                }
            }

            setCategories(categoriesData);
            setTotalPages(totalPagesCount);
            setError(null);
        } catch (err) {
            console.error('Error fetching categories:', err);
            let errorMessage = 'Failed to fetch food categories';
            
            if (err.response) {
                console.error('Error response:', err.response.data);
                if (err.response.status === 401) {
                    errorMessage = 'Unauthorized. Please login again.';
                    navigate('/login');
                } else if (err.response.data) {
                    errorMessage = typeof err.response.data === 'string' 
                        ? err.response.data 
                        : JSON.stringify(err.response.data);
                }
            }

            setError(errorMessage);
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

    const handleDeleteCategory = async (categoryId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            // Show confirmation dialog
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, delete it!'
            });

            if (result.isConfirmed) {
                await axios.delete(
                    `https://localhost:7251/api/admin/DeleteFoodCategory/${categoryId}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'accept': '*/*'
                        }
                    }
                );

                // Show success message
                await Swal.fire(
                    'Deleted!',
                    'Food category has been deleted.',
                    'success'
                );

                // Refresh the categories list
                fetchCategories(currentPage);
            }
        } catch (err) {
            console.error('Error deleting category:', err);
            let errorMessage = 'Failed to delete food category';
            
            if (err.response) {
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

    useEffect(() => {
        fetchCategories(currentPage);
    }, [currentPage, restaurantId]);

    if (loading) return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="text-center">Loading...</div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="text-center text-red-500">{error}</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Restaurant Food Categories</h1>
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
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border border-gray-300">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-3 border-b border-gray-300 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            ID
                                        </th>
                                        <th className="px-6 py-3 border-b border-gray-300 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 border-b border-gray-300 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.map((category) => (
                                        <tr key={category.id || category.categoryID} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap border-b border-gray-300">
                                                {category.id || category.categoryID}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap border-b border-gray-300">
                                                {category.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap border-b border-gray-300">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => navigate(`/admin/update-food-category/${category.id || category.categoryID}?restaurantId=${restaurantId}`)}
                                                        className="btn btn-warning"
                                                    >
                                                        Update
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteCategory(category.id || category.categoryID)}
                                                        className="btn btn-danger"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="mt-4 flex justify-center items-center">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="btn btn-info"
                            >
                                Previous
                            </button>
                            <span className="px-4 py-2">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                disabled={currentPage >= totalPages}
                                className="btn btn-success"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ShowFoodCategory;

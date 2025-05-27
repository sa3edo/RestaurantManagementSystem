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
    <div className="min-vh-100 main">

    {/* Main Content */}
    <main className="container pb-5">
    <div className="">
    <div className="">
        <div className="d-flex justify-content-between">
        <h1 className="m-3 fw-bold">Restaurant Food Categories</h1>
        <button onClick={() => navigate(-1)} className="btn1 m-3">
            Back
        </button>
        </div>

        {/* Category Cards */}
        <div className="row g-3">
        {categories.map((category) => (
            <div className="col-md-4" key={category.id || category.categoryID}>
            <div className="card h-100 shadow-sm">
                <div className="card-body">
                <h5 className="card-title">{category.name}</h5>
                <p className="card-text">
                    <strong>ID:</strong> {category.id || category.categoryID}
                </p>
                </div>
                <div className="card-footer d-flex justify-content-between">
                <button
                    onClick={() =>
                    navigate(
                        `/admin/update-food-category/${
                        category.id || category.categoryID
                        }?restaurantId=${restaurantId}`
                    )
                    }
                    className="btn1 w-75"
                >
                    Update
                </button>
                <button
                    onClick={() =>
                    handleDeleteCategory(category.id || category.categoryID)
                    }
                    className="btn "
                >
                    <i class="fa-solid fa-trash text-danger"></i>
                </button>
                </div>
            </div>
            </div>
        ))}
        </div>

        {/* Pagination */}
        <div className="d-flex justify-content-center align-items-center mt-4 gap-3">
        <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="btn btn-outline-info"
        >
            Previous
        </button>
        <span>
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
        </span>
        <button
            onClick={() => setCurrentPage((prev) => prev + 1)}
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

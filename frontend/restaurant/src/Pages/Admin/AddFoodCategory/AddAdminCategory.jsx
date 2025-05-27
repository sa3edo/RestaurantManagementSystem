import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function AddAdminCategory() {
    const { restaurantID } = useParams();
    const restaurantId = parseInt(restaurantID);
    const navigate = useNavigate();
    const [categoryName, setCategoryName] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            await axios.post(
                `https://localhost:7251/api/admin/AddFoodCategory?restaurantId=${restaurantId}`,
                {
                    name: categoryName,
                    restaurantId: restaurantId
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
                title: 'Success!',
                text: 'Category Added Successfully!',
                icon: 'success',
                confirmButtonText: 'OK'
            });

            setCategoryName('');
            
            // Wait for 1.5 seconds before navigating back
            setTimeout(() => {
                navigate(-1);
            }, 1500);
        } catch (err) {
            console.error("API Error:", err.response ? err.response.data : err.message);
            
            let errorMessage = 'Failed to add food category.';
            if (err.response) {
                if (err.response.status === 401) {
                    errorMessage = 'Unauthorized. Please login again.';
                    navigate('/login');
                } else if (err.response.data) {
                    errorMessage = err.response.data.message || JSON.stringify(err.response.data);
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
        <div className="min-vh-100">

    {/* Main Content */}
    <main className="container mt-5 w-50">
        <div className="card border-0 ">
            <div className="card-body main rounded-4 shadow">
            <div className="container d-flex justify-content-between align-items-center py-3">
            <h1 className=" mb-5">Create New Food Category</h1>
            </div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <input
                            type="text"
                            placeholder='Food Category'
                            id="categoryName"
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                            className="form-control"
                            required
                        />
                    </div>

                    <div className="d-flex justify-content-end gap-2">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="btn btn-outline-danger"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn1"
                        >
                            Add Category
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </main>
</div>

    );
}

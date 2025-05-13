import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const GetAllUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
    };

    const handleDeleteUser = async (userId) => {
        try {
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!'
            });

            if (result.isConfirmed) {
                const token = localStorage.getItem('token');
                const userToDelete = users.find(user => user.id === userId);

                if (!userToDelete) {
                    throw new Error('User not found');
                }

                console.log('Attempting to delete user:', userToDelete.email);
                console.log('Using token:', token);

                const formData = new FormData();
                formData.append('email', userToDelete.email);

                const response = await axios.delete(
                    'https://localhost:7251/api/admin/DeleteUser',
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data'
                        },
                        data: formData
                    }
                );

                console.log('Delete response:', response);

                // Remove the deleted user from the state
                setUsers(users.filter(user => user.id !== userId));

                Swal.fire(
                    'Deleted!',
                    'User has been deleted.',
                    'success'
                );
            }
        } catch (err) {
            console.error('Detailed error:', {
                message: err.message,
                response: err.response,
                status: err.response?.status,
                data: err.response?.data
            });

            let errorMessage = 'Failed to delete user.';

            if (err.response) {
                if (err.response.status === 401) {
                    errorMessage = 'Unauthorized. Please login again.';
                    handleLogout();
                } else if (err.response.status === 404) {
                    errorMessage = 'User not found.';
                } else if (err.response.data) {
                    errorMessage = typeof err.response.data === 'string'
                        ? err.response.data
                        : JSON.stringify(err.response.data);
                }
            }

            Swal.fire(
                'Error!',
                errorMessage,
                'error'
            );
        }
    };

    const handleLockUser = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('userId', userId);

            await axios.put(
                'https://localhost:7251/api/admin/lock-user',
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            // Update the user's locked status in the state
            setUsers(users.map(user =>
                user.id === userId ? { ...user, isLocked: true } : user
            ));

            Swal.fire({
                title: 'Success!',
                text: 'User has been locked.',
                icon: 'success',
                confirmButtonText: 'OK'
            });
        } catch (err) {
            console.error('Error locking user:', err);
            let errorMessage = 'Failed to lock user.';

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
        }
    };

    const handleUnlockUser = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('userId', userId);

            await axios.put(
                'https://localhost:7251/api/admin/unlock-user',
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            // Update the user's locked status in the state
            setUsers(users.map(user =>
                user.id === userId ? { ...user, isLocked: false } : user
            ));

            Swal.fire({
                title: 'Success!',
                text: 'User has been unlocked.',
                icon: 'success',
                confirmButtonText: 'OK'
            });
        } catch (err) {
            console.error('Error unlocking user:', err);
            let errorMessage = 'Failed to unlock user.';

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
        }
    };

    const handleCreateRestaurant = async (formData) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await axios.post(
                'https://localhost:7251/api/admin/CreateAdminRestaurant',
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
                text: 'Restaurant created successfully.',
                icon: 'success',
                confirmButtonText: 'OK'
            });

            return response.data;
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
            throw err;
        }
    };

    const fetchUsers = async (pageNumber) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await axios.get(`https://localhost:7251/api/admin/GetAllUsers?pageNumber=${pageNumber}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            let usersData = [];

            if (Array.isArray(response.data)) {
                usersData = response.data;
            } else if (response.data && typeof response.data === 'object') {
                if (Array.isArray(response.data.data)) {
                    usersData = response.data.data;
                } else if (Array.isArray(response.data.items)) {
                    usersData = response.data.items;
                } else if (Array.isArray(response.data.users)) {
                    usersData = response.data.users;
                } else {
                    usersData = Object.values(response.data);
                }

                if (response.data.totalPages) {
                    setTotalPages(response.data.totalPages);
                } else if (response.data.total) {
                    setTotalPages(Math.ceil(response.data.total / 10));
                }
            }

            if (!Array.isArray(usersData)) {
                throw new Error('Invalid data format received from API');
            }

            setUsers(usersData);
            setError(null);
        } catch (err) {
            setError('Failed to fetch users');
            console.error('Error fetching users:', err);
            if (err.response?.status === 401) {
                handleLogout();
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers(currentPage);
    }, [currentPage]);

    if (loading) return <div className="text-center p-4">Loading...</div>;
    if (error) return <div className="text-center p-4 text-red-500">Error: {error}</div>;

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">Users Management</h1>
                        <div className="flex space-x-4">
                            <button
                                onClick={() => navigate('/admin/add-restaurant')}
                                className="btn btn-primary"
                            >
                                Create Restaurant
                            </button>
                            <button
                                onClick={() => navigate('/admin/all-restaurants')}
                                className="btn btn-primary"
                            >
                                Show All Restaurants
                            </button>
                            <button
                                onClick={() => navigate('/admin/add-restaurant-manager')}
                                className="btn btn-primary"
                            >
                                Add Restaurant Manager
                            </button>
                            <button
                                onClick={() => navigate('/admin/admin-restaurants')}
                                className="btn btn-primary"
                            >
                                Show Admin Restaurants
                            </button>
                            <button
                                onClick={handleLogout}
                                className="btn btn-danger"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">Users Management</h2>

                        {users.length === 0 ? (
                            <div className="text-center p-4 text-gray-500">No users found</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white border border-gray-300">
                                    <thead>
                                        <tr>
                                            <th className="px-6 py-3 border-b border-gray-300 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                ID
                                            </th>
                                            <th className="px-6 py-3 border-b border-gray-300 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Email
                                            </th>
                                            <th className="px-6 py-3 border-b border-gray-300 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Role
                                            </th>
                                            <th className="px-6 py-3 border-b border-gray-300 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((user) => (
                                            <tr key={user.id}>
                                                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-300">
                                                    {user.id}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-300">
                                                    {user.email}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-300">
                                                    {Array.isArray(user.roles) ? user.roles.join(', ') : user.roles}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-300">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleDeleteUser(user.id)}
                                                            className="btn btn-danger"
                                                        >
                                                            Delete
                                                        </button>
                                                        {user.isLocked ? (
                                                            <button
                                                                onClick={() => handleUnlockUser(user.id)}
                                                                className="btn btn-success"
                                                            >
                                                                Unlock
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleLockUser(user.id)}
                                                                className="btn btn-warning"
                                                            >
                                                                Lock
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

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
                                disabled={currentPage >= totalPages || users.length === 0}
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

export default GetAllUsers;

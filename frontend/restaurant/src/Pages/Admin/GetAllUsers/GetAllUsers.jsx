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
    const userRloe = localStorage.getItem('role')
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
        <div className="container py-5">
            <div className="bg-white shadow rounded p-4">
                <h1 className="fw-semibold mb-4">Users Management</h1>

                <div className="d-flex justify-content-between align-items-center mb-3">
                    <button onClick={() => navigate(-1)} className="btn btn-outline-secondary">
                        <i className="fa-solid fa-arrow-left"></i> Back
                    </button>
                    <button onClick={() => fetchUsers(currentPage)} className="btn btn-outline-info">
                        <i className="fa-solid fa-rotate"></i> Refresh
                    </button>
                </div>

                {users.length === 0 ? (
                    <div className="text-center p-4 text-muted">No users found</div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>ID</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id}>
                                        <td>{user.id}</td>
                                        <td>{user.email}</td>
                                        <td>{Array.isArray(user.roles) ? user.roles.join(', ') : user.roles}</td>
                                        <td>
                                            <div className="d-flex gap-2 flex-wrap">
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    title="Delete User"
                                                >
                                                    <i className="fa-solid fa-trash"></i>
                                                </button>

                                                <button
                                                    className={`btn btn-sm ${user.isLocked ? 'btn-success' : 'btn-warning'}`}
                                                    onClick={() =>
                                                        user.isLocked ? handleUnlockUser(user.id) : handleLockUser(user.id)
                                                    }
                                                    title={user.isLocked ? 'Unlock User' : 'Lock User'}
                                                    
                                                >
                                                    <i className={`fa-solid ${user.isLocked ? 'fa-lock-open' : 'fa-lock'}`}></i>
                                                </button>

                                                {Array.isArray(user.roles) &&
                                                    user.roles.length === 1 &&
                                                    user.roles.includes("Customer") && (
                                                        <button
                                                            className="btn btn-sm btn-outline-success"
                                                            onClick={() =>
                                                                navigate('/admin/add-restaurant-manager', {
                                                                    state: { email: user.email }
                                                                })
                                                            }
                                                            title="Promote to Manager"
                                                        >
                                                            <i className="fa-solid fa-arrow-up"></i> Promote
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
                <div className="mt-4 d-flex justify-content-center align-items-center gap-3">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="btn btn-outline-primary"
                    >
                        <i className="fa-solid fa-chevron-left"></i> Previous
                    </button>
                    <span className="fw-medium">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        disabled={currentPage >= totalPages || users.length === 0}
                        className="btn btn-primary"
                    >
                        Next <i className="fa-solid fa-chevron-right"></i>
                    </button>
                </div>
            </div>
        </div>
    );

};

export default GetAllUsers;

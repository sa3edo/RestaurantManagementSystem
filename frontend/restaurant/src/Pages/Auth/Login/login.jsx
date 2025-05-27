import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { jwtDecode } from 'jwt-decode';
// import 'bootstrap/dist/css/bootstrap.min.css';
import './Login.css'; // إرفاق ملف CSS المعدل

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('https://localhost:7251/api/Account/Login', {
                email,
                password,
            });
            const { token } = response.data;
            
            localStorage.setItem('token', token);
            
            window.dispatchEvent(new Event("storage")); 
            if (!token) {
                console.error('No token returned from server:', response);
                Swal.fire({
                    icon: 'error',
                    title: 'Login Failed',
                    text: 'Something went wrong. Please try again.',
                });
                return;
            }

            // Decode token and get role
            const decoded = jwtDecode(token);
            const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
            console.log('role:', role);

            localStorage.setItem('token', token);
            localStorage.setItem('role', role);

            Swal.fire({
                icon: 'success',
                title: 'Login Successful!',
                showConfirmButton: false,
                timer: 1500, // زمن الإخفاء: 1 ثانية
                width: '300px', // تصغير عرض التنبيه
                padding: '1em', // تقليل التباعد الداخلي
                toast: true, // جعله بشكل Toast صغير
                position: 'top', // وضعه في أعلى يمين الشاشة
            });

            // Navigate based on role
            if (role === 'Admin') {
                navigate('/admin/all-restaurants');
            } else if (role === 'RestaurantManager') {
                navigate('/manager/GetRestaurant');
            } else {
                navigate('/home');
            }

        } catch (err) {
            console.error('Login error (full):', err);

            // Show user-friendly error message
            if (err.response && err.response.status === 401) {
                Swal.fire({
                    icon: 'error',
                    title: 'Login Failed',
                    text: 'Invalid email or password.',
                });
            } else {
                console.error('Unexpected error during login:', err);
                Swal.fire({
                    icon: 'error',
                    title: 'Login Failed',
                    text: 'Something went wrong. Please try again later.',
                });
            }
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 ">
            <div className="login-container shadow-lg p-4">
                <h2 className="text-center mb-4 section-title">Login</h2>
                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">Email:</label>
                        <input
                            type="email"
                            id="email"
                            className="form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">Password:</label>
                        <input
                            type="password"
                            id="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn w-100">
                        Login
                    </button>
                </form>

                <div className="mt-3 text-center">
                    <p>
                        Don't have an account? <Link to="/register">Register</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;

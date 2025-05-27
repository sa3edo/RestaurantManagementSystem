import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://localhost:7251/api/Account/Register', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        passwords: formData.password,
      });

      Swal.fire({
        icon: 'success',
        title: 'Registration Successful!',
        text: 'You can now login.',
        timer: 2000,
        showConfirmButton: false,
      });

      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      console.error(err.response?.data || err.message);
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: 'Please check your input or try again later.',
      });
    }
  };

  return (
    <div className="container main d-flex align-items-center justify-content-center" style={{ minHeight: '90vh' }}>
      <div className="login-container w-100" style={{ maxWidth: '500px' }}>
        <h2 className="text-center mb-4" style={{ fontFamily: 'var(--title-font)', fontSize: '3rem' }}>Register</h2>
        <form onSubmit={handleRegister}>
          <div className="mb-3">
            <label className="form-label">First Name</label>
            <input
              type="text"
              className="form-control"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Last Name</label>
            <input
              type="text"
              className="form-control"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Email address</label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="btn1 w-100">
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;

import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

export default function AddFoodCategory() {
  const { restaurantID } = useParams();
  const navigate = useNavigate();

  const restaurantId = parseInt(restaurantID);
  const [categoryName, setCategoryName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const categoryID = 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        `https://localhost:7251/api/restaurant-manager/AddMangerFoodCategory?restaurantId=${restaurantId}`,
        {
          categoryID,
          name: categoryName
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setSuccess('✅ Category Added Successfully!');
      setError('');
      setCategoryName('');
    } catch (err) {
      console.error("❌ API Error:", err.response ? err.response.data : err.message);
      setError('❌ Error adding category!');
      setSuccess('');
    }
  };

  return (
    <div className="container mt-4">
      <h3>Add New Food Category 🍽️</h3>
      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="categoryName" className="form-label">Category Name</label>
          <input
            type="text"
            className="form-control"
            id="categoryName"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">Add Category</button>
        <button className="btn btn-secondary ms-2" onClick={() => navigate(-1)}>Back</button>
      </form>
    </div>
  );
}

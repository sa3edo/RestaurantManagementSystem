import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

export default function UpdateCategory() {
  const { categoryID, restaurantID } = useParams();
  const navigate = useNavigate();
  const [categoryName, setCategoryName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const restaurantId = parseInt(restaurantID);
  const catId = parseInt(categoryID);


  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `https://localhost:7251/api/restaurant-manager/UpdateMangerFoodCategory/${catId}?restaurantId=${restaurantId}`,
        { 
          categoryID: catId,
          name: categoryName
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setSuccess('✅ Category updated successfully!');
      setError('');

      
    } catch (err) {
      console.error('❌ API Error:', err.response ? err.response.data : err.message);
      setError('❌ Failed to update category!');
      setSuccess('');
    }
  };

  return (
    <div className="container mt-4">
      <h3>Update Food Category ✏️</h3>
      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleUpdate}>
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
        <button type="submit" className="btn btn-success">Update Category</button>
        <button
          type="button"
          className="btn btn-secondary ms-2"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
      </form>
    </div>
  );
}

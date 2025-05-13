import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function UpdateCategoryModal({ show, handleClose, categoryID, restaurantID, onUpdated }) {
  const [categoryName, setCategoryName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const catId = parseInt(categoryID);
  const restaurantId = parseInt(restaurantID);

  useEffect(() => {
    if (show && catId) {
      const fetchCategory = async () => {
        try {
          const response = await axios.get(
            `https://localhost:7251/api/restaurant-manager/GetFoodCategoryByd/${catId}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
            }
          );
          setCategoryName(response.data.name);
        } catch (err) {
          console.error('Error fetching category:', err);
          setError('❌ Failed to load category details.');
        }
      };
      fetchCategory();
    }
  }, [show, catId]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `https://localhost:7251/api/restaurant-manager/UpdateMangerFoodCategory/${catId}?restaurantId=${restaurantId}`,
        { categoryID: catId, name: categoryName },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setSuccess('✅ Category updated successfully!');
      setError('');
      onUpdated();  // لإبلاغ الأب إنه خلص التحديث
      setTimeout(() => handleClose(), 1000);  // قفل المودال بعد ثانية
    } catch (err) {
      console.error('❌ API Error:', err.response ? err.response.data : err.message);
      setError('❌ Failed to update category!');
      setSuccess('');
    }
  };

  return (
    <div className={`modal fade ${show ? 'show d-block' : ''}`} tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content rounded-4 shadow">
          <div className="modal-header">
            <h5 className="modal-title">✏️ Update Food Category</h5>
            <button type="button" className="btn-close" onClick={handleClose}></button>
          </div>
          <div className="modal-body">
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
              <div className="d-flex justify-content-end">
                <button type="button" className="btn btn-secondary me-2" onClick={handleClose}>Cancel</button>
                <button type="submit" className="btn btn-success">Update</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AddMenuItem() {
  const { restaurantID, categoryID } = useParams();
  const navigate = useNavigate();

  const [menuItem, setMenuItem] = useState({
    name: '',
    description: '',
    price: '',
    availability: true,
    MenuItemID: 0,
  });
  const [image, setImage] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMenuItem((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files.length > 0) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      setError('❌ Please select an image for the menu item!');
      return;
    }

    const formData = new FormData();
    formData.append('MenuItemID', menuItem.MenuItemID);
    formData.append('restaurantID', restaurantID);
    formData.append('categoryID', categoryID);
    formData.append('name', menuItem.name);
    formData.append('description', menuItem.description);
    formData.append('price', menuItem.price);
    formData.append('availability', menuItem.availability);
    formData.append('MenuImg', image);

    try {
      const response = await axios.post(
        `https://localhost:7251/api/restaurant-manager/CreateMenuItem?restaurantId=${restaurantID}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setSuccess('✅ Menu Item added successfully!');
      setError('');
      setMenuItem({ name: '', description: '', price: '', availability: true, MenuItemID: 0 });
      setImage(null);
      setTimeout(() => navigate(-1), 2000);
    } catch (err) {
      setError('❌ Failed to add menu item.');
      console.error(err);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center text-primary">🍔 Add New Menu Item</h2>
      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <form className="p-4 shadow rounded bg-light" onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Item Name</label>
          <input type="text" name="name" value={menuItem.name} onChange={handleChange} className="form-control" required />
        </div>

        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea name="description" value={menuItem.description} onChange={handleChange} className="form-control" rows="3" required></textarea>
        </div>

        <div className="mb-3">
          <label className="form-label">Price</label>
          <input type="number" name="price" value={menuItem.price} onChange={handleChange} className="form-control" required />
        </div>

        <div className="mb-3">
          <label className="form-label">Item Image</label>
          <input type="file" accept="image/*" onChange={handleImageChange} className="form-control" required />
        </div>

        {image && (
          <div className="text-center mt-3">
            <p>📸 Image Preview:</p>
            <img src={URL.createObjectURL(image)} alt="Menu Item Preview" className="img-fluid rounded shadow" style={{ maxWidth: '250px' }} />
          </div>
        )}

        <div className="form-check mt-3">
          <input type="checkbox" name="availability" checked={menuItem.availability} onChange={handleChange} className="form-check-input" />
          <label className="form-check-label">Available</label>
        </div>

        <button type="submit" className="btn btn-success w-100 mt-4">➕ Add Item</button>
        <button type="button" className="btn btn-secondary w-100 mt-2" onClick={() => navigate(-1)}>🔙 Back</button>
      </form>
    </div>
  );
}
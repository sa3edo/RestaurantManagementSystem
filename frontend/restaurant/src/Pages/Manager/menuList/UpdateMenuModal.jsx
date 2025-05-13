import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './modal.css';

export default function UpdateMenuModal({ item, onClose, onSuccess }) {
  const [menuItem, setMenuItem] = useState(item);
  const [image, setImage] = useState(null);

  useEffect(() => {
    setMenuItem(item);
  }, [item]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMenuItem(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('MenuItemID', item.menuItemID);
    formData.append('restaurantID', item.restaurantID);
    formData.append('categoryID', item.categoryID);
    formData.append('name', menuItem.name);
    formData.append('description', menuItem.description);
    formData.append('price', menuItem.price);
    formData.append('availability', menuItem.availability);

    if (image) {
      formData.append('MenuImg', image, image.name);
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `https://localhost:7251/api/restaurant-manager/UpdateMenuItem/${item.menuItemID}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      alert("✅ Menu Item updated!");
      onSuccess(); // تحدث القائمة.
      onClose();   // اغلق المودال.
    } catch (error) {
      console.error("❌ Error updating item:", error.response?.data || error);
      alert("Failed to update item!");
    }
  };

  if (!item) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>×</button>
        <h2>✏️ Update Menu Item</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" name="name" value={menuItem.name} onChange={handleChange} placeholder="Name" required />
          <textarea name="description" value={menuItem.description} onChange={handleChange} placeholder="Description" required />
          <input type="number" name="price" value={menuItem.price} onChange={handleChange} placeholder="Price" required />
          <input type="file" accept="image/*" onChange={handleImageChange} />

          {image ? (
            <img src={URL.createObjectURL(image)} alt="Preview" className="preview-image" />
          ) : menuItem.imgUrl && (
            <img src={`https://localhost:7251/MenuImages/${menuItem.imgUrl}`} alt="Current" className="preview-image" />
          )}

          <label>
            <input type="checkbox" name="availability" checked={menuItem.availability} onChange={handleChange} />
            Available
          </label>

          <button type="submit" className="save-btn">Save Changes</button>
        </form>
      </div>
    </div>
  );
}

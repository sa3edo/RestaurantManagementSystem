import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function UpdateMenuItem() {
  const { menuItemID , restaurantID, categoryID} = useParams();

  const [menuItem, setMenuItem] = useState({
    name: "",
    description: "",
    price: "",
    availability: true
  });

  const [image, setImage] = useState(null);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`https://localhost:7251/api/restaurant-manager/GetMenuItemByID/${menuItemID}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setMenuItem(response.data);
      } catch (error) {
        console.error("Error fetching menu item:", error);
      }
    };
    fetchItem();
  }, [menuItemID]);

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
    formData.append('MenuItemID', menuItemID);
    formData.append('restaurantID', restaurantID);
    formData.append('categoryID', categoryID);
    formData.append('name', menuItem.name);
    formData.append('description', menuItem.description);
    formData.append('price', menuItem.price);
    formData.append('availability', menuItem.availability);
    
    if (image) {
      formData.append('MenuImg', image, image.name);
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `https://localhost:7251/api/restaurant-manager/UpdateMenuItem/${menuItemID}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log("✅ Item Updated:", response.data);
      alert("Menu Item updated successfully!");

    } catch (error) {
      console.error("❌ Error Updating Item:", error.response?.data || error);
      alert("Failed to update item, check console!");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Update Menu Item ✍️</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          value={menuItem.name}
          placeholder="Name"
          onChange={handleChange}
          className="form-control mb-2"
          required
        />
        <textarea
          name="description"
          value={menuItem.description}
          placeholder="Description"
          onChange={handleChange}
          className="form-control mb-2"
          required
        />
        <input
          type="number"
          name="price"
          value={menuItem.price}
          placeholder="Price"
          onChange={handleChange}
          className="form-control mb-2"
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="form-control mb-2"
        />

        {image && (
          <div className="mt-3">
            <p>📸 Image Preview:</p>
            <img
              src={URL.createObjectURL(image)}
              alt="Menu Preview"
              style={{ maxWidth: '200px', borderRadius: '8px' }}
            />
          </div>
        )}

        <label className="d-block mt-2">
          <input
            type="checkbox"
            name="availability"
            checked={menuItem.availability}
            onChange={handleChange}
          />
          {" "}Available
        </label>

        <button type="submit" className="btn btn-success w-100 mt-3">Update Item</button>
      </form>
    </div>
  );
}

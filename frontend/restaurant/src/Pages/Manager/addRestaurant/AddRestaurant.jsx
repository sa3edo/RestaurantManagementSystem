import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function AddRestaurant() {
  const [restaurantData, setRestaurantData] = useState({
    name: '',
    location: '',
    description: '',
  });

  const [image, setImage] = useState(null);

  const handleChange = (e) => {
    setRestaurantData({
      ...restaurantData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: '❌ Please select a restaurant image!',
      });
      return;
    }

    const formData = new FormData();
    formData.append('Name', restaurantData.name);
    formData.append('Location', restaurantData.location);
    formData.append('Description', restaurantData.description);
    formData.append('RestImg', image, image.name);

    try {
      const token = localStorage.getItem('token');

      const response = await axios.post(
        'https://localhost:7251/api/restaurant-manager/CreateMangerRestaurant',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      console.log("✅ Restaurant Created:", response.data);

      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: '✅ Restaurant added successfully!',
      });

      // Optionally clear the form
      setRestaurantData({ name: '', location: '', description: '' });
      setImage(null);

    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: '❌ Failed to add restaurant. Please try again.',
      });
    }
  };

  return (
    <div className="container mt-4">
      <h2>Add New Restaurant 🍽️</h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Restaurant Name</label>
          <input
            type="text"
            name="name"
            className="form-control"
            value={restaurantData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label>Location</label>
          <input
            type="text"
            name="location"
            className="form-control"
            value={restaurantData.location}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label>Description</label>
          <textarea
            name="description"
            className="form-control"
            rows="4"
            value={restaurantData.description}
            onChange={handleChange}
            required
          ></textarea>
        </div>

        <div className="mb-3">
          <label>Restaurant Image</label>
          <input
            type="file"
            accept="image/*"
            className="form-control"
            onChange={handleImageChange}
            required
          />
        </div>

        {image && (
          <div className="mt-3">
            <p>📸 Image Preview:</p>
            <img
              src={URL.createObjectURL(image)}
              alt="Restaurant Preview"
              style={{ maxWidth: '200px', borderRadius: '8px', border: '1px solid #ccc' }}
            />
          </div>
        )}

        <button type="submit" className="btn btn-primary mt-4">
          Add Restaurant
        </button>
      </form>
    </div>
  );
}

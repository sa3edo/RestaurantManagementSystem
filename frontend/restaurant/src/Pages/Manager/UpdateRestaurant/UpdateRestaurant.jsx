import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

export default function UpdateRestaurant() {
  const { id } = useParams();  // هنا هتجيب ID المطعم من URL
  const navigate = useNavigate();

  const [restaurantData, setRestaurantData] = useState({
    name: '',
    location: '',
    description: '',
  });

  const [image, setImage] = useState(null);
  const [existingImage, setExistingImage] = useState(null);

  useEffect(() => {
    fetchRestaurantData();
  }, []);

  const fetchRestaurantData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`https://localhost:7251/api/restaurant-manager/GetRestaurantDetails?RestaurantId=${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = response.data;
      setRestaurantData({
        name: data.name,
        location: data.location,
        description: data.description
      });
      setExistingImage(data.imgUrl);  // الصورة الموجودة

    } catch (error) {
      console.error('Error fetching restaurant:', error);
      alert("❌ Error loading restaurant data!");
    }
  };

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

    const formData = new FormData();
    formData.append('Id', id);
    formData.append('Name', restaurantData.name);
    formData.append('Location', restaurantData.location);
    formData.append('Description', restaurantData.description);

    if (image) {
      formData.append('RestImg', image, image.name);
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `https://localhost:7251/api/restaurant-manager/UpdateMangerRestaurant?restaurantId=${id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log(response.data);
      alert("✅ Restaurant updated successfully!");
      navigate('/manager/GetRestaurant');

    } catch (error) {
      console.error('Error updating restaurant:', error);
      alert("❌ Error updating restaurant!");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Update Restaurant 📝</h2>

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
          />
        </div>

        {image ? (
          <div className="mt-3">
            <p>📸 New Image Preview:</p>
            <img
              src={URL.createObjectURL(image)}
              alt="Preview"
              style={{ maxWidth: '200px', borderRadius: '8px', border: '1px solid #ccc' }}
            />
          </div>
        ) : existingImage && (
          <div className="mt-3">
            <p>🖼️ Current Image:</p>
            <img
              src={`https://localhost:7251/RestImages/${existingImage}`}
              alt="Current Restaurant"
              style={{ maxWidth: '200px', borderRadius: '8px', border: '1px solid #ccc' }}
            />
          </div>
        )}

        <button type="submit" className="btn btn-primary mt-4">
          Update Restaurant
        </button>
      </form>
    </div>
  );
}

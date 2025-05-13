import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../../App.css';
import './AllRes.css'
export default function AllRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchRestaurants = async () => {
    try {
      const response = await axios.get('https://localhost:7251/api/User/GetAllRestaurant', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      if (response.data?.items && Array.isArray(response.data.items)) {
        setRestaurants(response.data.items);
      } else {
        setError('❌ Unexpected API response format.');
      }
      setLoading(false);
    } catch (err) {
      setError('❌ Failed to load restaurants.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  if (loading) return <div className="loading">Loading restaurants...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="restaurant-page container py-5">
      <div className="restaurant-header row justify-content-between align-items-center mb-4">
        <h1 className="col-12 col-md-8">All Restaurants</h1>
        <div className="col-12 col-md-4 d-flex justify-content-between">
          <button onClick={() => navigate('/customer/my-orders')} className="home-btn">
            Orders & Payment
          </button>
          <button onClick={() => navigate('/customer/my-reservations')} className="home-btn">
            My Reservations
          </button>
        </div>
      </div>

      <h2 className="section-title text-center mb-4">🍴 Discover Amazing Restaurants</h2>

      <div className="row g-4">
        {restaurants.map((restaurant) => (
          <div key={restaurant.restaurantID} className="col-12 col-sm-6 col-md-4 col-lg-4" data-aos="zoom-in">
            <div className="restaurant-card card shadow-sm rounded-3">
              <img
                src={`https://localhost:7251/RestImages/${restaurant.imgUrl}`}
                alt={restaurant.name}
                className="restaurant-image card-img-top"
              />
              <div className="restaurant-info card-body text-center">
                <h3 className="card-title">{restaurant.name}</h3>
                <p className="card-text">{restaurant.location}</p>
                <div className="card-buttons">
                  <button
                    onClick={() => navigate(`/customer/allRestaurants/details/${restaurant.restaurantID}`)}
                    className="btn btn-outline-primary w-100 mb-2"
                  >
                    ℹ️ View Details
                  </button>
                  <button
                    onClick={() => navigate(`/customer/makeReview/${restaurant.restaurantID}`)}
                    className="btn btn-outline-warning w-100 mb-2"
                  >
                    ⭐ Add Review
                  </button>
                  <button
                    onClick={() => navigate(`/customer/createReservation/${restaurant.restaurantID}`)}
                    className="btn btn-outline-success w-100"
                  >
                    📅 Make Reservation
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

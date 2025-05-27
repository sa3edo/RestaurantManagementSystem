import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../../App.css';
import './AllRes.css';

export default function AllRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();

  const fetchRestaurants = async () => {
    try {
      const response = await axios.get('https://localhost:7251/api/User/GetAllRestaurant', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      if (response.data?.items && Array.isArray(response.data.items)) {
        setRestaurants(response.data.items);
        setFilteredRestaurants(response.data.items); // Initial display is all restaurants
      } else {
        setError('❌ Unexpected API response format.');
      }
      setLoading(false);
    } catch (err) {
      setError('❌ Failed to load restaurants.');
      setLoading(false);
    }
  };
  const handleChatClick = (restaurant) => {
    const receiverId = restaurant.managerID;
    const receiverName = restaurant.name;

    // احفظ في localStorage
    localStorage.setItem('receiverId', receiverId);
    localStorage.setItem('receiverName', receiverName);

    navigate('/chat', {
      state: { receiverId, receiverName }
    });
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  // Function to handle filtering by category
  const handleTabClick = (category) => {
    setActiveTab(category);

    if (category === 'all') {
      setFilteredRestaurants(restaurants); // Show all restaurants
    } else {
      const filtered = restaurants.filter((restaurant) =>
        restaurant.description?.toLowerCase().includes(category.toLowerCase()) ||
        restaurant.name.toLowerCase().includes(category.toLowerCase()) ||
        restaurant.location.toLowerCase().includes(category.toLowerCase())
      );
      setFilteredRestaurants(filtered); // Filter based on category
    }
  };

  if (loading) return <div className="loading">Loading restaurants...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="restaurant-page container mt-5 rounded-4 py-5">
      <div className="restaurant-header row mb-4" data-aos="zoom-in">
        <div className="col-md-4">
          <h2>All Restaurants</h2>
        </div>
        <div className="col-12 col-md-6">
          <div className="d-flex justify-content-evenly">
            <button onClick={() => navigate('/customer/my-orders')} className="home-btn user-btn">
              <i className="fas fa-credit-card"></i> Orders & Payment
            </button>
            <button onClick={() => navigate('/customer/my-reservations')} className="home-btn user-btn">
              <i className="fas fa-calendar-check"></i> My Reservations
            </button>

          </div>
        </div>
      </div>

      <h2 className="section-title text-center mb-4" data-aos="zoom-in">
        <i className="fas fa-utensils"></i> Discover Amazing Restaurants
      </h2>

      {/* Tabs for filtering */}
      <div className="tabs mb-4">
        <ul className="nav nav-pills ">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => handleTabClick('all')}>
              All
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'pizza' ? 'active' : ''}`}
              onClick={() => handleTabClick('pizza')}>
              pizza
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'grilled' ? 'active' : ''}`}
              onClick={() => handleTabClick('grilled')}>
              grilled
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'desert' ? 'active' : ''}`}
              onClick={() => handleTabClick('desert')}>
              desert
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'koshary ' ? 'active' : ''}`}
              onClick={() => handleTabClick('koshary ')}>
              koshary 
            </button>
          </li>
        </ul>
      </div>

      <div className="row g-4">
        {filteredRestaurants.map((restaurant) => (
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
                    className="btn w-100 mb-2"
                  >
                    <i className="fas fa-info-circle"></i> View Details
                  </button>
                  <button
                    onClick={() => navigate(`/customer/makeReview/${restaurant.restaurantID}`)}
                    className="btn w-100 mb-2"
                  >
                    <i className="fas fa-star"></i> Add Review
                  </button>
                  <button
                    onClick={() => navigate(`/customer/createReservation/${restaurant.restaurantID}`)}
                    className="btn w-100"
                  >
                    <i className="fas fa-calendar-alt"></i> Make Reservation
                  </button>
                </div>
                  <button
                    onClick={() => handleChatClick(restaurant)}
                    className="btn1  text-white w-100 mt-2"


                  >
                    <i className="fas fa-comments me-2"></i> 
                    Chat whit manager
                  </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

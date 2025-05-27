import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import '../../../App.css';
import '../AllRestaurants/AllRes.css';

export default function SearchResults() {
  const location = useLocation();
  const [allRestaurants, setAllRestaurants] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const queryParams = new URLSearchParams(location.search);
  const searchTerm = queryParams.get('term')?.toLowerCase();

  useEffect(() => {
    const fetchAllRestaurants = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`https://localhost:7251/api/User/GetAllRestaurant`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const restaurants = res.data?.items || [];
        setAllRestaurants(restaurants);

        if (searchTerm) {
          const filtered = restaurants.filter(r =>
            r.name?.toLowerCase().includes(searchTerm) ||
            r.location?.toLowerCase().includes(searchTerm) ||
            r.description?.toLowerCase().includes(searchTerm)
          );
          setFilteredResults(filtered);
        } else {
          setFilteredResults(restaurants);
        }
      } catch (error) {
        console.error('Error fetching restaurants:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllRestaurants();
  }, [searchTerm]);

  if (loading) return <div className="loading">Loading search results...</div>;

  return (
    <div className="restaurant-page container mt-5 rounded-4 py-5">
      <div className="restaurant-header row mb-4" data-aos="zoom-in">
        <div className="col-md-6">
          <h2>
            🔍 Search Results for: <span className="text-primary">{searchTerm}</span>
          </h2>
        </div>
      </div>

      {filteredResults.length === 0 ? (
        <p className="text-muted mt-3">No restaurants matched your search.</p>
      ) : (
        <div className="row g-4">
          {filteredResults.map((restaurant) => (
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
                    <button className="btn w-100 mb-2" onClick={() => window.location.href = `/customer/allRestaurants/details/${restaurant.restaurantID}`}>
                      <i className="fas fa-info-circle"></i> View Details
                    </button>
                    <button className="btn w-100 mb-2" onClick={() => window.location.href = `/customer/makeReview/${restaurant.restaurantID}`}>
                      <i className="fas fa-star"></i> Add Review
                    </button>
                    <button className="btn w-100" onClick={() => window.location.href = `/customer/createReservation/${restaurant.restaurantID}`}>
                      <i className="fas fa-calendar-alt"></i> Make Reservation
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
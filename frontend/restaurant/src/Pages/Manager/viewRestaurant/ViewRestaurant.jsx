import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

export default function ViewRestaurant() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const getDecodedToken = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      return decoded;
    } catch (error) {
      return null;
    }
  };

  const decodedToken = getDecodedToken();
  const managerId = decodedToken
    ? decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]
    : null;

  const fetchRestaurants = async (pageNumber) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://localhost:7251/api/restaurant-manager/GetRestaurant?pageNumber=${pageNumber}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.data.restaurants && Array.isArray(response.data.restaurants)) {
        setRestaurants(response.data.restaurants);
        const calculatedTotalPages = Math.ceil(response.data.totalRecords / response.data.pageSize);
        setTotalPages(calculatedTotalPages);
      } else {
        setRestaurants([]);
        setTotalPages(1);
      }

      setLoading(false);
    } catch (err) {
      setError('❌ Error fetching restaurants!');
      setLoading(false);
    }
  };

  const deleteRestaurant = async (id) => {
    try {
      await axios.delete(
        `https://localhost:7251/api/restaurant-manager/DeleteMangerRestaurant/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      alert("✅ Restaurant deleted successfully!");
      fetchRestaurants(currentPage);
    } catch (error) {
      alert("❌ Failed to delete restaurant!");
    }
  };

  useEffect(() => {
    fetchRestaurants(currentPage);
  }, [currentPage]);

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  // if (error) return <div className="text-danger text-center mt-5">{error}</div>;

  return (
    <div className="container mt-5 mb-5">
      <h2 className="text-center section-title mb-4">
        <i className="fas fa-utensils me-2 text-primary"></i> Your Restaurants
      </h2>
      <div className="d-flex justify-content-center gap-3 mb-4 flex-wrap">
        <button
          className="btn btn-success"
          onClick={() => navigate("/manager/addRestaurant")}
        >
          <i className="fas fa-plus me-2"></i> Add Restaurant
        </button>

        <button
          className="btn btn-primary"
          onClick={() => navigate("/vendor/chat")}
        >
          <i className="fas fa-comments me-2"></i> Chat
        </button>
      </div>

      {restaurants.length === 0 ? (
        <p className="text-center text-muted">No restaurants available.</p>
      ) : (
        <div className="row">
          {restaurants.map((restaurant) => (
            <div key={restaurant.restaurantID} className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
              <div className="card h-100 shadow border-0 rounded-4">
                <div
                  role="button"
                  onClick={() => navigate(`/manager/details/${restaurant.restaurantID}`)}
                >
                  {restaurant.imgUrl && (
                    <img
                      src={`https://localhost:7251/RestImages/${restaurant.imgUrl}`}
                      alt={restaurant.name}
                      className="card-img-top rounded-top-4"
                      style={{ height: '180px', objectFit: 'cover' }}
                    />
                  )}
                </div>
                <div className="card-body d-flex flex-column">
                  <h5
                    className="card-title fw-bold"
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/manager/details/${restaurant.restaurantID}`)}
                  >
                    {restaurant.name}
                  </h5>
                  <p className="card-text"><strong>Location:</strong> {restaurant.location}</p>
                  <p className="card-text">
                    <strong>Status:</strong>{' '}
                    {restaurant.status === 0 && <span className="badge bg-warning text-dark">Pending</span>}
                    {restaurant.status === 1 && <span className="badge bg-success">Approved</span>}
                    {restaurant.status === 2 && <span className="badge bg-danger">Rejected</span>}
                  </p>
                  <p className="card-text mt-auto">
                    <strong>Created At:</strong>{' '}
                    {restaurant.createdAt ? new Date(restaurant.createdAt).toLocaleDateString() : 'N/A'}
                  </p>

                  <div className="mt-3">
                    <div className="dropdown mb-2 w-100">
                      <button className="btn btn2 w-100 dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <i className="fas fa-hamburger me-2"></i> Food & Menu
                      </button>
                      <ul className="dropdown-menu w-100">
                        <li><button className="dropdown-item" onClick={() => navigate(`/manager/addFoodCategory/${restaurant.restaurantID}`)}><i className="fas fa-plus-circle me-2"></i> Add Food Category</button></li>
                        <li><button className="dropdown-item" onClick={() => navigate(`/manager/AllCategory/${restaurant.restaurantID}`)}><i className="fas fa-folder-open me-2"></i> All Categories</button></li>
                        <li><button className="dropdown-item" onClick={() => navigate(`/manager/viewMenu/${restaurant.restaurantID}`)}><i className="fas fa-scroll me-2"></i> View Menu</button></li>
                      </ul>
                    </div>

                    <div className="dropdown mb-2 w-100">
                      <button className="btn btn2 w-100 dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <i className="fas fa-chair me-2"></i> Tables & Slots
                      </button>
                      <ul className="dropdown-menu w-100">
                        <li><button className="dropdown-item" onClick={() => navigate(`/manager/addTimeSlot/${restaurant.restaurantID}`)}><i className="fas fa-plus-circle me-2"></i> Add Time Slot</button></li>
                        <li><button className="dropdown-item" onClick={() => navigate(`/manager/TimeSlots/${restaurant.restaurantID}`)}><i className="fas fa-clock me-2"></i> View All Time Slots</button></li>
                        <li><button className="dropdown-item" onClick={() => navigate(`/manager/createTable/${restaurant.restaurantID}`)}><i className="fas fa-plus me-2"></i> Create Table</button></li>
                        <li><button className="dropdown-item" onClick={() => navigate(`/manager/AllTables/${restaurant.restaurantID}`)}><i className="fas fa-table me-2"></i> All Tables</button></li>
                      </ul>
                    </div>

                    <div className="dropdown mb-2 w-100">
                      <button className="btn btn2 w-100 dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <i className="fas fa-cogs me-2"></i> Management
                      </button>
                      <ul className="dropdown-menu w-100">
                        <li><button className="dropdown-item" onClick={() => navigate(`/manager/updateRestaurant/${restaurant.restaurantID}`)}><i className="fas fa-pen me-2"></i> Update</button></li>
                        <li><button className="dropdown-item" onClick={() => deleteRestaurant(restaurant.restaurantID)}><i className="fas fa-trash-alt me-2"></i> Delete Restaurant</button></li>
                      </ul>
                    </div>

                    <div className="dropdown w-100">
                      <button className="btn btn2 w-100 dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <i className="fas fa-calendar-alt me-2"></i> Reservations & Orders
                      </button>
                      <ul className="dropdown-menu w-100">
                        <li><button className="dropdown-item" onClick={() => navigate(`/manager/viewReservations/${restaurant.restaurantID}`)}><i className="fas fa-calendar-day me-2"></i> View Reservations</button></li>
                        <li><button className="dropdown-item" onClick={() => navigate(`/manager/viewOrders/${restaurant.restaurantID}`)}><i className="fas fa-box-open me-2"></i> View Orders</button></li>
                        <li><button className="dropdown-item" onClick={() => navigate(`/manager/managerReviews?RestID=${restaurant.restaurantID}`)}><i className="fas fa-star me-2"></i> Reviews</button></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="d-flex justify-content-center align-items-center mt-4">
          <button
            className="btn btn1 me-2"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          >
            <i className="fas fa-chevron-left"></i> Previous
          </button>
          <span className="mx-2">Page {currentPage} of {totalPages}</span>
          <button
            className="btn btn1 ms-2"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          >
            Next <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      )}
    </div>
  );
}

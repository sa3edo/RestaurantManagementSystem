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
      console.log("Decoded Token:", decoded);
      return decoded;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  const decodedToken = getDecodedToken();
  const managerId = decodedToken
    ? decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]
    : null;

  console.log("Manager ID:", managerId);

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

      console.log('RAW API Response:', response.data);

      if (response.data.restaurants && Array.isArray(response.data.restaurants)) {
        setRestaurants(response.data.restaurants);
        const calculatedTotalPages = Math.ceil(response.data.totalRecords / response.data.pageSize);
        setTotalPages(calculatedTotalPages);
      } else {
        console.warn("⚠️ Unexpected data format:", response.data);
        setRestaurants([]);
        setTotalPages(1);
      }

      setLoading(false);
    } catch (err) {
      setError('❌ Error fetching restaurants!');
      setLoading(false);
      console.error('Error fetching restaurants:', err);
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
      fetchRestaurants(currentPage); // بعد الحذف، أعد تحميل نفس الصفحة
    } catch (error) {
      console.error("❌ Error deleting restaurant:", error.response?.data || error);
      alert("❌ Failed to delete restaurant!");
    }
  };

  useEffect(() => {
    fetchRestaurants(currentPage);
  }, [currentPage]);

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (error) return <div className="text-danger text-center mt-5">{error}</div>;

  return (
    <div className="container mt-5 mb-5">
      <h2 className="text-center mb-4">🍽️ Your Restaurants</h2>

      {restaurants.length === 0 ? (
        <p className="text-center text-muted">No restaurants available.</p>
      ) : (
        <div className="row">
          {restaurants.map((restaurant) => (
            <div key={restaurant.restaurantID} className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
              <div className="card h-100 shadow border-0 rounded-4">
                {restaurant.imgUrl && (
                  <img
                    src={`https://localhost:7251/RestImages/${restaurant.imgUrl}`}
                    alt={restaurant.name}
                    className="card-img-top rounded-top-4"
                    style={{ height: '180px', objectFit: 'cover' }}
                  />
                )}
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title fw-bold">{restaurant.name}</h5>
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

                  <div className="d-grid gap-2 mt-3">
                    <button className="btn btn-outline-primary" onClick={() => window.location.href = `/manager/addFoodCategory/${restaurant.restaurantID}`}>
                      ➕ Add Food Category
                    </button>
                    <button className="btn btn-warning" onClick={() => window.location.href = `/manager/AllCategory/${restaurant.restaurantID}`}>
                      All Category
                    </button>
                    <button className="btn btn-success" onClick={() => window.location.href = `/manager/updateRestaurant/${restaurant.restaurantID}`}>
                      Update
                    </button>
                    <button className="btn btn-info" onClick={() => window.location.href = `/manager/viewMenu/${restaurant.restaurantID}`}>
                      View Menu
                    </button>
                    <button className="btn btn-danger" onClick={() => deleteRestaurant(restaurant.restaurantID)}>
                      Delete Restaurant
                    </button>
                    <button className="btn btn-light border" onClick={() => window.location.href = `/manager/addTimeSlot/${restaurant.restaurantID}`}>
                      ➕ Add Time Slot
                    </button>
                    <button className="btn btn-dark" onClick={() => window.location.href = `/manager/TimeSlots/${restaurant.restaurantID}`}>
                      View All Time Slots
                    </button>
                    <button className="btn btn-outline-dark" style={{ backgroundColor: 'tomato' }} onClick={() => window.location.href = `/manager/createTable/${restaurant.restaurantID}`}>
                      Create Table
                    </button>
                    <button className="btn btn-outline-success" onClick={() => window.location.href = `/manager/AllTables/${restaurant.restaurantID}`}>
                      All Tables
                    </button>
                    <button className="btn btn-primary" onClick={() => window.location.href = `/manager/viewReservations/${restaurant.restaurantID}`}>
                      🗓️ View Reservations
                    </button>
                    <button
                      onClick={() => navigate(`/manager/viewOrders/${restaurant.restaurantID}`)}
                      className="btn btn-warning"
                    >
                      View Orders
                    </button>
                    <button
                      onClick={() => navigate(`/manager/managerReviews?RestID=${restaurant.restaurantID}`)}
                      className="btn btn-info"
                    >
                      Reviews
                    </button>
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
            className="btn btn-outline-secondary me-2"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          >
            ◀ Previous
          </button>
          <span className="mx-2">Page {currentPage} of {totalPages}</span>
          <button
            className="btn btn-outline-secondary ms-2"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          >
            Next ▶
          </button>
        </div>
      )}
    </div>
  );
}

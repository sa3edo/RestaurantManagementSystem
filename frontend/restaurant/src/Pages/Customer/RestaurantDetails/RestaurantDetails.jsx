import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './RestaurantDetails.css'; // ملف CSS للأنيميشن والتنسيق

export default function RestaurantDetails() {
  const { restaurantID } = useParams();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState(null);
  const [categories, setCategories] = useState([]);
  const [menuByCategory, setMenuByCategory] = useState({});
  const [expandedCategoryID, setExpandedCategoryID] = useState(null);
  const [showCategories, setShowCategories] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRestaurantDetails = async () => {
    try {
      const response = await axios.get(
        `https://localhost:7251/api/User/GetRestaurantDetails?RestaurantId=${restaurantID}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setRestaurant(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching restaurant details:', err);
      setError('❌ Failed to load restaurant details.');
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `https://localhost:7251/api/User/GetCategories/${restaurantID}/categories?restaurantId=${restaurantID}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleCategoryClick = async (catID) => {
    if (expandedCategoryID === catID) {
      setExpandedCategoryID(null);
      return;
    }

    setExpandedCategoryID(catID);

    if (!menuByCategory[catID]) {
      try {
        const response = await axios.get(
          `https://localhost:7251/api/User/GetRestaurantMenu/${restaurantID}/menu`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );

        const filteredItems = response.data.items.filter(
          (item) => item.categoryID === catID
        );

        setMenuByCategory((prev) => ({
          ...prev,
          [catID]: filteredItems,
        }));
      } catch (error) {
        console.error('Error fetching menu items:', error);
        setError('❌ Failed to load menu items.');
      }
    }
  };

  const toggleCategories = () => {
    setShowCategories(!showCategories);
    if (!showCategories && categories.length === 0) {
      fetchCategories();
    }
  };

  useEffect(() => {
    if (restaurantID) {
      fetchRestaurantDetails();
    }
  }, [restaurantID]);

  if (loading) return <div className="text-center mt-5 fs-4">Loading restaurant details...</div>;
  if (error) return <div className="text-danger text-center mt-5 fs-4">{error}</div>;

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4 display-5">🏠 {restaurant?.name}</h2>
      <div className="card shadow-lg rounded-4 p-4">
        {restaurant?.imgUrl && (
          <img
            src={`https://localhost:7251/RestImages/${restaurant.imgUrl}`}
            alt={restaurant.name}
            className="img-fluid rounded-4 mb-4 mx-auto d-block"
            style={{ maxHeight: '400px', objectFit: 'cover' }}
          />
        )}

        <div className="mb-3">
          <h4 className="fw-bold">📄 Description:</h4>
          <p className="text-muted fs-5">{restaurant?.description}</p>
        </div>

        <div className="mb-3">
          <h5 className="fw-bold">📍 Location:</h5>
          <p className="text-dark fs-5">{restaurant?.location}</p>
        </div>

        <div className="text-center mt-4 d-flex justify-content-center gap-3 flex-wrap">
          <button className="btn btn-outline-secondary px-4 py-2" onClick={() => navigate(-1)}>
            🔙 Back
          </button>
          <button className="btn btn-primary px-4 py-2" onClick={toggleCategories}>
            {showCategories ? '📂 Hide Categories' : '📂 Show Categories'}
          </button>
          <button
            className="btn btn-outline-primary px-4 py-2"
            onClick={() => window.location.href = `/customer/makeOrder/${restaurant.restaurantID}`}
          >
            🍽️ Make Order
          </button>
        </div>

        {showCategories && (
          <div className="mt-5">
            <h4 className="fw-bold mb-3">🗂️ Categories:</h4>

            <div className="accordion" id="categoryAccordion">
              {categories.map((cat) => {
                const isExpanded = expandedCategoryID === cat.categoryID;
                return (
                  <div className="accordion-item border mb-2 rounded shadow-sm" key={cat.categoryID}>
                    <h2 className="accordion-header">
                      <button
                        className={`accordion-button ${isExpanded ? '' : 'collapsed'} fw-semibold text-dark`}
                        type="button"
                        onClick={() => handleCategoryClick(cat.categoryID)}
                      >
                        🍴 {cat.name}
                      </button>
                    </h2>
                    <div className={`accordion-body-wrapper ${isExpanded ? 'expanded' : ''}`}>
                      <div className="accordion-body">
                        {menuByCategory[cat.categoryID] && menuByCategory[cat.categoryID].length > 0 ? (
                          <ul className="list-group">
                            {menuByCategory[cat.categoryID].map((item) => (
                              <li
                                key={item.menuItemID}
                                className="list-group-item d-flex align-items-center gap-3 p-3 rounded shadow-sm mb-2"
                                style={{ backgroundColor: "#f9f9f9" }}
                              >
                                {item.imgUrl && (
                                  <img
                                    src={`https://localhost:7251/MenuImages/${item.imgUrl}`}
                                    alt={item.name}
                                    className="img-thumbnail"
                                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                  />
                                )}
                                <span className="fw-medium">{item.name} - ${item.price || 'N/A'}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-muted">No menu items available for this category.</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

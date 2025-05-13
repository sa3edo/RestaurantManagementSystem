import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useParams } from 'react-router-dom';
import UpdateMenuModal from './UpdateMenuModal';
import './modal.css'
export default function MenuList() {
  const { restaurantID } = useParams();
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  const getDecodedToken = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      return jwtDecode(token);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  const decodedToken = getDecodedToken();
  const managerId = decodedToken
    ? decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]
    : null;

  const fetchCategoriesAndMenuItems = async () => {
    if (!managerId || !restaurantID) {
      setError('❌ Manager ID or Restaurant ID is missing!');
      setLoading(false);
      return;
    }

    try {
      const categoriesResponse = await axios.get(
        `https://localhost:7251/api/restaurant-manager/GetAllMangerFoodCategoriesAsync?restaurantId=${restaurantID}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setCategories(Array.isArray(categoriesResponse.data.data) ? categoriesResponse.data.data : []);

      const menuResponse = await axios.get(
        `https://localhost:7251/api/restaurant-manager/GetMenuItems?restaurantId=${restaurantID}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setMenuItems(Array.isArray(menuResponse.data.items) ? menuResponse.data.items : []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('❌ Error fetching data!');
      setLoading(false);
    }
  };

  const deleteItem = async (id) => {
    try {
      await axios.delete(
        `https://localhost:7251/api/restaurant-manager/DeleteMenuItem/${id}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      alert("✅ Item deleted successfully!");
      fetchCategoriesAndMenuItems(); // تحديث القائمة بدل الريلود
    } catch (error) {
      console.error("❌ Error deleting item:", error.response?.data || error);
      alert("❌ Failed to delete item!");
    }
  };

  useEffect(() => {
    fetchCategoriesAndMenuItems();
  }, []);

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (error) return <div className="text-danger text-center mt-5">{error}</div>;

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">📋 Menu Items</h2>

      {categories.length === 0 ? (
        <p className="text-muted text-center">No categories available.</p>
      ) : (
        categories.map((category) => (
          <div key={category.categoryID} className="mb-5">
            <h4 className="mb-4 border-bottom pb-2">{category.name}</h4>
            <div className="row">
              {menuItems
                .filter(item => item.categoryID === category.categoryID)
                .map((item) => (
                  <div key={item.menuItemID} className="col-md-4 mb-4">
                    <div className="card h-100 shadow-sm rounded-4">
                      {item.imgUrl && (
                        <img
                          src={`https://localhost:7251/MenuImages/${item.imgUrl}`}
                          alt={item.name}
                          className="card-img-top rounded-top"
                          style={{ height: '200px', objectFit: 'cover' }}
                        />
                      )}
                      <div className="card-body d-flex flex-column">
                        <h5 className="card-title">{item.name}</h5>
                        <p className="card-text text-muted">{item.description}</p>
                        <p className="card-text mb-1"><strong>💲 Price:</strong> ${item.price}</p>
                        <p className="card-text mb-3">
                          <strong>📦 Availability:</strong>{' '}
                          {item.availability ? (
                            <span className="text-success">Available</span>
                          ) : (
                            <span className="text-danger">Not Available</span>
                          )}
                        </p>

                        <div className="mt-auto d-grid gap-2">
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => setSelectedItem({ ...item, restaurantID, categoryID: item.categoryID })}
                          >
                            ✏️ Update
                          </button>
                          <button
                            className="btn btn-danger"
                            onClick={() => deleteItem(item.menuItemID)}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))
      )}

      {selectedItem && (
        <UpdateMenuModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onSuccess={fetchCategoriesAndMenuItems}
        />
      )}
    </div>
  );
}

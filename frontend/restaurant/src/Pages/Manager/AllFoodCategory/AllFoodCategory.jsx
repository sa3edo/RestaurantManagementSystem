import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import UpdateCategoryModal from '../UpdateCategory/UpdateCategoryModal';
export default function AllFoodCategory() {
  const [categories, setCategories] = useState([]);
  const [restaurantName, setRestaurantName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { restaurantID } = useParams();
  const restaurantId = parseInt(restaurantID);

  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `https://localhost:7251/api/restaurant-manager/GetAllMangerFoodCategoriesAsync?restaurantId=${restaurantId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setCategories(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('❌ Error fetching food categories!');
      setLoading(false);
    }
  };

  const deleteCategory = async (id) => {
    try {
      await axios.delete(
        `https://localhost:7251/api/restaurant-manager/DeleteMangerFoodCategory/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      alert('✅ Category deleted successfully!');
      fetchCategories();  // إعادة تحميل البيانات بدون ريفرش
    } catch (error) {
      console.error('❌ Error deleting item:', error.response?.data || error);
      alert('❌ Failed to delete item!');
    }
  };

  const fetchRestaurantName = async () => {
    try {
      const response = await axios.get(
        `https://localhost:7251/api/restaurant-manager/GetRestaurantDetails?RestaurantId=${restaurantId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setRestaurantName(response.data.name);
    } catch (err) {
      console.error('Error fetching restaurant name:', err);
      setRestaurantName('Unknown Restaurant');
    }
  };

  useEffect(() => {
    if (restaurantId) {
      fetchCategories();
      fetchRestaurantName();
    }
  }, [restaurantId]);

  const handleEdit = (categoryID) => {
    setSelectedCategoryId(categoryID);
    setShowModal(true);
  };

  if (loading) return <div className="text-center mt-5">Loading food categories...</div>;
  if (error) return <div className="text-danger text-center mt-5">{error}</div>;

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4 section-title">
        🍽️ Food Categories for <strong>{restaurantName}</strong>
      </h2>

      {categories.length === 0 ? (
        <p className="text-center text-muted">No categories found.</p>
      ) : (
        <div className="row">
          {categories.map((category) => (
            <div key={category.id} className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
              <div className="card h-100 shadow rounded-4">
                <div className="card-body d-flex flex-column justify-content-between">
                  <h5 className="card-title text-center fw-bold">{category.name}</h5>

                  <div className="d-grid gap-2 mt-4">
                    <button
                      className="btn btn-outline-primary"
                      onClick={() =>
                        window.location.href = `/manager/addMenuItem/${restaurantId}/${category.categoryID}`
                      }
                    >
                      ➕ Add Menu Item
                    </button>

                    <button
                      className="btn btn-warning"
                      onClick={() => handleEdit(category.categoryID)}
                    >
                      ✏️ Edit Name
                    </button>

                    <button
                      className="btn btn-danger"
                      onClick={() => deleteCategory(category.categoryID)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <UpdateCategoryModal
          show={showModal}
          handleClose={() => setShowModal(false)}
          categoryID={selectedCategoryId}
          restaurantID={restaurantId}
          onUpdated={fetchCategories}
        />
      )}
    </div>
  );
}

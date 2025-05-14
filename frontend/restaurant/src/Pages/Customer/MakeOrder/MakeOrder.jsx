import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function MakeOrder() {
  const { restaurantID } = useParams();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState(null);
  const [categories, setCategories] = useState([]);
  const [menuByCategory, setMenuByCategory] = useState({});
  const [expandedCategoryID, setExpandedCategoryID] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (restaurantID) {
      fetchRestaurantDetails();
      fetchCategories();
    }
  }, [restaurantID]);

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

  const handleAddToOrder = (item) => {
    const existingItem = orderItems.find((i) => i.menuItemId === item.menuItemID);
    if (existingItem) {
      setOrderItems((prev) =>
        prev.map((i) =>
          i.menuItemId === item.menuItemID
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      );
    } else {
      setOrderItems((prev) => [
        ...prev,
        { menuItemId: item.menuItemID, quantity: 1 },
      ]);
    }
  };

  const handleCreateOrder = async () => {
    const confirmed = await Swal.fire({
      title: 'Are you sure?',
      text: "You’re about to submit your order!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Cash',
    });

    if (!confirmed.isConfirmed) return;

    try {
      const response = await axios.post(
        'https://localhost:7251/api/User/CreateOrder',
        {
          restaurantId: restaurantID,
          items: orderItems,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      console.log('Order Created:', response.data);

      await Swal.fire({
        icon: 'success',
        title: 'Order Created!',
        text: '✅ Your order has been placed successfully.',
        confirmButtonColor: '#28a745',
      });

      navigate(-1);
    } catch (error) {
      console.error('Error creating order:', error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: '❌ Failed to create order. Please try again.',
        confirmButtonColor: '#dc3545',
      });
    }
  };

  if (loading) return <div className="text-center mt-5 fs-4">Loading...</div>;
  if (error) return <div className="text-danger text-center mt-5 fs-4">{error}</div>;

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4 display-5">
        <i className="fas fa-utensils me-2"></i> Make Order for {restaurant?.name}
      </h2>

      <div className="accordion" id="categoryAccordion" data-aos="zoom-in-down">
        {categories.map((cat) => {
          const isExpanded = expandedCategoryID === cat.categoryID;
          return (
            <div className="accordion-item border mb-2 rounded shadow-sm" key={cat.categoryID}>
              <h2 className="accordion-header">
                <button
                  className={`accordion-button ${isExpanded ? '' : 'collapsed'}`}
                  type="button"
                  onClick={() => handleCategoryClick(cat.categoryID)}
                >
                  {cat.name}
                </button>
              </h2>
              <div className={`accordion-body-wrapper ${isExpanded ? 'expanded' : ''}`}>
                <div className="accordion-body">
                  {menuByCategory[cat.categoryID] && menuByCategory[cat.categoryID].length > 0 ? (
                    <ul className="list-group">
                      {menuByCategory[cat.categoryID].map((item) => (
                        <li key={item.menuItemID} className="list-group-item d-flex justify-content-between align-items-center">
                          <div>
                            <strong>{item.name}</strong> - ${item.price || 'N/A'}
                          </div>
                          <button
                            className="btn btn-sm btn-outline-success"
                            onClick={() => handleAddToOrder(item)}
                          >
                            <i className="fas fa-plus"></i> Add
                          </button>
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

      {orderItems.length > 0 && (
        <div className="mt-5">
          <h4><i className="fas fa-shopping-cart me-2"></i> Order Summary</h4>
          <ul className="list-group mb-3">
            {orderItems.map((item) => {
              const menuItem = Object.values(menuByCategory)
                .flat()
                .find((i) => i.menuItemID === item.menuItemId);
              return (
                <li
                  className="list-group-item d-flex justify-content-between align-items-center"
                  key={item.menuItemId}
                >
                  <div>
                    <strong>{menuItem?.name}</strong> - ${menuItem?.price || 0}
                    <br />
                    Quantity:
                    <button
                      className="btn btn-sm btn-outline-secondary mx-1"
                      onClick={() => {
                        setOrderItems((prev) =>
                          prev.map((i) =>
                            i.menuItemId === item.menuItemId && i.quantity > 1
                              ? { ...i, quantity: i.quantity - 1 }
                              : i
                          )
                        );
                      }}
                    >
                      <i className="fas fa-minus"></i>
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      className="btn btn-sm btn-outline-secondary mx-1"
                      onClick={() => {
                        setOrderItems((prev) =>
                          prev.map((i) =>
                            i.menuItemId === item.menuItemId
                              ? { ...i, quantity: i.quantity + 1 }
                              : i
                          )
                        );
                      }}
                    >
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <span className="text-success">
                      ${((menuItem?.price || 0) * item.quantity).toFixed(2)}
                    </span>
                    <button
                      className="btn btn-sm btn-danger ms-2"
                      onClick={() =>
                        setOrderItems((prev) =>
                          prev.filter((i) => i.menuItemId !== item.menuItemId)
                        )
                      }
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="text-end mb-3">
            <h4>
              Total: $
              {orderItems
                .reduce((sum, item) => {
                  const menuItem = Object.values(menuByCategory)
                    .flat()
                    .find((i) => i.menuItemID === item.menuItemId);
                  return sum + (menuItem?.price || 0) * item.quantity;
                }, 0)
                .toFixed(2)}
            </h4>
          </div>

          <button className="btn btn-success px-4 py-2" onClick={handleCreateOrder}>
            <i className="fas fa-check me-2"></i> Submit Order
          </button>
        </div>
      )}
    </div>
  );
}

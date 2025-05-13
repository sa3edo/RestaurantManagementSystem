import React, {useState} from 'react'
import axios from 'axios';
import Swal from 'sweetalert2';
import { jwtDecode } from 'jwt-decode';
export default function RestaurantRequests() {
    const [restaurantId, setRestaurantId] = useState('');

    const handleApprove = async () => {
                      const decoded = jwtDecode(localStorage.getItem('token'));
                      console.log('Role:', decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]);
      if (!restaurantId) {
        Swal.fire({
          icon: 'warning',
          title: 'Please enter a valid Restaurant ID!',
        });
        return;
      }
  
      try {
        const token = localStorage.getItem('token');  // توكن من اللوجين
  
        const response = await axios.put(
          `https://localhost:7251/api/admin/restaurants/${restaurantId}/approve`,
          null,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            }
          }
        );
  
        Swal.fire({
          icon: 'success',
          title: 'Restaurant Approved Successfully!',
          text: `Restaurant ID ${restaurantId} is now approved.`,
        });
  
        setRestaurantId('');  // تنظيف بعد الموافقة
  
      } catch (error) {
        console.error(error);
        Swal.fire({
          icon: 'error',
          title: 'Failed to Approve!',
          text: error.response?.data?.message || 'Something went wrong, please check the server.',
        });
      }
    };
  
    return (
      <div className="container mt-5" style={{ maxWidth: '400px' }}>
        <h2>Approve Restaurant 🏅</h2>
        <div className="mb-3">
          <label htmlFor="restaurantId" className="form-label">Restaurant ID:</label>
          <input
            type="text"
            id="restaurantId"
            className="form-control"
            value={restaurantId}
            onChange={(e) => setRestaurantId(e.target.value)}
            placeholder="Enter Restaurant ID"
            required
          />
        </div>
        <button className="btn btn-success w-100" onClick={handleApprove}>
          Approve Restaurant
        </button>
      </div>
    );
  }
  
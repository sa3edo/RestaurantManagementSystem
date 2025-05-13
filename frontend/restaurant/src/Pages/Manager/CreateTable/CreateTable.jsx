import React, { useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

export default function CreateTable() {
  const { restaurantID } = useParams();
  const [seats, setSeats] = useState(0);
  const [isAvailable, setIsAvailable] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const restaurantId = parseInt(restaurantID);

  const handleCreateTable = async (e) => {
    e.preventDefault();

    try {
      const tableData = {
        tableId: 0, // 
        seats,
        isAvailable,
        restaurantId,
      };

      const response = await axios.post(
        `https://localhost:7251/api/restaurant-manager/CreateTable?restaurantId=${restaurantId}`,
        tableData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setSuccess('✅ Table created successfully!');
      setError('');
      console.log('Table created:', response.data);
    } catch (err) {
      console.error('❌ Error creating table:', err.response?.data || err.message);
      setError('❌ Failed to create table.');
      setSuccess('');
    }
  };

  return (
    <div className="container mt-4">
      <h3>Create Table 🪑</h3>
      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleCreateTable}>
        <div className="mb-3">
          <label htmlFor="seats" className="form-label">Seats</label>
          <input
            type="number"
            className="form-control"
            id="seats"
            value={seats}
            onChange={(e) => setSeats(e.target.value)}
            required
            min="1"
          />
        </div>
        <div className="mb-3">
          <label htmlFor="isAvailable" className="form-label">Available</label>
          <select
            className="form-control"
            id="isAvailable"
            value={isAvailable}
            onChange={(e) => setIsAvailable(e.target.value === 'true')}
            required
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
        <button type="submit" className="btn btn-success">Create Table</button>
      </form>
    </div>
  );
}

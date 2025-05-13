import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

export default function AllTables() {
  const { restaurantID } = useParams();
  const restaurantId = parseInt(restaurantID);

  const [tables, setTables] = useState([]);
  const [restaurantName, setRestaurantName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentTable, setCurrentTable] = useState(null);

  const fetchTables = async () => {
    try {
      const response = await axios.get(
        `https://localhost:7251/api/restaurant-manager/GetTables?restaurantId=${restaurantId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setTables(Array.isArray(response.data) ? response.data : []);
      setLoading(false);
    } catch (err) {
      console.error('❌ Error fetching tables:', err);
      setError('❌ Failed to fetch tables.');
      setLoading(false);
    }
  };

  const fetchRestaurantName = async () => {
    try {
      const response = await axios.get(
        `https://localhost:7251/api/restaurant-manager/GetRestaurantDetails?RestaurantId=${restaurantId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setRestaurantName(response.data.name);
    } catch (err) {
      console.error('❌ Error fetching restaurant name:', err);
      setRestaurantName('Unknown Restaurant');
    }
  };

  const deleteTable = async (tableId) => {
    if (!window.confirm(`Are you sure you want to delete Table #${tableId}?`)) return;
    try {
      await axios.delete(
        `https://localhost:7251/api/restaurant-manager/DeleteTable/${tableId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      alert('✅ Table deleted successfully!');
      fetchTables();
    } catch (err) {
      console.error('❌ Error deleting table:', err);
      alert('❌ Failed to delete table.');
    }
  };

  const handleEditClick = (table) => {
    setCurrentTable({ ...table });
    setShowModal(true);
  };

  const handleModalChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentTable((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const updateTable = async () => {
    try {
      await axios.put(
        `https://localhost:7251/api/restaurant-manager/UpdateTable/${currentTable.tableId}`,
        currentTable,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      alert('✅ Table updated successfully!');
      setShowModal(false);
      fetchTables();
    } catch (err) {
      console.error('❌ Error updating table:', err);
      alert('❌ Failed to update table.');
    }
  };

  useEffect(() => {
    if (restaurantId) {
      fetchRestaurantName();
      fetchTables();
    }
  }, [restaurantId]);

  if (loading) return <p className="text-center mt-5">Loading tables...</p>;
  if (error) return <p className="text-danger text-center mt-5">{error}</p>;

  return (
    <div className="container mt-5">
      <h3 className="mb-4 text-center">🪑 Tables for <span className="text-primary">{restaurantName}</span></h3>

      {tables.length === 0 ? (
        <p className="text-center text-muted">No tables available.</p>
      ) : (
        <div className="row">
          {tables.map((table) => (
            <div key={table.tableId} className="col-md-4 mb-4">
              <div className="card shadow-sm h-100 rounded-4">
                <div className="card-body text-center">
                  <h5 className="card-title">Table #{table.tableId}</h5>
                  <p>Seats: <strong>{table.seats}</strong></p>
                  <p>Status: {table.isAvailable ? '✅ Available' : '❌ Unavailable'}</p>
                  <button className="btn btn-primary w-100 mb-2" onClick={() => handleEditClick(table)}>
                    ✏️ Edit Table
                  </button>
                  <button className="btn btn-danger w-100" onClick={() => deleteTable(table.tableId)}>
                    🗑️ Delete Table
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-center mt-4">
        <button
          className="btn btn-success px-4"
          onClick={() => window.location.href = `/manager/createTable/${restaurantId}`}
        >
          ➕ Add Table
        </button>
      </div>

      {showModal && currentTable && (
        <div className="modal d-block bg-dark bg-opacity-50">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 shadow">
              <div className="modal-header">
                <h5 className="modal-title">Edit Table #{currentTable.tableId}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Seats:</label>
                  <input
                    type="number"
                    name="seats"
                    className="form-control"
                    value={currentTable.seats}
                    onChange={handleModalChange}
                  />
                </div>
                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="isAvailable"
                    checked={currentTable.isAvailable}
                    onChange={handleModalChange}
                    id="isAvailableCheck"
                  />
                  <label className="form-check-label" htmlFor="isAvailableCheck">
                    Available
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={updateTable}>💾 Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

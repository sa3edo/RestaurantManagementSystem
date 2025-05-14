import React, { useState, useEffect } from 'react';
import Navbar from './components/navbar/Navbar';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import AppRoutes from './Routes/AppRoutes';
import Home from './Pages/Customer/home/Home';
import ProtectedRoute from './components/ProtectedRoute';
import { jwtDecode } from 'jwt-decode';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(null);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setRole(decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]);
      } catch (error) {
        console.error("Invalid token");
      }
    } else {
      setRole(null);
    }
  }, [token]);
useEffect(() => {
  const updateToken = () => setToken(localStorage.getItem("token"));
  window.addEventListener("storage", updateToken);
  return () => window.removeEventListener("storage", updateToken);
}, []);

  return (
    <Router>
      {token && <Navbar />}
      <Routes>
        <Route
          path="/home"
          element={
            <ProtectedRoute allowedRoles={["Customer"]}>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/*"
          element={
            <div className="container content">
              <AppRoutes setToken={setToken} />
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

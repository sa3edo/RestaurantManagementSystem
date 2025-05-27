import React, { useState, useEffect } from "react";
import Navbar from "./components/navbar/Navbar";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import AppRoutes from "./Routes/AppRoutes";
import Home from "./Pages/Customer/home/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";
import "./App.css"; // هنضيف كلاس الأنيميشن هنا

function AppWrapper() {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role, setRole] = useState(null);

  const onLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setRole(null);
  };

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, logout",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        onLogout();
        navigate("/login");
        Swal.fire("Logged out!", "You have been logged out.", "success");
      }
    });
  };

  const handleChangePassword = () => {
    navigate("/changePassword");
  };

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setRole(
          decoded[
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
          ]
        );
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
    <>
      {token && <Navbar onLogout={onLogout} />}

      {token && (
        <div className="dropdown" style={{ position: "sticky", top: "15%", left : 0 , width :"fit-content" ,zIndex: 55 }}>
          <button
            className="btn btn-light dropdown-toggle"
            type="button"
            id="dropdownMenuButton"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            style={{ fontSize: "24px" }}
          >
            <i className="fa-solid fa-gear spinning-icon"></i>
          </button>
          <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton">
            <li>
              <button className="dropdown-item" onClick={handleChangePassword}>
                Change Password
              </button>
            </li>
            <li>
              <button className="dropdown-item" onClick={handleLogout}>
                Logout
              </button>
            </li>
          </ul>
        </div>
      )}

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
    </>
  );
}

function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;

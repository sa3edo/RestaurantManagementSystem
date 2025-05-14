import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useEffect, useState } from 'react';
import '../../App.css'
import AOS from 'aos';
import { Link } from 'react-router-dom';

import 'aos/dist/aos.css';
export default function Navbar() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true
    });
  }, []);
  const handleLogout = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will be logged out!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, logout',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('token');
        navigate('/login');
        Swal.fire('Logged out!', 'You have been logged out.', 'success');
      }
    });
  };

  const handleChangePassword = () => {
    navigate('/changePassword');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    navigate(`/search?term=${encodeURIComponent(searchTerm.trim())}`);
    setSearchTerm('');
  };

  return (
    <nav className="navbar px-4 py-3 position-fixed start-0 end-0 top-0 z-3" >
      <div className="container d-flex align-items-center justify-content-between">
        <Link to="/home" className="navbar-brand">Cravy </Link>


        <form className="d-flex me-auto ms-4 .navbar-search" onSubmit={handleSearch}>
          <input
            className="form-control me-2"
            type="search"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="navbar-search" type="submit">
            Search
          </button>
        </form>

        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary" onClick={handleChangePassword}>
            Change Password
          </button>
          <button className="btn btn-danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

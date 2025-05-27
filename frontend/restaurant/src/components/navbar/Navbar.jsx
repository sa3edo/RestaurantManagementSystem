import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import '../../App.css';
import AOS from 'aos';
import { Link } from 'react-router-dom';

import 'aos/dist/aos.css';

export default function Navbar() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    navigate(`/search?term=${encodeURIComponent(searchTerm.trim())}`);
    setSearchTerm('');
  };

  return (
    <nav className="navbar px-4 py-3 position-fixed start-0 end-0 top-0 z-3 bg-white shadow-sm">
      <div className="container d-flex align-items-center justify-content-between">
        <Link to="/home" className="navbar-brand fw-bold fs-4 y">NumNum</Link>

        <form className="d-flex me-auto ms-4" onSubmit={handleSearch}>
          <input
            className="form-control me-2"
            type="search"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="btn navbar-search" type="submit">
            Search
          </button>
        </form>

        <ul className="nav gap-3">
          <li className="nav-item">
            <a className="nav-link" href="#about">About</a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="#features">Features</a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="#goPage">Explore</a>
          </li>
        </ul>
      </div>
    </nav>
  );
}

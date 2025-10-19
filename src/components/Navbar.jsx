import React, { useState, useEffect, useContext } from 'react';
import { FaBars, FaTimes, FaMoon, FaSun } from 'react-icons/fa';
import { ThemeContext } from '../App';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [nav, setNav] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (el) {
      // small offset to account for fixed navbar height
      const y = el.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const goAndScroll = (id) => {
    setNav(false);
    if (location.pathname !== '/') {
      // navigate to home first, then scroll after a short delay
      navigate('/');
      // delay gives React time to render the home sections
      setTimeout(() => scrollToId(id), 150);
    } else {
      scrollToId(id);
    }
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''} ${darkMode ? 'dark-mode' : ''}`}>
      {/* BRAND: visually plain text but routes to "/" on click */}
      <div
        className="navbar-brand"
        role="button"
        tabIndex={0}
        onClick={() => { setNav(false); navigate('/'); }}
        onKeyPress={(e) => { if (e.key === 'Enter') { setNav(false); navigate('/'); } }}
        style={{ cursor: 'pointer' }}
      >
        CytoVision AI
      </div>

      <ul className={`menu ${nav ? 'active' : ''}`}>
        {/* HOME -> route to root (/) */}
        <li>
          <RouterLink to="/" onClick={() => setNav(false)}>Home</RouterLink>
        </li>

        {/* In-page scroll links */}
        <li>
          <button type="button" className="nav-link" onClick={() => goAndScroll('project')}>Project</button>
        </li>
        {/* <li>
          <ScrollLink to="methodology" smooth={true} duration={500} onClick={() => setNav(false)}>Methodology</ScrollLink>
        </li> */}
        <li>
          <button type="button" className="nav-link" onClick={() => goAndScroll('manual')}>User Manual</button>
        </li>
        <li>
          {/* About Us scrolls to the team section */}
          <button type="button" className="nav-link" onClick={() => goAndScroll('team')}>About Us</button>
        </li>
      </ul>

      <div className="right-section">
        <RouterLink to="/demo" className="btn nav-try btn-primary" onClick={() => setNav(false)}>
          Try Now
        </RouterLink>

        <button className="theme-toggle" onClick={toggleTheme}>
          {darkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
        </button>

        <div className="hamburger" onClick={() => setNav(!nav)}>
          {nav ? <FaTimes /> : <FaBars />}
        </div>
      </div>

      {nav && (
        <ul className="mobile-menu">
          <li>
            <RouterLink to="/" onClick={() => setNav(false)}>Home</RouterLink>
          </li>
          <li>
            <button type="button" className="nav-link" onClick={() => goAndScroll('project')}>Project</button>
          </li>
          <li>
            <button type="button" className="nav-link" onClick={() => goAndScroll('manual')}>User Manual</button>
          </li>
          <li>
            <button type="button" className="nav-link" onClick={() => goAndScroll('team')}>About Us</button>
          </li>
        </ul>
      )}
    </nav>
  );
};

export default Navbar;

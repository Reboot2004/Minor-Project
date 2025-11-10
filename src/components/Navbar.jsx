import React, { useState, useEffect, useContext } from 'react';
import { FaBars, FaTimes, FaMoon, FaSun, FaGithub } from 'react-icons/fa';
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

  // Scroll-to helpers
  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (el) {
      // small offset to account for fixed navbar height
      const y = el.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const goHome = () => {
    setNav(false);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 150);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goAndScroll = (id) => {
    setNav(false);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => scrollToId(id), 150);
    } else {
      scrollToId(id);
    }
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''} ${darkMode ? 'dark-mode' : ''}`}>
      <div
        className="navbar-brand"
        role="button"
        tabIndex={0}
        onClick={goHome}
        onKeyPress={(e) => { if (e.key === 'Enter') goHome(); }}
        style={{ cursor: 'pointer' }}
      >
        CytoVision AI
      </div>

      <ul className={`menu ${nav ? 'active' : ''}`}>
        <li>
          <RouterLink to="/" onClick={goHome}>Home</RouterLink>
        </li>
        {/* In-page scroll links */}
        <li>
          <button type="button" className="nav-link" onClick={() => goAndScroll('project')}>Project</button>
        </li>
        <li>
          <button type="button" className="nav-link" onClick={() => goAndScroll('manual')}>User Manual</button>
        </li>
        <li>
          <button type="button" className="nav-link" onClick={() => goAndScroll('team')}>About Us</button>
        </li>
        <li>
          <RouterLink to="/results" onClick={() => setNav(false)}>Results</RouterLink>
        </li>
      </ul>

      <div className="right-section">
        <RouterLink to="/demo" className="btn nav-try" onClick={() => setNav(false)}>
          Try Now
        </RouterLink>

        {/* theme toggle group */}
        <div className="theme-toggle-group" role="group" aria-label="Theme toggle">
          <FaSun className="theme-sun" size={16} aria-hidden />
          <button
            type="button"
            className={`theme-switch ${darkMode ? 'active' : ''}`}
            onClick={toggleTheme}
            aria-pressed={darkMode}
            aria-label="Toggle dark mode"
          >
            <span className="knob" />
          </button>
          <FaMoon className="theme-moon" size={16} aria-hidden />
        </div>

        {/* GitHub link */}
        <a
          href="https://github.com/Reboot2004/Minor-Project"
          target="_blank"
          rel="noreferrer"
          className="nav-github"
          aria-label="Open GitHub repository"
        >
          <FaGithub size={18} />
        </a>

        <div className="hamburger" onClick={() => setNav(!nav)}>
          {nav ? <FaTimes /> : <FaBars />}
        </div>
      </div>

      {nav && (
        <ul className="mobile-menu">
          <li>
            <RouterLink to="/" onClick={goHome}>Home</RouterLink>
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
          <li>
            <RouterLink to="/results" onClick={() => setNav(false)}>Results</RouterLink>
          </li>
        </ul>
      )}
    </nav>
  );
};

export default Navbar;

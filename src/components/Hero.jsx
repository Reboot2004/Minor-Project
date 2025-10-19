import React, { useContext } from 'react';
import './Hero.css';
import { Link as RouterLink } from 'react-router-dom';
import { ThemeContext } from '../App';

const Hero = () => {
  const { darkMode } = useContext(ThemeContext);

  return (
    <section id="home" className={`hero ${darkMode ? 'dark' : 'light'}`}>
      <div className="hero-content">
        <h1 className="hero-title">
          <span>
            <span className="highlight">Empowering</span> Early Detection:
          </span>
          <br />
          <span>Cervical Cancer Classification</span>
        </h1>

        <p className="hero-subtitle">
          Detect cervical cancer accurately and quickly using explainable AI models.
        </p>
        <div className="hero-buttons">
          <RouterLink to="/demo" className="btn btn-primary">
            Try Now
          </RouterLink>
          <RouterLink to="/" className="btn btn-secondary" onClick={() => {
            // scroll to manual after navigating to home if already on home
            const el = document.getElementById('manual');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}>
            User Manual
          </RouterLink>
        </div>
      </div>
    </section>
  );
};

export default Hero;

import React, { useContext, useRef, useEffect } from 'react';
import './Hero.css';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom'; // added navigate/location
import { ThemeContext } from '../App';

const Hero = () => {
  const { darkMode } = useContext(ThemeContext);
  // clamp subtitle to title width
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);

  // added: router helpers
  const navigate = useNavigate();
  const location = useLocation();

  // smooth scroll with fixed-navbar offset
  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const root = getComputedStyle(document.documentElement);
    const navH = parseInt(root.getPropertyValue('--navbar-height')) || 72;
    const y = el.getBoundingClientRect().top + window.scrollY - (navH + 12);
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  // go to home if needed, then scroll to #manual
  const goManual = () => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => scrollToId('manual'), 180); // allow render after route change
    } else {
      scrollToId('manual');
    }
  };

  useEffect(() => {
    const clamp = () => {
      if (!titleRef.current || !subtitleRef.current) return;
      const w = Math.ceil(titleRef.current.getBoundingClientRect().width);
      subtitleRef.current.style.maxWidth = `${w}px`;
      subtitleRef.current.style.margin = '1.2rem auto 1.8rem'; // was 0.6rem — increases gap
    };
    clamp();
    const onResize = () => requestAnimationFrame(clamp);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <section id="home" className={`hero ${darkMode ? 'dark' : 'light'}`}>
      <div className="hero-content">
        <div className="hero-body">
          <p className="hero-eyebrow">Welcome to</p>
          <div className="hero-title-wrap">
            <h1 className="hero-title hero-title-large" ref={titleRef}>
              <span className="hero-word">CytoVision AI</span>
            </h1>
          </div>
          <p className="hero-subtitle" ref={subtitleRef}>
            A platform that empowers early cervical cancer detection 
            <br />
            through the precision of artificial intelligence.
          </p>
        </div>

        <div className="hero-buttons">
          <RouterLink to="/demo" className="btn btn-primary">
            Try Now
          </RouterLink>
          {/* changed: button to ensure offset-aware in-page scroll */}
          <button type="button" className="btn btn-secondary" onClick={goManual}>
            User Manual
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;

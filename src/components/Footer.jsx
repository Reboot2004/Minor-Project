import React from "react";
import { Github } from "lucide-react";
import "./Footer.css";
import { useNavigate, useLocation } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // offset-aware scroll (accounts for fixed navbar)
  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const root = getComputedStyle(document.documentElement);
    const navH = parseInt(root.getPropertyValue("--navbar-height")) || 72;
    const y = el.getBoundingClientRect().top + window.scrollY - (navH + 12);
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  const goHome = (e) => {
    e.preventDefault();
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 150);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goAndScroll = (e, id) => {
    e.preventDefault();
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => scrollToId(id), 150);
    } else {
      scrollToId(id);
    }
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Left: Brand */}
        <div className="footer-brand">
          <h3>Cyto Vision AI</h3>
          <p>AI-powered insights for cervical cytology analysis</p>
        </div>

        {/* Center: Navigation (same options as navbar) */}
        <div className="footer-links">
          <a href="/" onClick={goHome}>Home</a>
          <a href="#project" onClick={(e) => goAndScroll(e, "project")}>Project</a>
          <a href="#manual" onClick={(e) => goAndScroll(e, "manual")}>User Manual</a>
          <a href="#team" onClick={(e) => goAndScroll(e, "team")}>About Us</a>
        </div>

        {/* Right: GitHub */}
        <div className="footer-socials">
          <a
            href="https://github.com/Reboot2004/Minor-Project"
            target="_blank"
            rel="noreferrer"
            className="footer-icon"
          >
            <Github size={22} />
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Cyto Vision AI. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;

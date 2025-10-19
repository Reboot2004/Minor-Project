import React from "react";
import { Github } from "lucide-react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Left: Brand */}
        <div className="footer-brand">
          <h3>Cyto Vision AI</h3>
          <p>AI-powered insights for cervical cytology analysis</p>
        </div>

        {/* Center: Navigation */}
        <div className="footer-links">
          <a href="#about">About</a>
          <a href="#project">Project</a>
          <a href="#contact">Contact</a>
        </div>

        {/* Right: GitHub */}
        <div className="footer-socials">
          <a
            href="https://github.com/RisingPhoenix2004/IOMP.git" 
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

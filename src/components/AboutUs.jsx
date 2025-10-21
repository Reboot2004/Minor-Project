import React from "react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import "./AboutUs.css";

const team = [
  {
    name: "K N S Sri Harshith",
    role: "Developer",
    github: "https://github.com/Reboot2004",
    linkedin: "https://www.linkedin.com/in/reboot2004/",
  },
  {
    name: "MahaReddy Jeevan Reddy",
    role: "Developer",
    github: "https://github.com/jeevanreddym9",
    linkedin: "https://www.linkedin.com/in/jeevan-reddy-525ab7350/",
  },
  {
    name: "Alakanti Surya",
    role: "Developer",
    github: "https://github.com/RisingPhoenix2004",
    linkedin: "https://www.linkedin.com/in/suryaalakanti/",
  },
];

const AboutUs = () => {
  return (
    <section
      id="team"
      className="about-us"
      style={{ marginTop: "clamp(10rem, 8vw, 10rem)" }}
    >
      <h2 className="about-title manual-title">Meet Our Team</h2>
      <p className="about-subtitle">
        We are a group of passionate developers and researchers working together
        on this project.
      </p>

      {/* Team grid */}
      <div className="team-grid">
        {team.map((member, idx) => (
          <div key={idx} className="team-card">
            <h3 className="manual-title">{member.name}</h3>
            <p className="role">{member.role}</p>
            <div className="socials">
              <a
                href={member.github}
                target="_blank"
                rel="noreferrer"
                className="icon-link"
              >
                <FaGithub />
              </a>
              <a
                href={member.linkedin}
                target="_blank"
                rel="noreferrer"
                className="icon-link"
              >
                <FaLinkedin />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Contribution + Reference */}
      <div className="contribution">
        <h3 className="manual-title">Our Contributions</h3>
        <p>
          Together, we collaborated on design, implementation, and research to
          make this project possible. Each member played a crucial role, from
          building core features to conducting experiments and writing detailed
          documentation.
        </p>
        </div>
    </section>
  );
};

export default AboutUs;

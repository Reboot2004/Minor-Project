import React, { createContext, useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Project from "./components/Project";
import UserManual from "./components/UserManual";
import AboutUs from "./components/AboutUs";
import Demo from "./components/Demo"; // new route component
import "./App.css";
import Footer from "./components/Footer";

export const ThemeContext = createContext();

const HomePage = () => (
  <>
    <Hero />
    <Project />
    <UserManual />
    <AboutUs />
    <Footer />
  </>
);

const App = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark-mode");
    }
  }, []);

  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
    if (!darkMode) {
      document.documentElement.classList.add("dark-mode");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark-mode");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      <Router>
        <div className={`app ${darkMode ? "dark" : "light"}`}>
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/demo" element={<Demo />} />
          </Routes>
        </div>
      </Router>
    </ThemeContext.Provider>
  );
};

export default App;
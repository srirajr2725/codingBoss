import React, { useEffect, useState } from "react";
import "./Preloader.css"; 
import bossImage from "../src/images/boss.png";

const Preloader = () => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`preloader ${fadeOut ? "fade-out" : ""}`}>
      <div className="preloader-content">
        <img src={bossImage} alt="CodingBoss" className="boss-image" />
        <div className="loading-bar"></div>
        <span className="loading-text">Initializing Dashboard</span>
      </div>
    </div>
  );
};

export default Preloader;

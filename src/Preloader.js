import React, { useEffect, useState } from "react";
import "./Preloader.css"; 
import bossImage from "../src/images/boss.png";
import codingImage from "../src/images/coding.png";

const Preloader = () => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setFadeOut(true);
    }, 2000);
  }, []);

  return (
    <div className={`preloader ${fadeOut ? "fade-out" : ""}`}>
      <div className="preloader-content">
        <img src={codingImage} alt="Coding Boss" className="coding-image" />
        <img src={bossImage} alt="Loading..." className="boss-image" />
      </div>
    </div>
  );
};

export default Preloader;

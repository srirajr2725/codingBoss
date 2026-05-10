import React, { useEffect, useRef, useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaArrowRight } from 'react-icons/fa';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './courses.css';
import dsa from "./images/dsa.png";
import python from "./images/python.png";
import Java from "./images/Java.png";
import cProg from "./images/c_program.png";
import webDev from "./images/web.png";
import machineLearning from "./images/machine.png";
import cyberSecurity from "./images/cybersec.png";

const Frontcourse = ({ isLoggedIn }) => {
  const [isVisible, setIsVisible] = useState(false);
  const carouselRef = useRef();
  const cardsContainerRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (carouselRef.current) {
      observer.observe(carouselRef.current);
    }

    return () => {
      if (carouselRef.current) {
        observer.unobserve(carouselRef.current);
      }
    };
  }, []);

  const scrollLeft = () => {
    if (cardsContainerRef.current) {
      cardsContainerRef.current.scrollBy({ left: -340, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (cardsContainerRef.current) {
      cardsContainerRef.current.scrollBy({ left: 340, behavior: 'smooth' });
    }
  };

  const navigateToCourses = () => {
    if (isLoggedIn) {
      navigate('/courses');
    } else {
      navigate('/LoginPage');
    }
  };

  return (
    <div className={`carousel-container ${isVisible ? 'visible' : ''}`} ref={carouselRef}>
      <button className="carousel-nav prev" onClick={scrollLeft}>
        <FaChevronLeft />
      </button>
      
      <div className="carousel-content">
        <h2 className="carousel-title">Courses Offered</h2>
        <p className="carousel-description">
          Explore the latest courses and master your skills today.
        </p>
        
        <div className="carousel-cards" ref={cardsContainerRef}>
          {/* Java Programming Card */}
          <div className="card">
            <img src={Java} alt="Java Programming" className="carousel-image" />
            <h3 className="product-name">Java Programming</h3>
            <Button className="details-btn" onClick={navigateToCourses}>
              <FaArrowRight />
            </Button>
          </div>

          {/* Python Programming Card */}
          <div className="card">
            <img src={python} alt="Python Essentials" className="carousel-image" />
            <h3 className="product-name">Python Essentials</h3>
            <Button className="details-btn" onClick={navigateToCourses}>
              <FaArrowRight />
            </Button>
          </div>

          {/* Data Structures & Algorithms Card */}
          <div className="card">
            <img src={dsa} alt="Data Structures and Algorithms" className="carousel-image" />
            <h3 className="product-name">Data Structures & Algo</h3>
            <Button className="details-btn" onClick={navigateToCourses}>
              <FaArrowRight />
            </Button>
          </div>

          {/* C Programming Card */}
          <div className="card">
            <img src={cProg} alt="C Programming" className="carousel-image" />
            <h3 className="product-name">C Programming</h3>
            <Button className="details-btn" onClick={navigateToCourses}>
              <FaArrowRight />
            </Button>
          </div>

          {/* Web Development Card */}
          <div className="card">
            <img src={webDev} alt="Web Development" className="carousel-image" />
            <h3 className="product-name">Web Development</h3>
            <Button className="details-btn" onClick={navigateToCourses}>
              <FaArrowRight />
            </Button>
          </div>

          {/* Machine Learning Card */}
          <div className="card">
            <img src={machineLearning} alt="Machine Learning" className="carousel-image" />
            <h3 className="product-name">Machine Learning</h3>
            <Button className="details-btn" onClick={navigateToCourses}>
              <FaArrowRight />
            </Button>
          </div>

          {/* Cyber Security Card */}
          <div className="card">
            <img src={cyberSecurity} alt="Cyber Security" className="carousel-image" />
            <h3 className="product-name">Cyber Security</h3>
            <Button className="details-btn" onClick={navigateToCourses}>
              <FaArrowRight />
            </Button>
          </div>
        </div>
      </div>

      <button className="carousel-nav next" onClick={scrollRight}>
        <FaChevronRight />
      </button>
    </div>
  );
};

export default Frontcourse;

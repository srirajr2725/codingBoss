// Frontcourse.js
import React, { useEffect, useRef, useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'; // Import icons
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom'; // Use for navigation
import './courses.css';
import dsa from "./images/dsa.png";
import python from "./images/python.png";
import Java from "./images/Java.png";

const Frontcourse = () => {
  const [isVisible, setIsVisible] = useState(false);
  const carouselRef = useRef();
  const cardsContainerRef = useRef(); // Reference for the cards container
  const navigate = useNavigate(); // Use navigate for navigation

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 } // Trigger when 10% of the carousel is visible
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
      cardsContainerRef.current.scrollBy({
        left: -300, // Adjust the scroll distance as needed
        behavior: 'smooth',
      });
    }
  };

  const scrollRight = () => {
    if (cardsContainerRef.current) {
      cardsContainerRef.current.scrollBy({
        left: 300, // Adjust the scroll distance as needed
        behavior: 'smooth',
      });
    }
  };

  const navigateToCourses = () => {
    navigate('/courses'); // Navigate to the Courses page
  };

  return (
    <div className={`carousel-container ${isVisible ? 'visible' : ''}`} ref={carouselRef}>
      <button className="carousel-nav prev" onClick={scrollLeft}>
        <FaChevronLeft /> {/* Left arrow icon */}
      </button>
      <div className="carousel-content">
        <h2 className="carousel-title">Courses Offered</h2>
        <p className="carousel-description">
          Explore the latest courses and master your skills today.
        </p>
        <div className="carousel-cards" ref={cardsContainerRef}>
          {/* Java Programming Card */}
          <div className="card">
            <img
              src={Java}
              alt="Java Programming"
              className="carousel-image"
            />
            <h3 className="product-name">Java Programming</h3>
            <Button className="details-btn" onClick={navigateToCourses}>
              +
            </Button>
          </div>
          {/* Python Programming Card */}
          <div className="card">
            <img
              src={python}
              alt="Python Essentials"
              className="carousel-image"
            />
            <h3 className="product-name">Python Essentials</h3>
            <Button className="details-btn" onClick={navigateToCourses}>
              +
            </Button>
          </div>
          {/* Data Structures & Algorithms Card */}
          <div className="card">
            <img
              src={dsa}
              alt="Data Structures and Algorithms"
              className="carousel-image"
            />
            <h3 className="product-name">Data Structures & Algorithms</h3>
            <Button className="details-btn" onClick={navigateToCourses}>
              +
            </Button>
          </div>
        </div>
      </div>

      <button className="carousel-nav next" onClick={scrollRight}>
        <FaChevronRight /> {/* Right arrow icon */}
      </button>
    </div>
  );
};

export default Frontcourse;

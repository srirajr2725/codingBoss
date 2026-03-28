import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./Banner.css";



const Banner = ({ isLoggedIn }) => {
  const canvasRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Floating geometric shapes
    const shapes = [];
    const shapeCount = 15;

    class FloatingShape {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 60 + 40;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
        this.opacity = Math.random() * 0.15 + 0.05;
        this.type = Math.floor(Math.random() * 3); // 0: cube, 1: triangle, 2: hexagon
        this.color = this.getRandomColor();
      }

      getRandomColor() {
        const colors = [
          'rgba(102, 126, 234, ',
          'rgba(118, 75, 162, ',
          'rgba(240, 147, 251, ',
          'rgba(0, 242, 254, '
        ];
        return colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;

        if (this.x > canvas.width + this.size) this.x = -this.size;
        if (this.x < -this.size) this.x = canvas.width + this.size;
        if (this.y > canvas.height + this.size) this.y = -this.size;
        if (this.y < -this.size) this.y = canvas.height + this.size;
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.opacity;

        if (this.type === 0) {
          // Cube/Rectangle
          ctx.strokeStyle = this.color + this.opacity + ')';
          ctx.lineWidth = 2;
          ctx.strokeRect(-this.size / 2, -this.size / 2, this.size, this.size);
          ctx.fillStyle = this.color + (this.opacity * 0.3) + ')';
          ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        } else if (this.type === 1) {
          // Triangle
          ctx.beginPath();
          ctx.moveTo(0, -this.size / 2);
          ctx.lineTo(this.size / 2, this.size / 2);
          ctx.lineTo(-this.size / 2, this.size / 2);
          ctx.closePath();
          ctx.strokeStyle = this.color + this.opacity + ')';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.fillStyle = this.color + (this.opacity * 0.3) + ')';
          ctx.fill();
        } else {
          // Hexagon
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const x = (this.size / 2) * Math.cos(angle);
            const y = (this.size / 2) * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.strokeStyle = this.color + this.opacity + ')';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.fillStyle = this.color + (this.opacity * 0.3) + ')';
          ctx.fill();
        }

        ctx.restore();
      }
    }

    for (let i = 0; i < shapeCount; i++) {
      shapes.push(new FloatingShape());
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      shapes.forEach(shape => {
        shape.update();
        shape.draw();
      });

      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 20,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * 20,
    });
  };

  const features = [
    {
      icon: "💼",
      title: "Industry Internships",
      description: "Get hands-on experience with Fortune 500 companies and innovative startups",
      color: "blue-cyan",
      stats: "500+ Companies"
    },
    {
      icon: "🎓",
      title: "Expert-Led Courses",
      description: "Master in-demand skills with industry veterans and certified professionals",
      color: "purple-pink",
      stats: "50+ Courses"
    },
    {
      icon: "🚀",
      title: "Real-World Projects",
      description: "Build production-ready applications that showcase your expertise",
      color: "orange-red",
      stats: "100+ Projects"
    }
  ];

  return (
    <div className="banner-container" onMouseMove={handleMouseMove}>
      <canvas ref={canvasRef} className="particle-canvas" />
      <div className="video-container">
        <video autoPlay loop muted playsInline className="video-background">
          <source src="/videos/background.mov" type="video/mp4" />
        </video>
        <div className="gradient-overlay"></div>
      </div>

      <div className="content-wrapper">
        <div className="hero-content">
          <div
            className="hero-badge"
            style={{
              transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)`
            }}
          >
          </div>

          <h1
            className="hero-title"
            style={{
              transform: `translate(${mousePos.x * 0.3}px, ${mousePos.y * 0.3}px)`
            }}
          >
            Elevate Your Skills with <span className="gradient-text1">Coding</span><span className="gradient-text2">Boss</span>
          </h1>

          <p
            className="hero-subtitle"
            style={{
              transform: `translate(${mousePos.x * 0.2}px, ${mousePos.y * 0.2}px)`
            }}
          >
            Join thousands of developers mastering cutting-edge technologies through
            <span className="highlight-text"> premium internships</span>,
            <span className="highlight-text"> industry-certified courses</span>, and
            <span className="highlight-text"> production-grade projects</span>
          </p>

          <div className="feature-cards">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`feature-card ${feature.color}`}
                style={{
                  transform: `translate(${mousePos.x * (0.1 + index * 0.05)}px, ${mousePos.y * (0.1 + index * 0.05)}px)`,
                  animationDelay: `${index * 0.15}s`
                }}
              >
                <div className="card-gradient"></div>
                <div className="card-badge">{feature.stats}</div>
                <div className="card-content">
                  <div className="card-icon">{feature.icon}</div>
                  <h3 className="card-title">{feature.title}</h3>
                  <p className="card-description">{feature.description}</p>
                  <div className="card-arrow">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M7 17L17 7M17 7H7M17 7V17" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="cta-buttons">
            <Link to="/LoginPage" className="primary-btn1">
              <span>Login</span>
              <svg className="btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M5 12h14M12 5l7 7-7 7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link to="/signup" className="secondary-btn" style={{ textDecoration: 'none', color: 'white' }}>
              <span>Sign Up</span>
              <svg className="play-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 5v14M5 12h14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <button className="secondary-btn">
              <span>View Success Stories</span>
              <svg className="play-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
              </svg>
            </button>
          </div>

          <div className="stats-container">
            <div className="stat-item">
              <div className="stat-number">500+</div>
              <div className="stat-label">Partner Companies</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-number">15K+</div>
              <div className="stat-label">Active Learners</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-number">98%</div>
              <div className="stat-label">Placement Rate</div>
            </div>
          </div>

          <div className="trust-badges">
            <p className="trust-text">Trusted by professionals at</p>
            <div className="company-logos">
              <span>Google</span>
              <span>Microsoft</span>
              <span>Amazon</span>
              <span>Meta</span>
              <span>Apple</span>
            </div>
          </div>
        </div>
      </div>

      <div className="scroll-indicator">
        <div className="mouse-icon">
          <div className="mouse-wheel"></div>
        </div>
        <p>Scroll to Discover</p>
      </div>
    </div>
  );
};

export default Banner;
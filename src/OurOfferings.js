import React, { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useNavigate } from "react-router-dom";
import "./OurOfferings.css";

// Import images
import javaImg from "../src/images/Jaava.png";
import pythonImg from "../src/images/py.png";
import aiImg from "../src/images/ai.png";
import dataImg from "../src/images/data.png";
import cyberImg from "../src/images/cyber.png";
import hciImg from "../src/images/HCI.png";
import itImg from "../src/images/IT.png";
import imageProcessingImg from "../src/images/imagep.png";
import iotImg from "../src/images/IOT.png";
import nlpImg from "../src/images/NLP.png";
import visionImg from "../src/images/vision.png";
import softwareEngImg from "../src/images/soft.png";
import cloudImg from "../src/images/cloudcom.png";
import mlImg from "../src/images/machine.png";
import dlImg from "../src/images/deep.png";
import softCompImg from "../src/images/softcomp.png";
import ProjectForm from "./ProjectForm";

const projects = [
  { name: "Full Stack Java", img: javaImg },
  { name: "Python Django", img: pythonImg },
  { name: "Artificial Intelligence", img: aiImg },
  { name: "Data Science", img: dataImg },
  { name: "Cyber Security and Cryptography", img: cyberImg },
  { name: "Human Computer Interaction and Information Systems", img: hciImg },
  { name: "IT in Education/Business/Health Care/Law/Media", img: itImg },
  { name: "Image Processing", img: imageProcessingImg },
  { name: "Internet Of Things (IoT) & Embedded Systems", img: iotImg },
  { name: "Natural Language Processing", img: nlpImg },
  { name: "Vision Recognition", img: visionImg },
  { name: "Software Engineering", img: softwareEngImg },
  { name: "Cloud Computing", img: cloudImg },
  { name: "Machine Learning", img: mlImg },
  { name: "Deep Learning", img: dlImg },
  { name: "Software Computing", img: softCompImg },
];

const OurOfferings = () => {
  const navigate = useNavigate();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollTop = window.scrollY;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercentage = (scrollTop / documentHeight) * 100;
      setScrollProgress(scrollPercentage);
    };

    window.addEventListener("scroll", updateScrollProgress);
    return () => window.removeEventListener("scroll", updateScrollProgress);
  }, []);

  const handleBookNowClick = (project) => {
    setSelectedProject(project); // Open chat for the clicked project
  };

  const closeChat = () => {
    setSelectedProject(null); // Close chat
  };

  return (
    <div className="offerings-container">
      {/* Scroll Progress Bar */}
      <div className="scroll-progress-container">
        <div className="scroll-progress" style={{ height: `${scrollProgress}%` }}></div>
      </div>

      <div className="category-header">
        <span className="category-title">Projects</span>
        <span className="category-tag for-students">For College Students</span>
      </div>

      <div className="offerings-list">
        {projects.map((project, index) => {
          const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });
          return (
            <div
              key={index}
              ref={ref}
              className={`project-card ${inView ? "visible" : ""}`}
            >
              <div className="project-image-wrapper">
                <img src={project.img} alt={project.name} className="project-image" />
              </div>
              <div className="project-info">
                <h3>{project.name}</h3>
                <button onClick={() => handleBookNowClick(project)} className="book-now-btn">
                  Explore Project
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Single Chat Window (renders on the left side) */}
      {selectedProject && (
        <div className="chat-window-left">
          <ProjectForm project={selectedProject} closeChat={closeChat} />
        </div>
      )}
    </div>
  );
};

export default OurOfferings;

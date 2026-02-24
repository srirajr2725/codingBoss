import React, { useState } from 'react';
import dsa from "./images/dsa.png";
import aimi from "./images/aimi.png";
import blockchain from "./images/blockchain.png";
import c_program from "./images/c_program.png";
import cloudcom from "./images/cloudcom.png";
import cybersec from "./images/cybersec.png";
import Java from "./images/Java.png";
import Laravel from "./images/Laravel.svg";
import python from "./images/python.png";
import react from "./images/react.svg";

const CoursesOffered = () => {
    const [activeIndex, setActiveIndex] = useState(null); // Track which card is active

    // Function to toggle between showing image or content
    const toggleContent = (index) => {
        // Toggle the active card; hide if the same index is clicked again
        setActiveIndex((prevIndex) => (prevIndex === index ? null : index));
    };

    // Array of courses with corresponding content
    const courses = [
        {
            img: dsa,
            frontText: "DSA",
            backText: (
                <div>
                    <div style={{ marginBottom: "20px" }}>
                        <strong>Data Structures & Algorithms</strong>
                    </div>
                    <p style={{ margin: '10px 0' }}>Duration: 3 Months</p>
                    <p style={{ margin: '10px 0' }}>Topics: 10 Chapters</p>
                    {/* <p style={{ margin: '10px 0' }}>Learn data structures and algorithms to improve problem-solving skills</p> */}
                    

                </div>
            ),
        },
        {
            img: aimi,
            frontText: "AI & ML",
            backText: (
                <div>
                    <strong style={{ marginBottom: '10px' }}>Artificial Intelligence & Machine Learning</strong>
                    <p style={{ margin: '10px 0' }}>Duration: 4 Months</p>
                    <p style={{ margin: '10px 0' }}>Topics: 12 Chapters</p>
                    {/* <p style={{ margin: '10px 0' }}>Understand AI concepts and machine learning algorithms</p>
                    <p style={{ margin: '10px 0' }}>Build AI models and gain insights from data</p> */}
                </div>
            ),
        },
        {
            img: blockchain,
            frontText: "Blockchain",
            backText: (
                <div>
                    <strong style={{ marginBottom: '10px' }}>Blockchain Technology</strong>
                    <p style={{ margin: '10px 0' }}>Duration: 3 Months</p>
                    <p style={{ margin: '10px 0' }}>Topics: 8 Chapters</p>
                    {/* <p style={{ margin: '10px 0' }}>Learn about decentralized systems and blockchain architecture</p>
                    <p style={{ margin: '10px 0' }}>Understand cryptocurrency and smart contracts</p> */}
                </div>
            ),
        },
        {
            img: c_program,
            frontText: "C Programming",
            backText: (
                <div>
                    <strong style={{ marginBottom: '10px' }}>C Programming</strong>
                    <p style={{ margin: '10px 0' }}>Duration: 2 Months</p>
                    <p style={{ margin: '10px 0' }}>Topics: 6 Chapters</p>
                    {/* <p style={{ margin: '10px 0' }}>Master the fundamentals of C programming language</p>
                    <p style={{ margin: '10px 0' }}>Learn to write efficient and optimized C programs</p> */}
                </div>
            ),
        },
        {
            img: cloudcom,
            frontText: "Cloud Computing",
            backText: (
                <div>
                    <strong style={{ marginBottom: '10px' }}>Cloud Computing</strong>
                    <p style={{ margin: '10px 0' }}>Duration: 4 Months</p>
                    <p style={{ margin: '10px 0' }}>Topics: 10 Chapters</p>
                    {/* <p style={{ margin: '10px 0' }}>Explore cloud infrastructure and services</p>
                    <p style={{ margin: '10px 0' }}>Learn cloud platforms like AWS, Azure, and Google Cloud</p> */}
                </div>
            ),
        },
        {
            img: cybersec,
            frontText: "Cybersecurity",
            backText: (
                <div>
                    <strong style={{ marginBottom: '10px' }}>Cybersecurity</strong>
                    <p style={{ margin: '10px 0' }}>Duration: 4 Months</p>
                    <p style={{ margin: '10px 0' }}>Topics: 12 Chapters</p>
                    {/* <p style={{ margin: '10px 0' }}>Learn about online security protocols and practices</p>
                    <p style={{ margin: '10px 0' }}>Protect data and systems from cyber threats</p> */}
                </div>
            ),
        },
        {
            img: Java,
            frontText: "Java",
            backText: (
                <div>
                    <strong style={{ marginBottom: '10px' }}>Java Programming</strong>
                    <p style={{ margin: '10px 0' }}>Duration: 3 Months</p>
                    <p style={{ margin: '10px 0' }}>Topics: 10 Chapters</p>
                    {/* <p style={{ margin: '10px 0' }}>Master object-oriented programming with Java</p>
                    <p style={{ margin: '10px 0' }}>Develop powerful applications and software solutions</p> */}
                </div>
            ),
        },
        {
            img: Laravel,
            frontText: "Laravel",
            backText: (
                <div>
                    <strong style={{ marginBottom: '10px' }}>Laravel Framework</strong>
                    <p style={{ margin: '10px 0' }}>Duration: 3 Months</p>
                    <p style={{ margin: '10px 0' }}>Topics: 8 Chapters</p>
                    {/* <p style={{ margin: '10px 0' }}>Build scalable web applications with Laravel</p>
                    <p style={{ margin: '10px 0' }}>Understand MVC architecture and routing</p> */}
                </div>
            ),
        },
        {
            img: python,
            frontText: "Python",
            backText: (
                <div>
                    <strong style={{ marginBottom: '10px' }}>Python Programming</strong>
                    <p style={{ margin: '10px 0' }}>Duration: 3 Months</p>
                    <p style={{ margin: '10px 0' }}>Topics: 10 Chapters</p>
                    {/* <p style={{ margin: '10px 0' }}>Learn Python fundamentals and advanced concepts</p>
                    <p style={{ margin: '10px 0' }}>Build applications and data-driven projects</p> */}
                </div>
            ),
        },
        {
            img: react,
            frontText: "React",
            backText: (
                <div>
                    <strong style={{ marginBottom: '10px' }}>React Framework</strong>
                    <p style={{ margin: '10px 0' }}>Duration: 3 Months</p>
                    <p style={{ margin: '10px 0' }}>Topics: 10 Chapters</p>
                    {/* <p style={{ margin: '10px 0' }}>Master the React library for building dynamic web applications</p>
                    <p style={{ margin: '10px 0' }}>Understand hooks, components, and state management</p> */}
                </div>
            ),
        },
    ];

    // Inline styles
   const styles = {
    container: {
        textAlign: 'center',
        padding: '20px',
    },
    heading: {
        fontSize: '28px',
        fontWeight: 'bold',
        marginBottom: '10px',
        textAlign: 'center',  // Ensure the title is centered
    },
    subHeading: {
        fontSize: '20px',
        color: 'gray',
        marginBottom: '30px',
        textAlign: 'center',  // Ensure the subheading is centered
    },
    slider: {
        display: 'flex',
        justifyContent: 'flex-start',
        overflowX: 'auto',
        scrollBehavior: 'smooth',
        gap: '20px',
        scrollbarWidth: 'none', // For Firefox
        msOverflowStyle: 'none', // For Internet Explorer and Edge
        padding: '0 10px', // Ensure there's some padding on both sides
    },
    course: {
    flex: '0 0 auto',
    width: '300px',
    height: '400px',
    position: 'relative',
    textAlign: 'center',
    borderRadius: '10px',
    overflow: 'hidden',
    transition: 'transform 0.3s ease',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
},
    courseFront: {
        position: 'relative',
        width: '100%',
        height: '100%',
    },
    courseImage: {
        width: '100%',  // Ensure image takes up full width of the card
        height: '100%',  // Ensure the image covers the full height of the card
        objectFit: 'cover',  // Ensures image covers the entire card area without stretching or distorting
        objectPosition: 'center',  // Center the image to avoid undesired cropping
    },
    courseOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',  // Slightly dark overlay to highlight text
        transition: 'opacity 1s ease',
    },
    courseText: {
        color: 'white',
        fontSize: '18px',  // Adjusted for consistent font size
        fontWeight: 'bold',
    },
    courseBack: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'white',
        padding: '10px',
        opacity: 0,
        transition: 'opacity 0.5s ease',
        zIndex: -1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        textAlign: 'justify',
    },
    courseHover: {
    transform: 'scale(1.05)', // Slight zoom on hover
    boxShadow: '0 6px 10px rgba(0, 0, 0, 0.2)',
},

    activeBack: {
        opacity: 1,
        zIndex: 1,
    },
    toggleButton: {
    position: 'absolute',
    bottom: '10px',
    right: '10px',
    backgroundColor: '#007bff', // A visually appealing button color
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    padding: '8px 15px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px',
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
    transition: 'background-color 0.3s ease',
    },
    toggleButtonHover: {
    backgroundColor: '#0056b3', // A darker shade for hover effect
},

    startButton: {
        position: 'absolute',
        top: '10px',
        left: '10px',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        border: 'none',
        borderRadius: '5px',
        padding: '5px 10px',
        cursor: 'pointer',
    },
};

    

    return (
        <div id="courses-offered" style={styles.container}>
            <h2 style={styles.heading}>Courses Offered</h2>
            <p style={styles.subHeading}>Explore the latest courses and master your skills today.</p>
            <div style={styles.slider}>
                {courses.map((course, index) => (
                    <div
                        style={{ ...styles.course, ...(activeIndex === index ? { zIndex: 1 } : {}) }}
                        key={index}
                    >
                        <div style={styles.courseFront}>
                            <img src={course.img} alt={course.frontText} style={styles.courseImage} />
                            <div style={styles.courseOverlay}>
                                <p style={styles.courseText}>{course.frontText}</p>
                                <button style={styles.toggleButton} onClick={() => toggleContent(index)}>
                                    {activeIndex === index ? '-' : '+'}
                                </button>
                            </div>
                            <button style={styles.startButton}>Start Course</button> {/* Start Course Button */}
                        </div>
                        <div
                            style={{
                                ...styles.courseBack,
                                ...(activeIndex === index ? styles.activeBack : {}),
                            }}
                        >
                            {course.backText}
                            <button style={styles.toggleButton} onClick={() => toggleContent(index)}>
                                Close
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CoursesOffered;

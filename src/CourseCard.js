import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { margin, padding } from '@mui/system';

export default function CourseCard() {

  const [scrollY, setScrollY] = useState(0);
  const [resumeFile, setResumeFile] = useState(null);
  const [atsScore, setAtsScore] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [gameLevel, setGameLevel] = useState(0);
  const [gameScore, setGameScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [currentView, setCurrentView] = useState('main'); // 'main', 'courses', 'pdf'

  const courses = [
    {
      id: 1,
      title: "C Programming",
      icon: "📘",
      description: "Learn the fundamentals of C programming including variables, loops, functions, pointers, and memory management.",
      color: "orange-red",
      level: "Beginner",
      duration: "6 weeks",
      pdfUrl: "/Clang.pdf"
    },
    {
      id: 2,
      title: "JavaScript Mastery",
      icon: "⚡",
      description: "Master modern JavaScript (ES6+), asynchronous programming, DOM manipulation, and API integration.",
      color: "blue-cyan",
      level: "Intermediate",
      duration: "8 weeks",
      pdfUrl: "/javascript.pdf"
    },
    {
      id: 3,
      title: "React Development",
      icon: "⚛️",
      description: "Build modern and scalable frontend applications using React, Hooks, Context API, and component architecture.",
      color: "purple-pink",
      level: "Advanced",
      duration: "10 weeks",
      pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
    },
    {
      id: 4,
      title: "Python Programming",
      icon: "🐍",
      description: "Learn Python from basics to advanced covering automation, web development, and data handling.",
      color: "orange-red",
      level: "Beginner",
      duration: "6 weeks",
      pdfUrl: "/PythonCB.pdf"
    },
    {
      id: 5,
      title: "Java Programming",
      icon: "☕",
      description: "Learn Core Java, OOP, Collections, Exception Handling, and build Spring Boot REST APIs.",
      color: "blue-cyan",
      level: "Intermediate",
      duration: "9 weeks",
      pdfUrl: "/java.pdf"
    },
    {
      id: 7,
      title: "C++ Programming",
      icon: "🧩",
      description: "Master C++ with OOP concepts, STL, memory management, and competitive programming techniques.",
      color: "orange-red",
      level: "Advanced",
      duration: "10 weeks",
      pdfUrl: "/cplusplus.pdf"
    },
    {
      id: 8,
      title: "Bash Scripting",
      icon: "💻",
      description: "Learn shell scripting, automation, file handling, process management, and Linux command-line essentials.",
      color: "orange-red",
      level: "Advanced",
      duration: "5 weeks",
      pdfUrl: "/bash.pdf"
    },
    {
      id: 9,
      title: "HTML & CSS",
      icon: "🧱",
      description: "Learn the fundamentals of web design using HTML5, CSS3, layouts, forms, Flexbox, and Grid.",
      color: "purple-pink",
      level: "Beginner",
      duration: "4 weeks",
      pdfUrl: "/html&css.pdf"
    },
    {
      id: 10,
      title: "TypeScript",
      icon: "🔷",
      description: "Master TypeScript's strong typing, interfaces, generics, and integration with React & Node.",
      color: "blue-cyan",
      level: "Intermediate",
      duration: "6 weeks",
      pdfUrl: "/typescript.pdf"
    },
    {
      id: 11,
      title: "Node.js",
      icon: "🟩",
      description: "Learn backend development using Node.js, Express.js, middleware, routing, and REST APIs.",
      color: "green",
      level: "Intermediate",
      duration: "7 weeks",
      pdfUrl: "/nodejs.pdf"
    },
    {
      id: 12,
      title: "MongoDB",
      icon: "🍃",
      description: "Learn NoSQL database essentials, schema design, aggregation pipelines, and CRUD operations.",
      color: "teal",
      level: "Beginner",
      duration: "5 weeks",
      pdfUrl: "/mongodb.pdf"
    },
    {
      id: 13,
      title: "PHP & MySQL",
      icon: "🐘",
      description: "Learn backend development using PHP, MySQL, CRUD, sessions, authentication, and APIs.",
      color: "orange",
      level: "Beginner",
      duration: "7 weeks",
      pdfUrl: "/php_mysql.pdf"
    },
    {
      id: 14,
      title: "Go (Golang)",
      icon: "💠",
      description: "Learn Go concurrency, goroutines, channels, and build high-performance backend services.",
      color: "blue",
      level: "Advanced",
      duration: "8 weeks",
      pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
    },
    {
      id: 15,
      title: "Rust",
      icon: "🦀",
      description: "Master Rust memory safety, ownership, lifetimes, and build fast & secure systems.",
      color: "brown",
      level: "Advanced",
      duration: "10 weeks",
      pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
    },
    {
      id: 16,
      title: "SQL & Databases",
      icon: "🗄️",
      description: "Learn SQL queries, joins, stored procedures, indexing, and relational database design.",
      color: "indigo",
      level: "Beginner",
      duration: "5 weeks",
      pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
    },
    {
      id: 17,
      title: "Flutter & Dart",
      icon: "📱",
      description: "Build cross-platform mobile apps using Flutter widgets, state management, and Firebase integration.",
      color: "sky-blue",
      level: "Intermediate",
      duration: "8 weeks",
      pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
    },
    {
      id: 18,
      title: "Kotlin for Android",
      icon: "🤖",
      description: "Learn modern Android app development using Kotlin, Jetpack, MVVM, and API integration.",
      color: "orange-red",
      level: "Advanced",
      duration: "10 weeks",
      pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
    }
  ];


  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  const handleEnroll = () => {
    let enrolled = JSON.parse(localStorage.getItem("enrolledCourses")) || [];

    // Prevent duplicate enrollment
    const isAlreadyEnrolled = enrolled.some(
      (course) => course.id === selectedCourse.id
    );

    if (!isAlreadyEnrolled) {
      enrolled.push(selectedCourse);
      localStorage.setItem("enrolledCourses", JSON.stringify(enrolled));
    }

    alert(`Successfully Enrolled in ${selectedCourse.title}!`);
  };


  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    setCurrentView('pdf');
  };

  const handleViewCourses = () => {
    setCurrentView('courses');
  };

  const handleBackToMain = () => {
    setCurrentView('main');
    setSelectedCourse(null);
  };


  const features = [
    {
      icon: '🎓',
      title: 'Premium Internships',
      description: 'Get hands-on experience with real-world projects and industry mentorship',
      stats: '500+ Companies',
      action: () => setCurrentView('internships')
    },
    {
      icon: '📚',
      title: 'Certified Courses',
      description: 'Master in-demand technologies with expert-led curriculum and certifications',
      stats: '50+ Courses',
      action: () => setCurrentView('courses')
    },
    {
      icon: '🚀',
      title: 'Live Projects',
      description: 'Build production-ready applications and expand your portfolio',
      stats: '100+ Projects',
      action: () => setCurrentView('projects')
    },
    {
      icon: '📄',
      title: 'ATS Resume Scanner',
      description: 'Check your resume against ATS systems and get instant optimization tips',
      stats: 'AI-Powered',
      action: () => setCurrentView('ats')
    },
    {
      icon: '🎮',
      title: 'Code Bug Hunter',
      description: 'Sharpen your debugging skills with fun, interactive coding challenges',
      stats: '50+ Challenges',
      action: () => setCurrentView('game')
    }
  ];

  const codingChallenges = [
    {
      code: `function sum(a, b) {\n  return a + b\n}\nconsole.log(sum(5, 3));`,
      error: 'Missing semicolon',
      correctLine: 2,
      options: ['Syntax Error', 'Missing semicolon', 'Wrong variable', 'Logic Error']
    },
    {
      code: `const arr = [1, 2, 3];\nfor (let i = 0; i <= arr.length; i++) {\n  console.log(arr[i]);\n}`,
      error: 'Array index out of bounds',
      correctLine: 2,
      options: ['Missing bracket', 'Array index out of bounds', 'Wrong loop', 'Undefined variable']
    },
    {
      code: `let count = 0;\nwhile (count < 5)\n  count++;\n  console.log(count);\n}`,
      error: 'Extra closing brace',
      correctLine: 5,
      options: ['Missing semicolon', 'Wrong condition', 'Extra closing brace', 'Infinite loop']
    },
    {
      code: `function greet(name) {\n  console.log("Hello " + name)\n}\ngreet();`,
      error: 'Missing argument',
      correctLine: 4,
      options: ['Syntax error', 'Missing argument', 'Wrong function name', 'Type error']
    },
    {
      code: `const user = { name: "John" };\nconsole.log(user.age);`,
      error: 'Accessing undefined property',
      correctLine: 2,
      options: ['Syntax error', 'Missing object', 'Accessing undefined property', 'Wrong method']
    }
  ];

  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResumeFile(file);
      analyzeResume(file);
    }
  };

  const analyzeResume = (file) => {
    setAnalyzing(true);
    setTimeout(() => {
      const score = Math.floor(Math.random() * 30) + 65;
      setAtsScore({
        score: score,
        fileName: file.name,
        suggestions: [
          'Add more keywords related to your target job',
          'Use standard section headings (Experience, Education, Skills)',
          'Include measurable achievements with numbers',
          'Optimize formatting for ATS parsing',
          'Add relevant technical skills'
        ],
        strengths: [
          'Clear contact information',
          'Professional formatting',
          'Relevant experience listed'
        ]
      });
      setAnalyzing(false);
    }, 2000);
  };

  const checkAnswer = (answer) => {
    setSelectedAnswer(answer);
    setTimeout(() => {
      if (answer === codingChallenges[gameLevel].error) {
        setGameScore(gameScore + 10);
        if (gameLevel < codingChallenges.length - 1) {
          setGameLevel(gameLevel + 1);
        }
      }
      setSelectedAnswer(null);
    }, 1000);
  };
  const resetGame = () => {
    setGameLevel(0);
    setGameScore(0);
    setSelectedAnswer(null);
  };

  const parallaxTransform = (factor) => ({
    transform: `translateY(${scrollY * factor}px)`
  });

  const isMobile = window.innerWidth <= 768;

  const styles = {
    container: {
      minHeight: '100vh',
      width: '100%',
      background: '#ffffff',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    content: {
      position: 'relative',
      zIndex: 1,
      padding: isMobile ? '2rem 1rem' : '4rem 2rem',
      maxWidth: '1400px',
      margin: '0 auto'
    },
    tagPill: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1.25rem',
      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))',
      border: '1px solid rgba(99, 102, 241, 0.2)',
      borderRadius: '50px',
      fontSize: isMobile ? '0.8rem' : '0.9rem',
      fontWeight: '600',
      color: '#6366f1',
      marginBottom: '2rem'
    },
    heading: {
      fontSize: isMobile ? '2rem' : '3.5rem',
      fontWeight: '800',
      color: '#1a1a1a',
      marginBottom: '1.5rem',
      lineHeight: '1.2',
      transition: 'transform 0.1s ease-out'
    },
    gradientText: {
      background: 'linear-gradient(135deg, #ff8a00 0%, #ff6a00 50%, #ff3b00 100%)',

      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    },
    subHeading: {
      fontSize: isMobile ? '1rem' : '1.25rem',
      color: '#4a5568',
      marginBottom: '3rem',
      lineHeight: '1.8',
      maxWidth: '900px',
      transition: 'transform 0.1s ease-out'
    },
    highlightText: {
      color: '#6366f1',
      fontWeight: '600'
    },
    featureGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '2rem',
      marginBottom: '3rem'
    },
    featureCard: {
      background: '#ffffff',
      border: '2px solid #e5e7eb',
      borderRadius: '20px',
      padding: isMobile ? '1.5rem' : '2rem',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden',
      textAlign: 'center'
    },
    featureCardHover: {
      transform: 'translateY(-8px)',
      borderColor: '#6366f1',
      boxShadow: '0 20px 40px rgba(99, 102, 241, 0.15)'
    },
    featureStats: {
      position: 'absolute',
      top: '1rem',
      right: '1rem',
      background: 'linear-gradient(135deg, #ff8a00 0%, #ff6a00 50%, #ff3b00 100%)',

      color: 'white',
      padding: '0.35rem 0.75rem',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: '700'
    },
    featureIcon: {
      fontSize: isMobile ? '2rem' : '2.5rem',
      marginBottom: '1rem'
    },
    featureTitle: {
      fontSize: isMobile ? '1.25rem' : '1.5rem',
      fontWeight: '700',
      color: '#1a1a1a',
      marginBottom: '0.75rem'
    },
    featureDescription: {
      color: '#6b7280',
      lineHeight: '1.6',
      fontSize: '0.95rem'
    },
    nextButton: {
      marginTop: '1rem',
      width: '100%',
      padding: '0.875rem 1.5rem',
      background: 'linear-gradient(135deg, #6366f1, #a855f7)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem'
    },
    backButton: {
      padding: isMobile ? '0.5rem 1rem' : '0.75rem 1.5rem',
      background: 'transparent',
      color: '#6366f1',
      border: '2px solid #6366f1',
      borderRadius: '12px',
      fontSize: isMobile ? '0.9rem' : '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      marginBottom: '2rem'
    },
    sectionTitle: {
      fontSize: isMobile ? '1.75rem' : '2.5rem',
      fontWeight: '800',
      color: '#1a1a1a',
      marginBottom: '1rem',
      textAlign: 'center'
    },
    card: {
      background: '#ffffff',
      border: '2px solid #e5e7eb',
      borderRadius: '16px',
      padding: isMobile ? '1.5rem' : '2rem',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    },
    cardTitle: {
      fontSize: isMobile ? '1.1rem' : '1.5rem',
      fontWeight: '700',
      color: '#1a1a1a',
      marginBottom: '0.75rem'
    },
    cardDescription: {
      color: '#6b7280',
      lineHeight: '1.6',
      marginBottom: '1rem',
      fontSize: '0.95rem'
    },
    badge: {
      display: 'inline-block',
      padding: '0.35rem 0.75rem',
      background: '#f3f4f6',
      color: '#6366f1',
      borderRadius: '20px',
      fontSize: '0.8rem',
      fontWeight: '600'
    },
    atsContainer: {
      maxWidth: '800px',
      margin: '40px auto',
      padding: isMobile ? '1.5rem' : '40px',
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
    },
    gameContainer: {
      maxWidth: '900px',
      margin: '40px auto',
      padding: isMobile ? '1.5rem' : '40px',
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
    },
    gameHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '30px',
      padding: isMobile ? '1rem' : '20px',
      background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
      borderRadius: '12px',
      color: 'white',
      flexWrap: isMobile ? 'wrap' : 'nowrap',
      gap: isMobile ? '1rem' : '0'
    },
    codeBlock: {
      background: '#1e293b',
      color: '#e2e8f0',
      padding: isMobile ? '1rem' : '24px',
      borderRadius: '12px',
      fontFamily: 'monospace',
      fontSize: isMobile ? '0.85rem' : '16px',
      lineHeight: '1.8',
      marginBottom: '30px',
      whiteSpace: 'pre-wrap',
      overflowX: 'auto'
    },
    optionsGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
      gap: '12px'
    }, courseGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: '2rem',
      marginTop: '2rem'
    },
    courseCard: {
      background: '#ffffff',
      border: '2px solid #e5e7eb',
      borderRadius: '16px',
      padding: '2rem',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    },
    courseIcon: {
      fontSize: '3rem',
      marginBottom: '1rem'
    },
    courseTitle: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#1a1a1a',
      marginBottom: '0.75rem'
    },
    courseDescription: {
      color: '#6b7280',
      lineHeight: '1.6',
      marginBottom: '1rem',
      fontSize: '0.95rem'
    },
    infoTags: {
      display: 'flex',
      gap: '0.5rem',
      marginBottom: '1.5rem'
    },
    infoTag: {
      padding: '0.35rem 0.75rem',
      background: '#f3f4f6',
      color: '#6366f1',
      borderRadius: '20px',
      fontSize: '0.8rem',
      fontWeight: '600'
    },
    backButton: {
      padding: '0.75rem 1.5rem',
      background: 'transparent',
      color: '#6366f1',
      border: '2px solid #6366f1',
      borderRadius: '12px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      marginBottom: '2rem'
    },
    pdfFullScreen: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "#fff",
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
    },

    pdfHeader: {
      height: "70px",
      background: "#f9fafb",
      borderBottom: "1px solid #e5e7eb",
      display: "flex",
      alignItems: "center",
      padding: "0 20px",
      justifyContent: "space-between",
      zIndex: 10000,
    },
    backButton: {
      padding: "8px 16px",
      border: "1px solid #6366f1",
      background: "transparent",
      color: "#6366f1",
      borderRadius: "8px",
      cursor: "pointer",
      transition: "0.3s",
      fontWeight: "600",
    },
    pdfTitle: {
      margin: 0,
      fontSize: "22px",
      fontWeight: "700",
    },
    pdfSubtitle: {
      margin: 0,
      fontSize: "14px",
      color: "#6b7280",
    },
    pdfHeaderActions: {
      display: "flex",
      gap: "12px",
      alignItems: "center",
    },
    downloadButton: {
      padding: "8px 16px",
      background: "#f3f4f6",
      borderRadius: "8px",
      textDecoration: "none",
      color: "#111827",
      fontWeight: "600",
      transition: "0.3s",
    },
    primaryButton: {
      padding: "8px 16px",
      background: "#6366f1",
      color: "white",
      borderRadius: "8px",
      fontWeight: "600",
      cursor: "pointer",
      boxShadow: "0 4px 15px rgba(99, 102, 241, 0.3)",
      transition: "0.3s",
    },
    pdfViewer: {
      flex: 1,
      width: "100%",
      border: "none",
    },
    nextButton: {
      marginTop: '1rem',
      width: '100%',
      padding: '0.875rem 1.5rem',
      background: 'linear-gradient(135deg, #6366f1, #a855f7)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem'
    }

  };
  return (
    <div style={styles.container}>
      {/* Main View */}
      {currentView === 'main' && (
        <div style={styles.content}>
          <div style={styles.tagPill}>
            <span>⚡</span>
            <span>Accelerate Your Tech Career</span>
          </div>

          <motion.h1
            style={{
              ...styles.heading,
              ...parallaxTransform(0.3)
            }}
            initial={{
              opacity: 0,
              x: isMobile ? -80 : -500   // FIXED FOR MOBILE
            }}
            whileInView={{
              opacity: 1,
              x: 0
            }}
            transition={{
              duration: 0.9,
              ease: "easeOut"
            }}
            viewport={{ once: true }}
          >
            Elevate Your Skills with <span style={styles.gradientText}>EduDarts</span>
          </motion.h1>
          <p style={{ ...styles.subHeading, ...parallaxTransform(0.2) }}>
            Join thousands of developers mastering cutting-edge technologies through
            <span style={styles.highlightText}> premium internships</span>,
            <span style={styles.highlightText}> industry-certified courses</span>, and
            <span style={styles.highlightText}> production-grade projects</span>
          </p>
          <div style={styles.featureGrid}>
            {features.map((feature, index) => (
              <div
                key={index}
                style={styles.featureCard}
                onMouseEnter={(e) => {
                  Object.assign(e.currentTarget.style, styles.featureCardHover);
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={styles.featureStats}>{feature.stats}</div>
                <div style={styles.featureIcon}>{feature.icon}</div>
                <h3 style={styles.featureTitle}>{feature.title}</h3>
                <p style={styles.featureDescription}>{feature.description}</p>
                {feature.action && (
                  <button
                    onClick={feature.action}
                    style={styles.nextButton}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(99, 102, 241, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    Next →
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {/* ATS Resume Scanner View */}
      {currentView === 'ats' && (
        <div style={styles.content}>
          <button onClick={() => setCurrentView('main')} style={styles.backButton}>
            ← Back to Home
          </button>
          <h2 style={styles.sectionTitle}>ATS Resume Scanner</h2>
          <p style={{ ...styles.subHeading, textAlign: 'center', margin: '0 auto 40px' }}>
            Upload your resume to get instant ATS compatibility score and optimization tips
          </p>

          <div style={styles.atsContainer}>
            {!atsScore ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  border: '2px dashed #6366f1',
                  borderRadius: '12px',
                  padding: '60px 20px',
                  background: '#f8f9ff',
                  marginBottom: '20px'
                }}>
                  <div style={{ fontSize: '64px', marginBottom: '20px' }}>📄</div>
                  <label htmlFor="resume-upload" style={{
                    display: 'inline-block',
                    padding: '12px 32px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'transform 0.2s'
                  }}>
                    {analyzing ? 'Analyzing...' : 'Upload Resume'}
                  </label>
                  <input
                    id="resume-upload"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeUpload}
                    style={{ display: 'none' }}
                  />
                  <p style={{ marginTop: '16px', color: '#666', fontSize: '14px' }}>
                    Supports PDF, DOC, DOCX (Max 5MB)
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                  <div style={{
                    width: '150px',
                    height: '150px',
                    margin: '0 auto 20px',
                    borderRadius: '50%',
                    background: `conic-gradient(#10b981 ${atsScore.score * 3.6}deg, #e5e7eb 0deg)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <div style={{
                      width: '120px',
                      height: '120px',
                      borderRadius: '50%',
                      background: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '32px',
                      fontWeight: 'bold',
                      color: '#10b981'
                    }}>
                      {atsScore.score}%
                    </div>
                  </div>
                  <h3 style={{ fontSize: '24px', marginBottom: '8px' }}>ATS Compatibility Score</h3>
                  <p style={{ color: '#666' }}>{atsScore.fileName}</p>
                </div>

                <div style={{ marginBottom: '30px' }}>
                  <h4 style={{ fontSize: '18px', marginBottom: '16px', color: '#10b981' }}>✓ Strengths</h4>
                  {atsScore.strengths.map((strength, idx) => (
                    <div key={idx} style={{
                      padding: '12px',
                      background: '#f0fdf4',
                      borderLeft: '3px solid #10b981',
                      marginBottom: '8px',
                      borderRadius: '4px'
                    }}>
                      {strength}
                    </div>
                  ))}
                </div>

                <div style={{ marginBottom: '30px' }}>
                  <h4 style={{ fontSize: '18px', marginBottom: '16px', color: '#f59e0b' }}>⚠ Suggestions for Improvement</h4>
                  {atsScore.suggestions.map((suggestion, idx) => (
                    <div key={idx} style={{
                      padding: '12px',
                      background: '#fffbeb',
                      borderLeft: '3px solid #f59e0b',
                      marginBottom: '8px',
                      borderRadius: '4px'
                    }}>
                      {suggestion}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setAtsScore(null);
                    setResumeFile(null);
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Scan Another Resume
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Code Bug Hunter Game View */}
      {currentView === 'game' && (
        <div style={styles.content}>
          <button onClick={() => setCurrentView('main')} style={styles.backButton}>
            ← Back to Home
          </button>
          <h2 style={styles.sectionTitle}>Code Bug Hunter 🎮</h2>
          <p style={{ ...styles.subHeading, textAlign: 'center', margin: '0 auto 40px' }}>
            Find and identify bugs in the code snippets below
          </p>

          <div style={styles.gameContainer}>
            <div style={styles.gameHeader}>
              <div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>Level</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{gameLevel + 1} / {codingChallenges.length}</div>
              </div>
              <div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>Score</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{gameScore}</div>
              </div>
            </div>

            {gameLevel < codingChallenges.length ? (
              <>
                <div style={styles.codeBlock}>
                  {codingChallenges[gameLevel].code.split('\n').map((line, idx) => (
                    <div key={idx} style={{
                      background: idx + 1 === codingChallenges[gameLevel].correctLine ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
                      padding: '4px 8px',
                      margin: '2px -8px'
                    }}>
                      <span style={{ color: '#64748b', marginRight: '16px' }}>{idx + 1}</span>
                      {line}
                    </div>
                  ))}
                </div>

                <h3 style={{ fontSize: '18px', marginBottom: '16px', color: '#1e293b' }}>
                  What's wrong with this code?
                </h3>

                <div style={styles.optionsGrid}>
                  {codingChallenges[gameLevel].options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => checkAnswer(option)}
                      disabled={selectedAnswer !== null}
                      style={{
                        padding: '16px',
                        border: '2px solid',
                        borderColor: selectedAnswer === option
                          ? (option === codingChallenges[gameLevel].error ? '#10b981' : '#ef4444')
                          : '#e5e7eb',
                        background: selectedAnswer === option
                          ? (option === codingChallenges[gameLevel].error ? '#f0fdf4' : '#fef2f2')
                          : 'white',
                        borderRadius: '8px',
                        fontSize: '16px',
                        cursor: selectedAnswer ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                        fontWeight: '500'
                      }}
                    >
                      {option}
                      {selectedAnswer === option && (
                        <span style={{ marginLeft: '8px' }}>
                          {option === codingChallenges[gameLevel].error ? '✓' : '✗'}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎉</div>
                <h3 style={{ fontSize: '28px', marginBottom: '16px' }}>Congratulations!</h3>
                <p style={{ fontSize: '18px', color: '#666', marginBottom: '30px' }}>
                  You've completed all challenges with a score of <strong>{gameScore}</strong> points!
                </p>
                <button
                  onClick={resetGame}
                  style={{
                    padding: '14px 32px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Play Again
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Other Views (Internships, Courses, Projects) */}
      {currentView === 'internships' && (
        <div style={styles.content}>
          <button onClick={() => setCurrentView('main')} style={styles.backButton}>
            ← Back to Home
          </button>
          <h2 style={styles.sectionTitle}>Premium Internship Programs</h2>
          <div style={styles.featureGrid}>
            {[
              { title: 'Full Stack Development', company: 'Tech Corp', duration: '3 months' },
              { title: 'Data Science', company: 'AI Solutions', duration: '6 months' },
              { title: 'Mobile App Development', company: 'AppWorks', duration: '4 months' },
              { title: 'Cloud Engineering', company: 'CloudTech', duration: '3 months' }
            ].map((intern, idx) => (
              <div key={idx} style={styles.card}>
                <h3 style={styles.cardTitle}>{intern.title}</h3>
                <p style={styles.cardDescription}>Company: {intern.company}</p>
                <span style={styles.badge}>{intern.duration}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Courses View */}
      {currentView === 'courses' && (
        <div style={styles.content}>
          <button
            onClick={handleBackToMain}
            style={styles.backButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#6366f1';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#6366f1';
            }}
          >
            ← Back
          </button>

          <h2 style={styles.heading}>
            <span style={styles.gradientText}>Programming</span> Courses
          </h2>
          <p style={styles.subHeading}>
            Choose a course to view curriculum and start learning
          </p>

          <div style={styles.courseGrid}>
            {courses.map((course) => (
              <div
                key={course.id}
                style={styles.courseCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.borderColor = '#6366f1';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(99, 102, 241, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={styles.courseIcon}>{course.icon}</div>
                <h3 style={styles.courseTitle}>{course.title}</h3>
                <p style={styles.courseDescription}>{course.description}</p>
                <div style={styles.infoTags}>
                  <span style={styles.infoTag}>{course.level}</span>
                  <span style={styles.infoTag}>{course.duration}</span>
                </div>
                <button
                  onClick={() => handleCourseClick(course)}
                  style={styles.primaryButton}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(99, 102, 241, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(99, 102, 241, 0.4)';
                  }}
                >
                  View Curriculum →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {currentView === "pdf" && selectedCourse && (
        <div
          style={{
            ...styles.pdfFullScreen,
            ...(isMobile && {
              height: "100vh",
              width: "100vw",
              overflow: "hidden",
            }),
          }}
        >
          {/* Header */}
          <div
            style={{
              ...styles.pdfHeader,
              ...(isMobile && {
                height: "60px",
                padding: "0 12px",
              }),
            }}
          >
            {/* Back Button */}
            <button
              onClick={handleBackToMain}
              style={{
                ...styles.backButton,
                ...(isMobile && {
                  padding: "6px 12px",
                  fontSize: "12px",
                  borderRadius: "8px",
                }),
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#6366f1";
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#6366f1";
              }}
            >
              ← Back
            </button>

            {/* Title Center */}
            <div style={{ flex: 1, textAlign: "center" }}>
              <h2
                style={{
                  ...styles.pdfTitle,
                  ...(isMobile && {
                    fontSize: "16px",
                  }),
                }}
              >
                {selectedCourse.title}
              </h2>

              <p
                style={{
                  ...styles.pdfSubtitle,
                  ...(isMobile && {
                    fontSize: "12px",
                  }),
                }}
              >
                Course Curriculum & Syllabus
              </p>
            </div>

            {/* Right Buttons */}
            <div
              style={{
                ...styles.pdfHeaderActions,
                ...(isMobile && {
                  gap: "6px",
                }),
              }}
            >
              <button
                onClick={handleEnroll}
                style={{
                  ...styles.primaryButton,
                  ...(isMobile && {
                    padding: "6px 10px",
                    fontSize: "12px",
                    borderRadius: "6px",
                  }),
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 20px rgba(99, 102, 241, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 15px rgba(99, 102, 241, 0.4)";
                }}
              >
                Enroll Now
              </button>
            </div>
          </div>

          {/* PDF Viewer */}
          <iframe
            src={`${selectedCourse.pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
            style={{
              ...styles.pdfViewer,
              ...(isMobile && {
                height: "calc(100vh - 60px)",
              }),
            }}
            title={selectedCourse.title}
          />
        </div>
      )}

      {currentView === 'projects' && (
        <div style={styles.content}>
          <button onClick={() => setCurrentView('main')} style={styles.backButton}>
            ← Back to Home
          </button>
          <h2 style={styles.sectionTitle}>Live Projects Portfolio</h2>
          <div style={styles.featureGrid}>
            {[
              { title: 'E-Commerce Platform', tech: 'React, Node.js, MongoDB', level: 'Advanced' },
              { title: 'Social Media Dashboard', tech: 'Vue.js, Firebase', level: 'Intermediate' },
              { title: 'AI Chatbot', tech: 'Python, TensorFlow', level: 'Advanced' },
              { title: 'Portfolio Website', tech: 'HTML, CSS, JavaScript', level: 'Beginner' }
            ].map((project, idx) => (
              <div key={idx} style={styles.card}>
                <h3 style={styles.cardTitle}>{project.title}</h3>
                <p style={styles.cardDescription}>Tech Stack: {project.tech}</p>
                <span style={styles.badge}>{project.level}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
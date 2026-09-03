import React, { useState, useEffect } from 'react';
import './Videos.css';
import { 
  FaPlay, 
  FaVideo, 
  FaChalkboardTeacher, 
  FaClock, 
  FaEye,
  FaCheckCircle
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import apiClient from './utils/apiClient';

const Videos = () => {
  const [videosData, setVideosData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const data = await apiClient('compiler/videos/', 'GET');
        setVideosData(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching videos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  // Split into recent and trending if category not provided
  const recentVideos = videosData.filter(v => v.category === 'recent' || !v.category).slice(0, 6);
  const trendingVideos = videosData.filter(v => v.category === 'trending').slice(0, 6);
  // If backend doesn't split by category, fallback to just slicing the array in half
  const displayRecent = recentVideos.length > 0 ? recentVideos : videosData.slice(0, 6);
  const displayTrending = trendingVideos.length > 0 ? trendingVideos : videosData.slice(6, 12);

  const handlePlayVideo = (title) => {
    toast.success(
      <div>
        <FaCheckCircle style={{ marginRight: '8px' }} />
        Playing: <b>{title}</b>
      </div>, 
      {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      }
    );
  };

  return (
    <div className="vid-container animate-fade-in">
      <ToastContainer />
      
      {/* HERO SECTION */}
      <div className="vid-hero">
        <div className="vid-hero-content">
          <div className="vid-hero-badge">Featured Course</div>
          <h1 className="vid-hero-title">Full-Stack Web Development Bootcamp 2026</h1>
          <p className="vid-hero-desc">
            Join thousands of students in mastering the MERN stack. From zero to deployment, build production-ready applications with modern industry standards.
          </p>
          <button className="vid-play-btn-large" onClick={() => handlePlayVideo("Full-Stack Bootcamp")}>
            <FaPlay /> Watch First Lecture
          </button>
        </div>
        <div className="vid-hero-thumbnail"></div>
      </div>

      {/* RECENTLY ADDED */}
      <h2 className="vid-section-header">
        <FaVideo style={{ color: '#3b82f6' }} /> Recently Added
      </h2>
      <div className="vid-grid">
        {loading ? (
          <div style={{ color: '#64748b', padding: '20px' }}>Loading videos...</div>
        ) : displayRecent.length > 0 ? (
          displayRecent.map((vid) => (
            <div key={vid.id} className="vid-card" onClick={() => handlePlayVideo(vid.title)}>
              <div className="vid-thumbnail" style={{ backgroundImage: `url('${vid.thumbnail_url || vid.thumbnail || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'}')` }}>
                <div className="vid-duration">{vid.duration}</div>
                <div className="vid-play-overlay">
                  <div className="vid-play-icon">
                    <FaPlay style={{ marginLeft: '4px' }} />
                  </div>
                </div>
              </div>
              <div className="vid-card-content">
                <h3 className="vid-card-title">{vid.title}</h3>
                <div className="vid-card-instructor">
                  <FaChalkboardTeacher /> {vid.instructor || 'CodingBoss Academy'}
                </div>
                <div className="vid-card-meta">
                  <div className="vid-card-views">
                    <FaEye /> {vid.views || '0'} views
                  </div>
                  <div className="vid-card-views">
                    <FaClock /> 2 days ago
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ color: '#64748b', padding: '20px' }}>No videos found.</div>
        )}
      </div>

      {/* TRENDING NOW */}
      {displayTrending.length > 0 && (
        <>
          <h2 className="vid-section-header" style={{ marginTop: '24px' }}>
            <FaVideo style={{ color: '#ec4899' }} /> Trending Now
          </h2>
          <div className="vid-grid">
            {displayTrending.map((vid) => (
              <div key={vid.id} className="vid-card" onClick={() => handlePlayVideo(vid.title)}>
                <div className="vid-thumbnail" style={{ backgroundImage: `url('${vid.thumbnail_url || vid.thumbnail || 'https://images.unsplash.com/photo-1555099962-4199c345e5dd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'}')` }}>
                  <div className="vid-duration">{vid.duration}</div>
                  <div className="vid-play-overlay">
                    <div className="vid-play-icon">
                      <FaPlay style={{ marginLeft: '4px' }} />
                    </div>
                  </div>
                </div>
                <div className="vid-card-content">
                  <h3 className="vid-card-title">{vid.title}</h3>
                  <div className="vid-card-instructor">
                    <FaChalkboardTeacher /> {vid.instructor || 'CodingBoss Academy'}
                  </div>
                  <div className="vid-card-meta">
                    <div className="vid-card-views">
                      <FaEye /> {vid.views || '0'} views
                    </div>
                    <div className="vid-card-views">
                      <FaClock /> 1 week ago
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

    </div>
  );
};

export default Videos;

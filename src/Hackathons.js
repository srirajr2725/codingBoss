import React, { useState, useEffect } from 'react';
import './Hackathons.css';
import { 
  FaRocket,
  FaTrophy,
  FaGlobe,
  FaCalendarAlt,
  FaUsers,
  FaCheckCircle,
  FaLightbulb,
  FaCode,
  FaChartLine
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import confetti from 'canvas-confetti';
import apiClient from './utils/apiClient';

const Hackathons = () => {
  const [hackathonData, setHackathonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    const fetchHackathonData = async () => {
      try {
        const data = await apiClient('https://untrumpeted-sallie-shallowly.ngrok-free.dev/compiler/contests/hackathons/', 'GET');
        setHackathonData(data);
      } catch (error) {
        console.error("Error fetching hackathon data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHackathonData();
  }, []);

  const handleRegister = async () => {
    try {
      await apiClient('https://untrumpeted-sallie-shallowly.ngrok-free.dev/compiler/events/register/', 'POST', {
        event_id: displayEvents[0]?.id || 3,
        event_type: 'hackathon',
        team_name: '' // Optional
      });
      
      setIsRegistered(true);
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#10b981', '#0ea5e9', '#f59e0b']
      });
      toast.success('Successfully Registered! Check your email for next steps.', { 
        theme: "colored",
        icon: '🚀'
      });
    } catch (error) {
      toast.error(error.message || 'Registration failed. Please try again later.', { theme: "colored" });
    }
  };

  const getIconForId = (id) => {
    if (id === 1) return <FaGlobe />;
    if (id === 2) return <FaChartLine />;
    if (id === 3) return <FaCode />;
    return <FaLightbulb />;
  };

  // Fallback mock data
  const mockEvents = [
    { 
      id: 1, 
      title: 'Web3 Innovators Sprint', 
      date: 'Aug 15 - Aug 17', 
      prize: '₹25,000', 
      users: '1.2k',
      icon: <FaGlobe />,
      color: '#8b5cf6',
      bg: '#ede9fe'
    },
    { 
      id: 2, 
      title: 'FinTech Disrupt 2026', 
      date: 'Sep 02 - Sep 05', 
      prize: '₹50,000', 
      users: '3.4k',
      icon: <FaChartLine />,
      color: '#0ea5e9',
      bg: '#e0f2fe'
    },
    { 
      id: 3, 
      title: 'Open Source CodeJam', 
      date: 'Sep 20 - Sep 22', 
      prize: '₹10,000', 
      users: '850',
      icon: <FaCode />,
      color: '#f43f5e',
      bg: '#ffe4e6'
    },
    { 
      id: 4, 
      title: 'GreenTech Solutions', 
      date: 'Oct 10 - Oct 12', 
      prize: '₹30,000', 
      users: '2.1k',
      icon: <FaLightbulb />,
      color: '#10b981',
      bg: '#d1fae5'
    }
  ];

  const mockTeams = [
    { id: 1, name: 'Team Alpha', needs: 'Need Frontend Dev', skills: ['React', 'Figma'] },
    { id: 2, name: 'Data Miners', needs: 'Need Data Scientist', skills: ['Python', 'SQL'] },
    { id: 3, name: 'BlockBuilders', needs: 'Need Smart Contract Dev', skills: ['Solidity', 'Rust'] }
  ];

  const handleJoinTeam = (teamName) => {
    toast.info(`Join request sent to ${teamName}!`, { theme: "colored" });
  };

  const displayEvents = Array.isArray(hackathonData) && hackathonData.length > 0 ? hackathonData : mockEvents;
  const displayTeams = mockTeams; // Backend doesn't return teams yet
  
  // Use the first returned hackathon as the hero section
  const heroHackathon = displayEvents[0];
  const hackathonTitle = heroHackathon?.title || 'Global AI Hackathon 2026';
  const hackathonDesc = heroHackathon?.description || 'Build the next generation of intelligent applications. Form a team, leverage cutting-edge LLMs, and compete for a massive global prize pool.';

  if (loading) {
    return (
      <div className="hack-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <div style={{ color: '#64748b' }}>Loading hackathons...</div>
      </div>
    );
  }

  return (
    <div className="hack-container">
      <ToastContainer position="top-center" />
      
      {/* FLAGSHIP HERO BANNER */}
      <div className="hack-hero">
        <div className="hack-hero-content">
          <div className="hack-badge">
            <FaRocket /> Premier Event
          </div>
          <h1 className="hack-title">{hackathonTitle}</h1>
          <p className="hack-desc">
            {hackathonDesc}
          </p>

          <button 
            className={`hack-register-btn ${isRegistered ? 'registered' : ''}`}
            onClick={handleRegister}
          >
            {isRegistered ? (
              <><FaCheckCircle /> Registration Confirmed</>
            ) : (
              <><FaRocket /> Register / Form Team</>
            )}
          </button>
        </div>

        <div className="hack-prize-widget">
          <div className="hack-prize-label">
            <FaTrophy style={{ display: 'inline', marginRight: '6px' }} />
            Total Prize Pool
          </div>
          <div className="hack-prize-value">
            ₹1,00,000
          </div>
        </div>
      </div>

      {/* BOTTOM LAYOUT */}
      <div className="hack-bottom-layout">
        
        {/* LEFT PANE - EVENTS GRID */}
        <div className="hack-events-section">
          <h2 className="hack-section-title">
            <FaGlobe style={{ color: '#0ea5e9' }} /> 
            Upcoming Hackathons
          </h2>
          
          <div className="hack-grid">
            {displayEvents.map((event) => (
              <div key={event.id} className="hack-card">
                <div className="hack-card-header">
                  <div className="hack-card-icon" style={{ color: event.color || '#8b5cf6', background: event.bg || '#ede9fe' }}>
                    {event.icon || getIconForId(event.id)}
                  </div>
                  <div className="hack-card-status">{event.is_active === false ? 'Upcoming' : 'Active'}</div>
                </div>
                
                <h3 className="hack-card-title">{event.title}</h3>
                <div className="hack-card-date">
                  <FaCalendarAlt /> {event.start_time ? new Date(event.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : event.date}
                </div>
                
                <div className="hack-card-footer">
                  <div className="hack-card-prize">{event.prize || 'TBA'}</div>
                  <div className="hack-card-participants">
                    <FaUsers /> {event.max_participants ? `${event.max_participants} Limit` : event.users}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANE - MATCHMAKING PREVIEW */}
        <div className="hack-matchmaking-section">
          <h2 className="hack-section-title">
            <FaUsers style={{ color: '#8b5cf6' }} /> 
            Find a Team
          </h2>

          <div className="hack-team-list">
            {displayTeams.map((team) => (
              <div key={team.id} className="hack-team-item">
                <h4 className="hack-team-name">{team.name}</h4>
                <div className="hack-team-needs">{team.needs}</div>
                
                <div className="hack-team-skills">
                  {team.skills && team.skills.map(skill => (
                    <span key={skill} className="hack-skill-tag">{skill}</span>
                  ))}
                </div>

                <button 
                  className="hack-join-btn"
                  onClick={() => handleJoinTeam(team.name)}
                >
                  Request to Join
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Hackathons;

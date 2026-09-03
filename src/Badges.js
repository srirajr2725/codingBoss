import React, { useState, useEffect } from 'react';
import './Badges.css';
import { 
  EmojiEvents, 
  LocalFireDepartment, 
  Code, 
  BugReport, 
  Speed, 
  Star,
  Lock
} from '@mui/icons-material';
import CryptoJS from 'crypto-js';
import apiClient from './utils/apiClient';

const getBadgeIcon = (id) => {
  if (id === 1 || id === 'early_bird') return <EmojiEvents />;
  if (id === 2 || id === 'streak') return <LocalFireDepartment />;
  if (id === 3 || id === 'react') return <Code />;
  if (id === 4 || id === 'bug') return <BugReport />;
  if (id === 5 || id === 'speed') return <Speed />;
  if (id === 6 || id === 'perfect') return <Star />;
  return <EmojiEvents />; // fallback
};

const Badges = () => {
  const [badgesData, setBadgesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const storedEncryptedUserID = localStorage.getItem('userID');
        let userId = null;
        if (storedEncryptedUserID) {
          const bytes = CryptoJS.AES.decrypt(storedEncryptedUserID, 'thirancoding360mgai');
          userId = bytes.toString(CryptoJS.enc.Utf8);
        }

        if (!userId) {
          console.error("No user ID found for fetching badges.");
          setLoading(false);
          return;
        }

        const data = await apiClient(`https://untrumpeted-sallie-shallowly.ngrok-free.dev/compiler/users/${userId}/badges/`, 'GET');
        setBadgesData(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching badges:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBadges();
  }, []);

  const earnedCount = badgesData.filter(b => b.earned || b.is_earned).length;

  return (
    <div className="badges-module-container">
      <div className="badges-header">
        <div className="badges-header-content">
          <h1>My Badges</h1>
          <p>Collect achievements by completing challenges, maintaining streaks, and mastering skills.</p>
        </div>
        <div className="badges-stats">
          <div className="stat-box">
            <span className="stat-num">{earnedCount}</span>
            <span className="stat-label">Earned</span>
          </div>
          <div className="stat-box">
            <span className="stat-num">{badgesData.length - earnedCount}</span>
            <span className="stat-label">Locked</span>
          </div>
        </div>
      </div>

      <div className="badges-grid">
        {loading ? (
          <div style={{ color: '#64748b', padding: '20px' }}>Loading badges...</div>
        ) : badgesData.length > 0 ? (
          badgesData.map((badge, index) => {
            const isEarned = badge.earned || badge.is_earned;
            return (
              <div key={badge.id || index} className={`badge-card ${isEarned ? 'earned' : 'locked'}`} style={{ animationDelay: `${index * 0.1}s` }}>
                <div className={`badge-icon-wrapper ${isEarned ? (badge.color || 'gold') : 'gray'}`}>
                  {isEarned ? (badge.icon || getBadgeIcon(badge.id)) : <Lock />}
                </div>
                <div className="badge-details">
                  <h3>{badge.title}</h3>
                  <p>{badge.description}</p>
                </div>
                {isEarned && <div className="badge-glow" />}
              </div>
            );
          })
        ) : (
          <div style={{ color: '#64748b', padding: '20px' }}>No badges found.</div>
        )}
      </div>
    </div>
  );
};

export default Badges;

import React, { useState, useEffect } from 'react';
import './Streak.css';
import { LocalFireDepartment, CalendarToday, Bolt } from '@mui/icons-material';
import CryptoJS from 'crypto-js';
import apiClient from './utils/apiClient';

const Streak = () => {
  const [streakData, setStreakData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStreakData = async () => {
      try {
        const storedEncryptedUserID = localStorage.getItem('userID');
        let userId = null;
        if (storedEncryptedUserID) {
          const bytes = CryptoJS.AES.decrypt(storedEncryptedUserID, 'thirancoding360mgai');
          userId = bytes.toString(CryptoJS.enc.Utf8);
        }

        if (!userId) {
          console.error("No user ID found for fetching streak.");
          setLoading(false);
          return;
        }

        const data = await apiClient(`https://untrumpeted-sallie-shallowly.ngrok-free.dev/compiler/users/${userId}/streak/`, 'GET');
        setStreakData(data);
      } catch (error) {
        console.error("Error fetching streak data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStreakData();
  }, []);

  const heatmapData = streakData?.heatmap_data || [];
  const currentStreak = streakData?.current_streak || 0;
  const longestStreak = streakData?.longest_streak || 0;
  const totalActiveDays = streakData?.total_active_days || 0;

  if (loading) {
    return (
      <div className="streak-module-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <div style={{ color: '#64748b' }}>Loading streak data...</div>
      </div>
    );
  }

  return (
    <div className="streak-module-container">
      <div className="streak-header">
        <div className="streak-header-content">
          <h1>My Streak</h1>
          <p>Consistency is key! Keep your streak alive by coding every day.</p>
        </div>
      </div>

      <div className="streak-stats-row">
        <div className="streak-stat-card fire">
          <div className="stat-icon-wrapper"><LocalFireDepartment /></div>
          <div className="stat-details">
            <span className="stat-value">{currentStreak}</span>
            <span className="stat-name">Current Streak (Days)</span>
          </div>
        </div>
        
        <div className="streak-stat-card thunder">
          <div className="stat-icon-wrapper"><Bolt /></div>
          <div className="stat-details">
            <span className="stat-value">{longestStreak}</span>
            <span className="stat-name">Longest Streak</span>
          </div>
        </div>

        <div className="streak-stat-card calendar">
          <div className="stat-icon-wrapper"><CalendarToday /></div>
          <div className="stat-details">
            <span className="stat-value">{totalActiveDays}</span>
            <span className="stat-name">Total Active Days</span>
          </div>
        </div>
      </div>

      <div className="streak-heatmap-section">
        <h2>Activity Map (Last 12 Weeks)</h2>
        <div className="heatmap-container">
          <div className="heatmap-grid">
            {heatmapData.map((week, wIndex) => (
              <div key={wIndex} className="heatmap-column">
                {week.map((dayIntensity, dIndex) => (
                  <div 
                    key={dIndex} 
                    className={`heatmap-cell level-${dayIntensity}`} 
                    title={`${dayIntensity} contributions`}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="heatmap-legend">
            <span>Less</span>
            <div className="heatmap-cell level-0"></div>
            <div className="heatmap-cell level-1"></div>
            <div className="heatmap-cell level-2"></div>
            <div className="heatmap-cell level-3"></div>
            <div className="heatmap-cell level-4"></div>
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Streak;

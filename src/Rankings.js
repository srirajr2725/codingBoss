import React, { useState, useEffect } from 'react';
import './Rankings.css';
import { WorkspacePremium, TrendingUp, Group } from '@mui/icons-material';
import apiClient from './utils/apiClient';

const mockLeaderboardData = [
  { rank: 1, name: 'Alice Chen', score: 14500, avatar: 'A', isCurrentUser: false },
  { rank: 2, name: 'David Smith', score: 13200, avatar: 'D', isCurrentUser: false },
  { rank: 3, name: 'Student Name', score: 12850, avatar: 'S', isCurrentUser: true },
  { rank: 4, name: 'Priya Patel', score: 12100, avatar: 'P', isCurrentUser: false },
  { rank: 5, name: 'James Wilson', score: 11900, avatar: 'J', isCurrentUser: false },
  { rank: 6, name: 'Sarah Lee', score: 11200, avatar: 'S', isCurrentUser: false },
  { rank: 7, name: 'Michael Brown', score: 10500, avatar: 'M', isCurrentUser: false },
];

const Rankings = () => {
  const [rankingData, setRankingData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const data = await apiClient('https://untrumpeted-sallie-shallowly.ngrok-free.dev/compiler/leaderboard/global/', 'GET');
        setRankingData(data);
      } catch (error) {
        console.error("Error fetching global rankings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRankings();
  }, []);

  const displayLeaderboard = rankingData?.leaderboard || mockLeaderboardData;
  const currentStats = rankingData?.current_user_stats || {
    global_rank: 3,
    total_xp: 12850
  };

  const getPercentile = (rank) => {
    if (rank <= 10) return "Top 1%";
    if (rank <= 50) return "Top 5%";
    if (rank <= 100) return "Top 10%";
    return "Top 25%";
  };

  if (loading) {
    return (
      <div className="rankings-module-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <div style={{ color: '#64748b' }}>Loading rankings...</div>
      </div>
    );
  }

  return (
    <div className="rankings-module-container">
      <div className="rankings-header">
        <div className="rankings-header-content">
          <h1>Global Rankings</h1>
          <p>See where you stand among the top developers on CodingBoss.</p>
        </div>
      </div>

      <div className="rankings-hero-stats">
        <div className="hero-stat-box primary">
          <WorkspacePremium className="hero-icon gold" />
          <div className="hero-details">
            <span className="hero-value">#{currentStats.global_rank}</span>
            <span className="hero-label">Global Rank</span>
          </div>
        </div>
        <div className="hero-stat-box">
          <TrendingUp className="hero-icon blue" />
          <div className="hero-details">
            <span className="hero-value">{getPercentile(currentStats.global_rank)}</span>
            <span className="hero-label">Percentile</span>
          </div>
        </div>
        <div className="hero-stat-box">
          <Group className="hero-icon purple" />
          <div className="hero-details">
            <span className="hero-value">{currentStats.total_xp.toLocaleString()}</span>
            <span className="hero-label">Total XP</span>
          </div>
        </div>
      </div>

      <div className="leaderboard-section">
        <h2>Top 10 Leaderboard</h2>
        <div className="leaderboard-list">
          {displayLeaderboard.map((user) => (
            <div key={user.rank} className={`leaderboard-row ${user.isCurrentUser ? 'current-user' : ''}`}>
              <div className="rank-col">
                {user.rank <= 3 ? (
                  <span className={`rank-badge top-${user.rank}`}>#{user.rank}</span>
                ) : (
                  <span className="rank-number">#{user.rank}</span>
                )}
              </div>
              <div className="user-col">
                <div className="avatar-circle">{user.avatar || user.name.charAt(0).toUpperCase()}</div>
                <span className="user-name">{user.name}</span>
                {user.isCurrentUser && <span className="you-tag">YOU</span>}
              </div>
              <div className="score-col">
                <span className="score-value">{user.score.toLocaleString()} XP</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Rankings;

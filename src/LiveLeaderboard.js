import React, { useState, useEffect } from 'react';
import './LiveLeaderboard.css';
import { 
  FaCrown,
  FaMedal,
  FaFire,
  FaStar,
  FaBolt
} from 'react-icons/fa';
import apiClient from './utils/apiClient';

const LiveLeaderboard = () => {
  const [activeTab, setActiveTab] = useState('global');
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await apiClient('https://untrumpeted-sallie-shallowly.ngrok-free.dev/compiler/leaderboard/global/', 'GET');
        setLeaderboardData(data);
      } catch (error) {
        console.error("Error fetching live leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  // Mock Data
  const mockTopThree = [
    { rank: 1, name: 'AlexCoder99', score: '24,500', avatar: '🦁', title: 'Grandmaster' },
    { rank: 2, name: 'JS_Ninja', score: '22,100', avatar: '🦊', title: 'Master' },
    { rank: 3, name: 'ByteMaster', score: '21,850', avatar: '🦅', title: 'Master' },
  ];

  const mockRestOfList = Array.from({ length: 12 }, (_, i) => ({
    rank: i + 4,
    name: `ProDev_${i + 4}`,
    score: (20000 - (i * 400)).toLocaleString(),
    avatar: '🤖',
    isUser: i + 4 === 12 // Mock the current user at rank 12
  }));

  const apiList = leaderboardData?.leaderboard || [];
  const topThree = apiList.length >= 3 ? apiList.slice(0, 3) : mockTopThree;
  const restOfList = apiList.length > 3 ? apiList.slice(3) : mockRestOfList;

  if (loading) {
    return (
      <div className="lb-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <div style={{ color: '#64748b' }}>Loading live leaderboard...</div>
      </div>
    );
  }

  return (
    <div className="lb-container">
      
      {/* HEADER & TOGGLES */}
      <div className="lb-header-section">
        <div className="lb-title-block">
          <h1 className="lb-title">Live Leaderboard</h1>
          <p className="lb-subtitle">Compete globally and climb the ranks.</p>
        </div>
        
        <div className="lb-toggles">
          <button 
            className={`lb-toggle-btn ${activeTab === 'global' ? 'active' : ''}`}
            onClick={() => setActiveTab('global')}
          >
            Global XP
          </button>
          <button 
            className={`lb-toggle-btn ${activeTab === 'weekly' ? 'active' : ''}`}
            onClick={() => setActiveTab('weekly')}
          >
            Weekly Contest
          </button>
          <button 
            className={`lb-toggle-btn ${activeTab === 'uni' ? 'active' : ''}`}
            onClick={() => setActiveTab('uni')}
          >
            University
          </button>
        </div>
      </div>

      {/* PODIUM SECTION (TOP 3) */}
      <div className="lb-podium-section">
        
        {/* GOLD SPARKLES */}
        <div className="lb-sparkles-container">
          <div className="sparkle s1"></div>
          <div className="sparkle s2"></div>
          <div className="sparkle s3"></div>
          <div className="sparkle s4"></div>
          <div className="sparkle s5"></div>
          <div className="sparkle s6"></div>
          <div className="sparkle s7"></div>
          <div className="sparkle s8"></div>
        </div>

        {/* RANK 2 (Left) */}
        <div className="lb-podium-item lb-rank-2">
          <div className="lb-podium-avatar-wrapper">
            <div className="lb-podium-avatar">{topThree[1].avatar || topThree[1].name.charAt(0).toUpperCase()}</div>
            <div className="lb-podium-rank-badge">2</div>
          </div>
          <h3 className="lb-podium-name">{topThree[1].name}</h3>
          <p className="lb-podium-score">{topThree[1].score} XP</p>
          <div className="lb-podium-base"></div>
        </div>

        {/* RANK 1 (Center) */}
        <div className="lb-podium-item lb-rank-1">
          <div className="lb-podium-avatar-wrapper">
            <div className="lb-podium-avatar">{topThree[0].avatar || topThree[0].name.charAt(0).toUpperCase()}</div>
            <div className="lb-podium-rank-badge"><FaCrown style={{ fontSize: '0.8rem' }} /> 1</div>
          </div>
          <h3 className="lb-podium-name">{topThree[0].name}</h3>
          <p className="lb-podium-score">{topThree[0].score} XP</p>
          <div className="lb-podium-base"></div>
        </div>

        {/* RANK 3 (Right) */}
        <div className="lb-podium-item lb-rank-3">
          <div className="lb-podium-avatar-wrapper">
            <div className="lb-podium-avatar">{topThree[2].avatar || topThree[2].name.charAt(0).toUpperCase()}</div>
            <div className="lb-podium-rank-badge">3</div>
          </div>
          <h3 className="lb-podium-name">{topThree[2].name}</h3>
          <p className="lb-podium-score">{topThree[2].score} XP</p>
          <div className="lb-podium-base"></div>
        </div>

      </div>

      {/* RANKINGS LIST (4+) */}
      <div className="lb-list-section">
        <div className="lb-list-header">
          <div className="lb-col-rank">Rank</div>
          <div className="lb-col-user">User</div>
          <div className="lb-col-badges">Badges</div>
          <div className="lb-col-score" style={{ textAlign: 'right' }}>Score</div>
        </div>

        <div className="lb-list-body">
          {restOfList.map((user) => (
            <div key={user.rank} className={`lb-list-row ${user.isUser ? 'highlight-user' : ''}`}>
              <div className="lb-col-rank">#{user.rank}</div>
              
              <div className="lb-col-user">
                <div className="lb-list-avatar">{user.avatar || user.name.charAt(0).toUpperCase()}</div>
                <div className="lb-list-name">
                  {user.name} {(user.isUser || user.isCurrentUser) && <span style={{ color: '#3b82f6', fontSize: '0.8rem', marginLeft: '6px' }}>(You)</span>}
                </div>
              </div>

              <div className="lb-col-badges">
                {user.rank % 2 === 0 ? <FaFire className="lb-badge-icon" style={{ color: '#ef4444' }} /> : <FaBolt className="lb-badge-icon" style={{ color: '#3b82f6' }} />}
                <FaStar className="lb-badge-icon" />
              </div>

              <div className="lb-col-score">{user.score} XP</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default LiveLeaderboard;

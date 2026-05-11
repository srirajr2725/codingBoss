import React, { useState, useEffect } from 'react';
import {
  FiCamera,
  FiAlertCircle,
  FiRefreshCw,
  FiMonitor,
  FiPower,
  FiLogOut,
  FiGrid
} from 'react-icons/fi';

import './DoctorDashboard.css';

const API_URL = 'https://unlanded-isela-unmunificently.ngrok-free.dev/api/upload-frame/';
const HEAD_SWITCH_LIMIT = 4;

/* ---------------- FIX IMAGE URL ---------------- */

const normalizeFrameSource = (url) => {
  if (!url) return null;

  let fixed = url;

  // convert http to https
  if (fixed.startsWith('http://')) {
    fixed = fixed.replace('http://', 'https://');
  }

  // remove localhost issues
  fixed = fixed.replace('127.0.0.1', 'api.codingboss.in');
  fixed = fixed.replace('localhost', 'api.codingboss.in');

  return fixed;
};

/* ---------------- IMAGE COMPONENT ---------------- */

const AuthorizedImage = ({ src, alt, className }) => {
  const [imgSrc, setImgSrc] = useState(null);

  useEffect(() => {
    if (!src) return;

    const secureUrl = normalizeFrameSource(src);

    setImgSrc(secureUrl);
  }, [src]);

  if (!imgSrc) {
    return (
      <div className="no-feed-placeholder">
        <FiCamera />
        Loading...
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover'
      }}
      onError={(e) => {
        console.log('IMAGE LOAD FAILED:', imgSrc);

        e.target.src =
          'https://dummyimage.com/600x400/111827/ffffff&text=NO+CAMERA';
      }}
    />
  );
};

/* ---------------- MAIN COMPONENT ---------------- */

const DoctorDashboard = ({ handleLogout, username }) => {
  const [activeTests, setActiveTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchActiveTests();

    const interval = setInterval(() => {
      fetchActiveTests();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchActiveTests = async () => {
    try {
      setRefreshing(true);

      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': 'true',
          Accept: 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }

      const data = await response.json();

      console.log('API RESPONSE:', data);

      const sessions = data.sessions || [];

      const now = Date.now();

      const mapped = sessions.map((item) => {
        const latestFrame =
          item.latest_frame_url ||
          item.frame_url ||
          item.image_url ||
          item.image;

        return {
          id: item.student_id,
          name: item.student_name || item.student_id,
          status: item.flagged ? 'Warning' : 'Active',
          latestFrameUrl: normalizeFrameSource(latestFrame),
          lastFrameAt: item.latest_frame_created_at,
          isOffline: item.latest_frame_created_at
            ? now -
                new Date(item.latest_frame_created_at).getTime() >
              30000
            : true,
          headSwitchCount: item.violation_count || 0,
          terminated: item.terminated || false
        };
      });

      console.log('MAPPED SESSIONS:', mapped);

      setActiveTests(
        mapped.filter(
          (s) =>
            !s.terminated &&
            !s.isOffline &&
            s.latestFrameUrl
        )
      );

      setError(null);
    } catch (err) {
      console.error(err);

      setError('Cannot connect to server');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  return (
    <div className="ultra-dashboard">
      <aside className="ultra-sidebar">
        <div className="ultra-logo">
          <div className="logo-icon">
            <FiMonitor />
          </div>

          <div className="logo-text">
            <h3>
              Coding<span>Boss</span>
            </h3>

            <span className="role-tag">
              Ultra Proctor
            </span>
          </div>
        </div>

        <nav className="ultra-nav">
          <div className="nav-item active">
            <FiGrid />
            Command Center
          </div>
        </nav>

        <div className="user-profile-brief">
          <div className="u-avatar">Dr</div>

          <div className="u-info">
            <div className="u-name">
              {username?.split('@')[0]}
            </div>

            <div className="u-status">
              <span className="online-dot"></span>
              Online
            </div>
          </div>

          <button
            className="u-logout-btn"
            onClick={handleLogout}
          >
            <FiLogOut />
          </button>
        </div>
      </aside>

      <main className="ultra-main">
        <header className="ultra-header">
          <div className="header-left">
            <h1 className="ultra-title">
              Proctoring Command Center
            </h1>
          </div>

          <div className="header-actions">
            <button
              className="ultra-btn-refresh"
              onClick={fetchActiveTests}
            >
              <FiRefreshCw
                className={refreshing ? 'spinning' : ''}
              />

              Refresh
            </button>
          </div>
        </header>

        <div className="ultra-content">
          {error && (
            <div className="ultra-error-banner">
              <FiAlertCircle />
              {error}
            </div>
          )}

          {!loading && activeTests.length === 0 && (
            <div className="ultra-empty-state">
              <FiCamera size={48} />

              <h3>No Live Sessions</h3>
            </div>
          )}

          <div className="command-grid">
            <div className="camera-cluster">
              {activeTests.map((student) => (
                <div
                  key={student.id}
                  className="camera-unit"
                >
                  <div className="unit-header">
                    <span className="unit-name">
                      {student.name}
                    </span>

                    <span className="unit-live-badge">
                      🟢 LIVE
                    </span>
                  </div>

                  <div className="unit-display">
                    <div className="feed-view">
                      <AuthorizedImage
                        src={student.latestFrameUrl}
                        alt="Live Feed"
                        className="live-img"
                      />

                      <div className="feed-signal">
                        <FiCamera />
                        LIVE
                      </div>
                    </div>
                  </div>

                  <div className="unit-controls">
                    <div className="unit-meta">
                      <span className="badge-active">
                        {student.status}
                      </span>

                      <span className="badge-warning">
                        Head{' '}
                        {student.headSwitchCount}/
                        {HEAD_SWITCH_LIMIT}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DoctorDashboard;
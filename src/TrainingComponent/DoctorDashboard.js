import React, { useState, useEffect } from 'react';
import {
  FiCamera,
  FiAlertCircle,
  FiRefreshCw,
  FiMonitor,
  FiLogOut,
  FiGrid,
  FiRadio
} from 'react-icons/fi';

import './DoctorDashboard.css';

/* ================= CONFIG ================= */

const API_URL =
  'https://unlanded-isela-unmunificently.ngrok-free.dev/api/upload-frame/';

const DETECTION_API = 
  'https://unlanded-isela-unmunificently.ngrok-free.dev/api/toggle-detection/';

const HEAD_SWITCH_LIMIT = 4;

/* ================= LIVE IMAGE ================= */

/* ================= LIVE IMAGE (SECURE PROXY) ================= */

/* ================= LIVE IMAGE (HYBRID RESILIENT) ================= */

const LiveImage = ({ src, alt, className }) => {
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const getNgrokBase = () => {
    try {
      const url = new URL(API_URL);
      return `${url.protocol}//${url.host}`;
    } catch {
      return 'https://unlanded-isela-unmunificently.ngrok-free.dev';
    }
  };

  useEffect(() => {
    if (!src) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    const fetchImage = async () => {
      setLoading(true);
      setError(false);

      try {
        let targetUrl = src;
        const isDataUri = targetUrl.startsWith('data:');

        if (!isDataUri) {
          const NGROK_BASE = getNgrokBase();
          if (targetUrl.startsWith('/')) {
            targetUrl = `${NGROK_BASE}${targetUrl}`;
          }
          targetUrl = targetUrl.replace('http://', 'https://');
          if (!targetUrl.includes('ngrok-skip-browser-warning')) {
            targetUrl += (targetUrl.includes('?') ? '&' : '?') + 'ngrok-skip-browser-warning=true';
          }
          // Dynamic Cache Buster
          targetUrl += `&cb=${Date.now()}`;
        }

        console.log(`[LiveImage] Fetching: ${targetUrl.slice(0, 80)}...`);

        if (isDataUri) {
          if (isMounted) {
            setBlobUrl(targetUrl);
            setLoading(false);
          }
          return;
        }

        // Use fetch for more reliable ngrok header handling
        const response = await fetch(targetUrl, {
          signal: controller.signal,
          mode: 'cors',
          credentials: 'omit',
          headers: { 'ngrok-skip-browser-warning': 'true' }
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const blob = await response.blob();
        if (blob.size < 100) throw new Error('Empty or invalid image');

        const url = URL.createObjectURL(blob);

        if (isMounted) {
          if (blobUrl && !blobUrl.startsWith('data:')) URL.revokeObjectURL(blobUrl);
          setBlobUrl(url);
          setLoading(false);
        }
      } catch (err) {
        if (err.name !== 'AbortError' && isMounted) {
          console.warn('[LiveImage] Error:', err.message);
          setError(true);
          setLoading(false);
          // Auto-retry once after 2 seconds
          if (retryCount < 1) {
            setTimeout(() => {
              if (isMounted) setRetryCount(prev => prev + 1);
            }, 2000);
          }
        }
      }
    };

    fetchImage();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [src, retryCount]);

  if (!src || (error && !blobUrl)) {
    return (
      <div className="no-feed-placeholder" style={{ background: '#111', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <FiAlertCircle size={20} color="#ff4d4d" />
        <span style={{ marginTop: '8px', fontSize: '10px', color: '#fff', textAlign: 'center', padding: '0 5px' }}>
          {error ? 'FEED ERROR' : 'OFFLINE'}
        </span>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#000', overflow: 'hidden' }}>
      {loading && !blobUrl && (
        <div className="no-feed-placeholder" style={{ position: 'absolute', inset: 0, background: '#111', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div className="ultra-spinner" style={{ width: '24px', height: '24px' }}></div>
          <span style={{ marginTop: '8px', fontSize: '10px', color: '#fff' }}>SYNCING...</span>
        </div>
      )}
      {blobUrl && (
        <img
          src={blobUrl}
          alt={alt}
          className={className}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '4px',
            opacity: loading ? 0.6 : 1,
            transition: 'opacity 0.2s ease-in-out'
          }}
        />
      )}
    </div>
  );
};

/* ================= MAIN COMPONENT ================= */

const DoctorDashboard = ({
  handleLogout,
  username
}) => {
  const [activeTests, setActiveTests] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState(null);

  const [detectionStates, setDetectionStates] = useState({});
  const [detectionLoading, setDetectionLoading] = useState({});

  // ── GLOBAL AI LOCKDOWN ──
  useEffect(() => {
    document.body.classList.add('hide-global-ai');
    return () => document.body.classList.remove('hide-global-ai');
  }, []);

  const toggleDetection = async (studentId) => {
    const currentState = !!detectionStates[studentId];
    // Optimistic Update: Change UI immediately
    setDetectionStates(prev => ({ ...prev, [studentId]: !currentState }));
    setDetectionLoading(prev => ({ ...prev, [studentId]: true }));
    
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("user_token");
      const url = DETECTION_API;
      
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          'Accept': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ 
          user_id: studentId,
          student_id: studentId,
          enabled: !currentState 
        })
      });
      
      if (!res.ok) {
        // Revert on failure
        setDetectionStates(prev => ({ ...prev, [studentId]: currentState }));
        console.error('Toggle detection failed:', res.status);
      }
    } catch (err) {
      // Revert on error
      setDetectionStates(prev => ({ ...prev, [studentId]: currentState }));
      console.error('Toggle detection error:', err);
    } finally {
      setDetectionLoading(prev => ({ ...prev, [studentId]: false }));
    }
  };

  /* ================= FETCH API ================= */

  const fetchActiveTests =
    async () => {
      try {
        setRefreshing(true);

        const token = localStorage.getItem("token") || localStorage.getItem("user_token");
        const secureApiUrl = API_URL.replace('http://', 'https://');
        const response = await fetch(secureApiUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'ngrok-skip-browser-warning': 'true',
            'Authorization': token ? `Bearer ${token}` : ''
          }
        });

        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status}`
          );
        }

        const data =
          await response.json();

        console.log(
          'API RESPONSE:',
          data
        );

        const sessions = data.sessions
          ? data.sessions
          : Array.isArray(data)
            ? data
            : (data.results || data.frames || data.data || []);

        const now = Date.now();

        const mapped = sessions.map(
          (item) => ({
            id: item.student_id || item.user_id || item.id,

            name:
              item.student_name ||
              item.student_id ||
              item.user_id ||
              'Student',

            status: item.terminated
              ? 'Terminated'
              : item.flagged
                ? 'Warning'
                : 'Active',

            /* ✅ USE URL IMAGE WITH BASE64 FALLBACK */

            latestFrame: item.latest_frame_url || item.latest_frame || item.image,

            lastFrameAt:
              item.latest_frame_created_at,

            isOffline:
              item.latest_frame_created_at
                ? now -
                new Date(
                  item.latest_frame_created_at
                ).getTime() >
                180000 // 3 minutes
                : false, // Don't hide if timestamp missing

            headSwitchCount:
              item.violation_count || 0,

            terminated:
              item.terminated || false,

            isDetectionEnabled: item.is_detection_enabled
          })
        );

        // Sync local detection states ONLY if provided by API (prevent "automatically off" on missing fields)
        setDetectionStates(prev => {
          const next = { ...prev };
          mapped.forEach(s => {
            if (s.isDetectionEnabled !== undefined && s.isDetectionEnabled !== null) {
              next[s.id] = s.isDetectionEnabled;
            }
          });
          return next;
        });

        console.log(
          'MAPPED SESSIONS:',
          mapped
        );

        setActiveTests(
          mapped.filter(
            (s) => !s.isOffline && s.latestFrame
          )
        );

        setError(null);
      } catch (err) {
        console.error(
          'FETCH ERROR:',
          err
        );

        setError(
          'Cannot connect to server'
        );
      } finally {
        setRefreshing(false);
        setLoading(false);
      }
    };

  /* ================= AUTO REFRESH ================= */

  useEffect(() => {
    fetchActiveTests();

    const interval = setInterval(() => {
      fetchActiveTests();
    }, 5000);

    return () =>
      clearInterval(interval);
  }, []);

  /* ================= UI ================= */

  return (
    <div className="ultra-dashboard">
      {/* SIDEBAR */}

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
          <div className="u-avatar">
            Dr
          </div>

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

      {/* MAIN */}

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
              <FiRefreshCw className={refreshing ? 'spinning' : ''} />
              Refresh
            </button>
          </div>
        </header>

        <div className="ultra-content">
          {/* ERROR */}

          {error && (
            <div className="ultra-error-banner">
              <FiAlertCircle />
              {error}
            </div>
          )}

          {/* EMPTY */}

          {!loading && activeTests.length === 0 && (
            <div className="ultra-empty-state">
              <FiCamera size={48} />
              <h3>No Live Sessions</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                Waiting for student feeds...
              </p>
            </div>
          )}

          {/* CAMERA GRID */}

          <div className="command-grid">
            <div className="camera-cluster">
              {activeTests.map(
                (student) => (
                    <div
                      key={student.id}
                      className="camera-unit"
                    >
                      {/* Violation Alert Removed as requested */}
                    {/* HEADER */}

                    <div className="unit-header">
                      <span className="unit-name">
                        {
                          student.name
                        }
                      </span>
                    </div>

                    {/* VIDEO */}

                    <div className="unit-display">
                      <div className="feed-view">
                        <LiveImage
                          src={
                            student.latestFrame
                          }
                          alt="Live Feed"
                          className="live-img"
                        />

                        <div className="feed-signal">
                          <FiCamera />
                          LIVE
                        </div>
                      </div>
                    </div>

                    {/* FOOTER */}

                    <div className="unit-controls" style={{ padding: '12px 20px' }}>
                      <button
                        className={`ultra-btn-detect ${detectionStates[student.id] ? 'detect-on' : 'detect-off'}`}
                        onClick={() => toggleDetection(student.id)}
                        disabled={detectionLoading[student.id]}
                        style={{ width: '100%', justifyContent: 'center', padding: '8px' }}
                      >
                        <FiRadio className={detectionStates[student.id] ? 'detect-pulse' : ''} />
                        {detectionLoading[student.id] ? '...' : detectionStates[student.id] ? 'Detection ON' : 'Detect Student'}
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DoctorDashboard;
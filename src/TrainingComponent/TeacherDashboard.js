import React, { useState, useEffect } from 'react';
import {
  FiCamera, FiAlertCircle, FiXCircle, FiRefreshCw,
  FiMonitor, FiPower, FiSettings, FiLogOut, FiGrid, FiRadio
} from 'react-icons/fi';
import './DoctorDashboard.css'; // Reuse the ultra-modern proctoring styles
import { normalizeFrameSource } from '../utils/frameSource';

const API_URL = 'https://unlanded-isela-unmunificently.ngrok-free.dev/api/upload-frame/';
const DETECTION_API = 'https://unlanded-isela-unmunificently.ngrok-free.dev/api/toggle-detection/';

const getFrameSource = (frame) => {
  return frame?.latest_frame_url || frame?.frame_url || frame?.image_url || frame?.image || null;
};

const getFrameTime = (frame) => (
  frame?.latest_frame_created_at || frame?.created_at || frame?.timestamp || frame?.started_at || null
);

// Fetches image URLs with the ngrok bypass header and supports base64 frame payloads.
const AuthorizedImage = ({ src, alt, className }) => {
  const [displaySrc, setDisplaySrc] = useState(null);

  useEffect(() => {
    if (!src) return;

    if (src.startsWith('data:')) {
      setDisplaySrc(src);
      return;
    }

    const secureSrc = normalizeFrameSource(src);
    let objectUrl = null;
    let isMounted = true;
    setDisplaySrc(secureSrc);

    fetch(secureSrc, { headers: { 'ngrok-skip-browser-warning': 'true' } })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.blob();
      })
      .then(blob => {
        if (isMounted) {
          objectUrl = URL.createObjectURL(blob);
          setDisplaySrc(objectUrl);
        }
      })
      .catch(() => {
        if (isMounted) setDisplaySrc(secureSrc);
      });

    return () => {
      isMounted = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);

  if (!displaySrc) return <div className="no-feed-placeholder"><FiCamera /> Loading...</div>;
  return <img src={displaySrc} alt={alt} className={className} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => displaySrc !== src && setDisplaySrc(src)} />;
};

const TeacherDashboard = ({ handleLogout, username }) => {
  const [activeTests, setActiveTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [detectionStates, setDetectionStates] = useState({});
  const [detectionLoading, setDetectionLoading] = useState({});

  useEffect(() => {
    fetchActiveTests();
    // Auto-refresh every 10 seconds to get the latest frames
    const interval = setInterval(fetchActiveTests, 10000);
    return () => clearInterval(interval);
  }, []);

  const toggleDetection = async (studentId) => {
    const currentState = !!detectionStates[studentId];
    // Optimistic Update: Change UI immediately
    setDetectionStates(prev => ({ ...prev, [studentId]: !currentState }));
    setDetectionLoading(prev => ({ ...prev, [studentId]: true }));

    try {
      const token = localStorage.getItem("token") || localStorage.getItem("user_token");
      
      const res = await fetch(DETECTION_API, {
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
        console.error('Toggle Error:', res.status);
      }
    } catch (err) {
      // Revert on error
      setDetectionStates(prev => ({ ...prev, [studentId]: currentState }));
      console.error('Toggle Error:', err);
    } finally {
      setDetectionLoading(prev => ({ ...prev, [studentId]: false }));
    }
  };

  const fetchActiveTests = async () => {
    setRefreshing(true);
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("user_token");
      const res = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Accept': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });

      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      const data = await res.json();

      const list = data.sessions
        ? data.sessions
        : Array.isArray(data) ? data : data.results || data.frames || data.data || [];

      const now = Date.now();
      const OFFLINE_THRESHOLD_MS = 30 * 1000;

      // Group by student to show them as unique "Units"
      const studentMap = list.reduce((acc, r) => {
        const key = String(r.student_id || r.user_id || r.id);
        const frameSource = getFrameSource(r);
        const frameTime = getFrameTime(r);
        if (!acc[key]) {
          acc[key] = {
            id: key,
            name: r.student_name || `Student #${key}`,
            test: 'Active Exam',
            status: r.flagged ? 'Warning' : 'Active',
            camera: 'Active',
            latestFrame: frameSource,
            timestamp: frameTime,
            lastFrameAt: frameTime,
            headSwitchCount: r.violation_count || 0,
            detectionEnabled: r.detection_enabled || false,
            isOffline: frameTime
              ? (now - new Date(frameTime).getTime()) > OFFLINE_THRESHOLD_MS
              : false,
            allFrames: []
          };
        }
        acc[key].allFrames.push(r);
        if (r.flagged) acc[key].status = 'Warning';
        if (frameTime && (!acc[key].lastFrameAt || new Date(frameTime) > new Date(acc[key].lastFrameAt))) {
          acc[key].latestFrame = frameSource;
          acc[key].timestamp = frameTime;
          acc[key].lastFrameAt = frameTime;
          acc[key].isOffline = (now - new Date(frameTime).getTime()) > OFFLINE_THRESHOLD_MS;
        }
        return acc;
      }, {});

      const mappedList = Object.values(studentMap);
      
      // Sync detection states
      const newDetectionStates = {};
      mappedList.forEach(s => {
        newDetectionStates[s.id] = s.detectionEnabled;
      });
      setDetectionStates(prev => ({ ...prev, ...newDetectionStates }));

      setActiveTests(mappedList.filter(s => s.camera === 'Active' && !s.isOffline && s.latestFrame));
      setError(null);
    } catch (err) {
      console.error('Fetch Error:', err);
      setError('Failed to sync with proctoring server.');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const liveTests = activeTests.filter(s => s.camera === 'Active' && !s.isOffline && s.latestFrame);

  return (
    <div className="ultra-dashboard">
      {/* Sidebar - Consistent with Doctor but labeled Teacher */}
      <aside className="ultra-sidebar">
        <div className="ultra-logo">
          <div className="logo-icon"><FiMonitor /></div>
          <div className="logo-text">
            <h3>Coding<span>Boss</span></h3>
            <span className="role-tag">Teacher Portal</span>
          </div>
        </div>

        <nav className="ultra-nav">
          <div className="nav-item active"><FiGrid /> Proctoring Center</div>
        </nav>

        <div className="user-profile-brief">
          <div className="u-avatar">Tr</div>
          <div className="u-info">
            <div className="u-name">{username.split('@')[0]}</div>
            <div className="u-status"><span className="online-dot"></span> Online</div>
          </div>
          <button className="u-logout-btn" onClick={handleLogout}><FiLogOut /></button>
        </div>
      </aside>

      {/* Main Command Center */}
      <main className="ultra-main">
        <header className="ultra-header">
          <div className="header-left">
            <h1 className="ultra-title">Teacher Proctoring Center</h1>
            <div className="system-status-pills">
              <span className="pill green">System: Optimal</span>
              <span className="pill blue">Live Sessions: {liveTests.length}</span>
              <span className="pill amber">Network: {refreshing ? 'Syncing...' : 'Stable'}</span>
            </div>
          </div>
          <div className="header-actions">
            <button className="ultra-btn-refresh" onClick={() => fetchActiveTests()} disabled={refreshing}>
              <FiRefreshCw className={refreshing ? 'spinning' : ''} />
              Update Feeds
            </button>
          </div>
        </header>

        <div className="ultra-content">
          {error && (
            <div className="ultra-error-banner">
              <FiAlertCircle /> {error}
            </div>
          )}

          {!loading && liveTests.length === 0 && (
            <div className="ultra-empty-state">
              <FiCamera size={48} />
              <h3>No Live Student Sessions</h3>
              <p>Live proctoring feeds will appear here once students begin streaming.</p>
            </div>
          )}

          <div className="command-grid">
            {/* Live Camera Cluster */}
            <div className="camera-cluster">
              {liveTests.map(s => (
                <div key={s.id} className={`camera-unit ${(s.status === 'Warning' || (s.headSwitchCount || 0) > 0) ? 'unit-flagged' : ''} ${s.isOffline || s.camera === 'Inactive' ? 'unit-offline' : ''}`}>
                  {(s.status === 'Warning' || (s.headSwitchCount || 0) > 0) && (
                    <div className="violation-overlay">
                      <FiAlertCircle />
                      <span>VIOLATION DETECTED</span>
                    </div>
                  )}
                  <div className="unit-header">
                    <span className="unit-name">{s.name}</span>
                    {s.status === 'Warning' && <span className="unit-request-flash">⚠️ ALERT</span>}
                  </div>

                  <div className="unit-display">
                    <div className="feed-view">
                      {s.latestFrame ? (
                        <AuthorizedImage
                          src={s.latestFrame}
                          alt="Live Feed"
                          className="live-img"
                        />
                      ) : (
                        <div className="no-feed-placeholder">
                          <FiCamera /> No Feed
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="unit-controls" style={{ padding: '12px 20px' }}>
                    <button
                      className={`ultra-btn-detect ${detectionStates[s.id] ? 'detect-on' : 'detect-off'}`}
                      onClick={() => toggleDetection(s.id)}
                      disabled={detectionLoading[s.id]}
                      style={{ width: '100%', justifyContent: 'center', padding: '8px' }}
                    >
                      <FiRadio className={detectionStates[s.id] ? 'detect-pulse' : ''} />
                      {detectionLoading[s.id] ? '...' : detectionStates[s.id] ? 'Detection ON' : 'Detect Student'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Detail Overlay (Conditional) */}
            {selectedStudent && (
              <div className="dd-detail-overlay">
                <div className="dd-detail-modal">
                  <div className="dd-detail-header">
                    <h4>Detailed View: {selectedStudent.name}</h4>
                    <button onClick={() => setSelectedStudent(null)}><FiXCircle /></button>
                  </div>
                  <div className="dd-detail-metrics">
                    <div className="metric"><span>ID:</span> <b>{selectedStudent.id}</b></div>
                    <div className="metric"><span>Latest Flag:</span> <b className={selectedStudent.status.toLowerCase()}>{selectedStudent.status}</b></div>
                    <div className="metric"><span>Frames Captured:</span> <b>{selectedStudent.allFrames?.length || 0}</b></div>
                    <div className="metric"><span>Last Seen:</span> <b>{selectedStudent.lastFrameAt ? new Date(selectedStudent.lastFrameAt).toLocaleTimeString() : '-'}</b></div>
                    <div className="metric"><span>Camera:</span> <b>{selectedStudent.camera}</b></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;

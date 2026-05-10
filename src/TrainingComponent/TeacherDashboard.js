import React, { useState, useEffect } from 'react';
import { 
  FiCamera, FiAlertCircle, FiXCircle, FiRefreshCw, 
  FiMonitor, FiPower, FiSettings, FiLogOut, FiGrid
} from 'react-icons/fi';
import './DoctorDashboard.css'; // Reuse the ultra-modern proctoring styles

const API_URL = 'https://unlanded-isela-unmunificently.ngrok-free.dev/api/upload-frame/';

const getFrameSource = (frame) => {
  const source = frame?.latest_frame_url || frame?.frame_url || frame?.image_url || frame?.image || null;
  if (!source || typeof source !== 'string') return null;
  if (source.startsWith('data:') || source.startsWith('http://') || source.startsWith('https://')) {
    return source;
  }
  return `data:image/jpeg;base64,${source}`;
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

    const secureSrc = src.replace(/^http:\/\//i, 'https://');
    let objectUrl = null;
    let isMounted = true;

    fetch(secureSrc, { headers: { 'ngrok-skip-browser-warning': '1' } })
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
  return <img src={displaySrc} alt={alt} className={className} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
};

const TeacherDashboard = ({ handleLogout, username }) => {
  const [activeTests, setActiveTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchActiveTests();
    // Auto-refresh every 10 seconds to get the latest frames
    const interval = setInterval(fetchActiveTests, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchActiveTests = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Accept': 'application/json',
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

      setActiveTests(Object.values(studentMap).filter(s => s.camera === 'Active' && !s.isOffline && s.latestFrame));
      setError(null);
    } catch (err) {
      console.error('Fetch Error:', err);
      setError('Failed to sync with proctoring server.');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const handleMonitorStudent = (student) => {
    setSelectedStudent(student);
  };

  const handleDeactivateCamera = (studentId) => {
    if (window.confirm("Are you sure you want to approve camera deactivation for this student?")) {
      setActiveTests(prev => prev.map(s => 
        s.id === studentId ? { ...s, camera: 'Inactive' } : s
      ));
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
                <div key={s.id} className={`camera-unit ${s.status === 'Warning' ? 'unit-flagged' : ''} ${s.isOffline || s.camera === 'Inactive' ? 'unit-offline' : ''}`}>
                  <div className="unit-header">
                    <span className="unit-name">{s.name}</span>
                    {s.isOffline || s.camera === 'Inactive' ? (
                      <span className="unit-offline-badge">OFFLINE</span>
                    ) : s.status === 'Warning' ? (
                      <span className="unit-request-flash">VIOLATION</span>
                    ) : (
                      <span className="unit-live-badge">LIVE</span>
                    )}
                  </div>
                  
                  <div className="unit-display">
                    {s.isOffline || s.camera === 'Inactive' ? (
                      <div className="offline-view">
                        <FiPower className="off-icon" />
                        <span>{s.camera === 'Inactive' ? 'FEED TERMINATED' : 'FEED OFFLINE'}</span>
                        {s.lastFrameAt && (
                          <span style={{ fontSize: '0.7rem', opacity: 0.6, marginTop: 4 }}>
                            Last seen: {new Date(s.lastFrameAt).toLocaleTimeString()}
                          </span>
                        )}
                      </div>
                    ) : (
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
                        <div className="feed-signal"><FiCamera /> LIVE</div>
                        <div className="feed-metadata">
                          <span className="f-exam">{s.test}</span>
                          <span className="f-fps">Auto-Sync</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="unit-controls">
                    <div className="unit-meta">
                      <span className={`badge-${s.status.toLowerCase()}`}>{s.status}</span>
                    </div>
                    <div className="unit-btns">
                      {s.camera === 'Active' && !s.isOffline && (
                        <button className="btn-deactivate" onClick={() => handleDeactivateCamera(s.id)}>
                          INACTIVE
                        </button>
                      )}
                      <button className="btn-details" onClick={() => handleMonitorStudent(s)}>
                        <FiSettings />
                      </button>
                    </div>
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

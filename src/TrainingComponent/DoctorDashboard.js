import React, { useState, useEffect } from 'react';
import { 
  FiCamera, FiUser, FiAlertCircle, FiXCircle, FiRefreshCw, 
  FiMonitor, FiPower, FiClock, FiSettings, FiLogOut, FiGrid
} from 'react-icons/fi';
import apiClient from '../utils/apiClient';
import './DoctorDashboard.css';

const API_URL = 'https://unlanded-isela-unmunificently.ngrok-free.dev/api/upload-frame/';

const DoctorDashboard = ({ handleLogout, username }) => {
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
      
      const list = Array.isArray(data)
        ? data
        : data.results || data.frames || data.data || [];

      // Group by student to show them as unique "Units"
      const studentMap = list.reduce((acc, r) => {
        const key = String(r.student_id);
        if (!acc[key]) {
          acc[key] = {
            id: key,
            name: r.student_name || `Student #${key}`,
            test: 'Active Exam', // Could be dynamic if backend provides test name
            status: r.flagged ? 'Warning' : 'Active',
            camera: 'Active',
            request: null, // This would need a specific backend flag for "Request Inactive"
            latestFrame: r.image,
            timestamp: r.timestamp,
            allFrames: []
          };
        }
        acc[key].allFrames.push(r);
        // If any frame is flagged, the status is Warning
        if (r.flagged) acc[key].status = 'Warning';
        // Always keep the latest image
        if (new Date(r.timestamp) > new Date(acc[key].timestamp)) {
          acc[key].latestFrame = r.image;
          acc[key].timestamp = r.timestamp;
        }
        return acc;
      }, {});

      setActiveTests(Object.values(studentMap));
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
      // In a real app, you would send a POST to the backend to update the student's status
    }
  };

  return (
    <div className="ultra-dashboard">
      {/* Sidebar - Ultra Sleek */}
      <aside className="ultra-sidebar">
        <div className="ultra-logo">
          <div className="logo-icon"><FiMonitor /></div>
          <div className="logo-text">
            <h3>Coding<span>Boss</span></h3>
            <span className="role-tag">Ultra Proctor</span>
          </div>
        </div>

        <nav className="ultra-nav">
          <div className="nav-item active"><FiGrid /> Command Center</div>
        </nav>

        <div className="user-profile-brief">
          <div className="u-avatar">Dr</div>
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
            <h1 className="ultra-title">Proctoring Command Center</h1>
            <div className="system-status-pills">
              <span className="pill green">System: Optimal</span>
              <span className="pill blue">Nodes: {activeTests.length} Active</span>
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

          {!loading && activeTests.length === 0 && (
            <div className="ultra-empty-state">
              <FiCamera size={48} />
              <h3>No Active Sessions</h3>
              <p>Waiting for students to begin their exams...</p>
            </div>
          )}

          <div className="command-grid">
            {/* Live Camera Cluster */}
            <div className="camera-cluster">
              {activeTests.map(s => (
                <div key={s.id} className={`camera-unit ${s.status === 'Warning' ? 'unit-flagged' : ''} ${s.camera === 'Inactive' ? 'unit-offline' : ''}`}>
                  <div className="unit-header">
                    <span className="unit-name">{s.name}</span>
                    {s.status === 'Warning' && (
                      <span className="unit-request-flash">VIOLATION</span>
                    )}
                  </div>
                  
                  <div className="unit-display">
                    {s.camera === 'Active' ? (
                      <div className="feed-view">
                        {s.latestFrame ? (
                          <img 
                            src={s.latestFrame.startsWith('data:') ? s.latestFrame : `data:image/jpeg;base64,${s.latestFrame}`} 
                            alt="Feed" 
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
                    ) : (
                      <div className="offline-view">
                        <FiPower className="off-icon" />
                        <span>FEED TERMINATED</span>
                      </div>
                    )}
                  </div>

                  <div className="unit-controls">
                    <div className="unit-meta">
                      <span className={`badge-${s.status.toLowerCase()}`}>{s.status}</span>
                    </div>
                    <div className="unit-btns">
                      {s.camera === 'Active' && (
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
                    <div className="metric"><span>Last Seen:</span> <b>{new Date(selectedStudent.timestamp).toLocaleTimeString()}</b></div>
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

export default DoctorDashboard;

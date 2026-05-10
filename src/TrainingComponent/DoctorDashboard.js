import React, { useState, useEffect } from 'react';
import { 
  FiCamera, FiAlertCircle, FiXCircle, FiRefreshCw, 
  FiMonitor, FiPower, FiLogOut, FiGrid
} from 'react-icons/fi';
import './DoctorDashboard.css';

const API_URL = 'https://api.codingboss.in/api/upload-frame/';
const HEAD_SWITCH_LIMIT = 4;

const getViolationType = (frame) => String(frame?.violation_type || frame?.violationType || '').toLowerCase();
const getViolationMessage = (frame) => String(frame?.violation_message || frame?.message || frame?.reason || '').toLowerCase();
const getViolationCount = (frame) => Number(frame?.violation_count || frame?.violationCount || 0);
const hasViolationData = (frame) => Boolean(frame?.flagged || getViolationType(frame) || getViolationMessage(frame) || getViolationCount(frame));
const isHeadSwitchFrame = (frame) => {
  const type = getViolationType(frame);
  const message = getViolationMessage(frame);
  return type === 'head_switch'
    || type === 'head_rotation'
    || message.includes('head')
    || message.includes('looking away')
    || (frame?.flagged && !type && !message);
};

// Fetches image with ngrok bypass header and renders as blob URL
const AuthorizedImage = ({ src, alt, className }) => {
  const [blobUrl, setBlobUrl] = useState(null);

  useEffect(() => {
    if (!src) return;
    const secureSrc = src.replace(/^http:\/\//i, 'https://');
    let objectUrl = null;
    let isMounted = true;

    fetch(secureSrc, { headers: {  } })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.blob();
      })
      .then(blob => {
        if (isMounted) {
          objectUrl = URL.createObjectURL(blob);
          setBlobUrl(objectUrl);
        }
      })
      .catch(err => {
        if (isMounted) setBlobUrl(secureSrc); // fallback to direct src
      });

    return () => {
      isMounted = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);

  if (!blobUrl) return <div className="no-feed-placeholder"><FiCamera /> Loading…</div>;
  return <img src={blobUrl} alt={alt} className={className} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
};

const DoctorDashboard = ({ handleLogout, username }) => {
  const [activeTests, setActiveTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [detectingStudentId, setDetectingStudentId] = useState(null);
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
          
          'Accept': 'application/json',
        }
      });
      
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      const data = await res.json();

      // Parse the sessions format: { sessions: [...] }
      const list = data.sessions
        ? data.sessions
        : Array.isArray(data) ? data : data.results || data.frames || data.data || [];

      const now = Date.now();
      const OFFLINE_THRESHOLD_MS = 30 * 1000; // 30 seconds — no frame = offline

      // Map sessions to student units
      const studentMap = list.reduce((acc, r) => {
        const key = String(r.student_id);
        if (!acc[key]) {
          acc[key] = {
            id: key,
            name: r.student_name || `Student #${key}`,
            test: 'Active Exam',
            status: r.flagged ? 'Warning' : 'Active',
            camera: 'Active',
            latestFrameUrl: r.latest_frame_url || null,
            startedAt: r.started_at,
            lastFrameAt: r.latest_frame_created_at,
            isOffline: r.latest_frame_created_at
              ? (now - new Date(r.latest_frame_created_at).getTime()) > OFFLINE_THRESHOLD_MS
              : false,
            headSwitchCount: 0,
            terminated: Boolean(r.terminated),
            allFrames: []
          };
        }
        acc[key].allFrames.push(r);
        if (r.flagged) acc[key].status = 'Warning';
        if (isHeadSwitchFrame(r)) {
          const reportedCount = getViolationCount(r);
          acc[key].headSwitchCount = Math.max(acc[key].headSwitchCount, reportedCount || acc[key].headSwitchCount + 1);
        }
        if (r.terminated || acc[key].headSwitchCount >= HEAD_SWITCH_LIMIT) {
          acc[key].terminated = true;
          acc[key].status = 'Terminated';
          acc[key].camera = 'Inactive';
        }
        // Update to latest frame URL if newer
        if (r.latest_frame_created_at && (!acc[key].lastFrameAt || new Date(r.latest_frame_created_at) > new Date(acc[key].lastFrameAt))) {
          acc[key].latestFrameUrl = r.latest_frame_url;
          acc[key].lastFrameAt = r.latest_frame_created_at;
          acc[key].isOffline = (now - new Date(r.latest_frame_created_at).getTime()) > OFFLINE_THRESHOLD_MS;
        }
        return acc;
      }, {});

      setActiveTests(Object.values(studentMap).filter(s => !s.terminated && s.camera === 'Active' && !s.isOffline && s.latestFrameUrl));
      setError(null);
    } catch (err) {
      console.error('Fetch Error:', err);
      setError('Failed to sync with proctoring server.');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const handleDetectStudent = async (student) => {
    setDetectingStudentId(student.id);
    try {
      const res = await fetch(API_URL, {
        method: 'GET',
        headers: {
          
          'Accept': 'application/json',
        }
      });

      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      const data = await res.json();
      const list = data.sessions || data;
      const studentFrames = list.filter(r => String(r.student_id) === String(student.id));
      const framesToCheck = studentFrames.length ? studentFrames : (student.allFrames || []);
      
      let doctorDetectCount = 0;
      let doctorUndetectCount = 0;
      framesToCheck.forEach(frame => {
        if (frame.violation_type === 'doctor_detect') doctorDetectCount += 1;
        if (frame.violation_type === 'doctor_undetect') doctorUndetectCount += 1;
      });

      const effectiveDetects = Math.max(0, doctorDetectCount - doctorUndetectCount);
      const newDetectCount = effectiveDetects + 1;
      const terminated = newDetectCount >= HEAD_SWITCH_LIMIT;

      await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          
        },
        body: JSON.stringify({
          student_id: Number(student.id),
          image: "data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
          flagged: true,
          violation_type: 'doctor_detect',
          violation_message: terminated ? 'Doctor terminated the exam.' : `Doctor warning #${newDetectCount}`,
          violation_count: newDetectCount,
          terminated: terminated
        })
      });

      const detected = {
        ...student,
        headSwitchCount: newDetectCount,
        terminated,
        status: terminated ? 'Terminated' : 'Warning',
        camera: terminated ? 'Inactive' : student.camera
      };

      setActiveTests(prev => terminated
        ? prev.filter(s => s.id !== student.id)
        : prev.map(s => s.id === student.id ? detected : s)
      );
    } catch (err) {
      console.error('Detect Error:', err);
    } finally {
      setDetectingStudentId(null);
    }
  };

  const handleUndetectStudent = async (student) => {
    setDetectingStudentId(student.id);
    try {
      const res = await fetch(API_URL, {
        method: 'GET',
        headers: {
          
          'Accept': 'application/json',
        }
      });
      const data = await res.json();
      const list = data.sessions || data;
      const studentFrames = list.filter(r => String(r.student_id) === String(student.id));
      const framesToCheck = studentFrames.length ? studentFrames : (student.allFrames || []);
      
      let doctorDetectCount = 0;
      let doctorUndetectCount = 0;
      framesToCheck.forEach(frame => {
        if (frame.violation_type === 'doctor_detect') doctorDetectCount += 1;
        if (frame.violation_type === 'doctor_undetect') doctorUndetectCount += 1;
      });

      const effectiveDetects = Math.max(0, doctorDetectCount - doctorUndetectCount);
      if (effectiveDetects === 0) {
        setDetectingStudentId(null);
        return;
      }

      const newEffectiveDetects = effectiveDetects - 1;

      await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          
        },
        body: JSON.stringify({
          student_id: Number(student.id),
          image: "data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", 
          flagged: false,
          violation_type: 'doctor_undetect',
          violation_message: 'Doctor cleared a warning.',
          violation_count: newEffectiveDetects,
          terminated: false
        })
      });

      const undetected = {
        ...student,
        headSwitchCount: newEffectiveDetects,
        terminated: false,
        status: newEffectiveDetects > 0 ? 'Warning' : 'Active',
      };

      setActiveTests(prev => prev.map(s => s.id === student.id ? undetected : s));
    } catch (err) {
      console.error('Undetect Error:', err);
    } finally {
      setDetectingStudentId(null);
    }
  };

  const liveTests = activeTests.filter(s => !s.terminated && s.camera === 'Active' && !s.isOffline && s.latestFrameUrl);

  return (
    <div className="ultra-dashboard">
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

      <main className="ultra-main">
        <header className="ultra-header">
          <div className="header-left">
            <h1 className="ultra-title">Proctoring Command Center</h1>
            <div className="system-status-pills">
              <span className="pill green">System: Optimal</span>
              <span className="pill blue">Nodes: {liveTests.length} Live</span>
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
              <h3>No Live Sessions</h3>
              <p>Live proctoring feeds will appear here once students begin streaming.</p>
            </div>
          )}

          <div className="command-grid">
            <div className="camera-cluster">
              {liveTests.map(s => (
                <div key={s.id} className={`camera-unit ${s.status === 'Warning' ? 'unit-flagged' : ''}`}>
                  <div className="unit-header">
                    <span className="unit-name">{s.name}</span>
                    {s.isOffline ? (
                      <span className="unit-offline-badge">⚫ OFFLINE</span>
                    ) : s.status === 'Warning' ? (
                      <span className="unit-request-flash">VIOLATION</span>
                    ) : (
                      <span className="unit-live-badge">🟢 LIVE</span>
                    )}
                  </div>
                  
                  <div className="unit-display">
                      {s.isOffline ? (
                      <div className="offline-view">
                        <FiPower className="off-icon" />
                        <span>FEED OFFLINE</span>
                        {s.lastFrameAt && (
                          <span style={{ fontSize: '0.7rem', opacity: 0.6, marginTop: 4 }}>
                            Last seen: {new Date(s.lastFrameAt).toLocaleTimeString()}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="feed-view">
                        {s.latestFrameUrl ? (
                          <AuthorizedImage
                            src={s.latestFrameUrl}
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
                      <span className={s.headSwitchCount ? 'badge-warning' : 'badge-active'}>
                        Head {s.headSwitchCount || 0}/{HEAD_SWITCH_LIMIT}
                      </span>
                    </div>
                      <div className="unit-btns" style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="btn-deactivate"
                          onClick={() => handleDetectStudent(s)}
                          disabled={detectingStudentId === s.id}
                        >
                          {detectingStudentId === s.id ? 'CHECKING' : 'DETECT'}
                        </button>
                        <button
                          className="btn-deactivate"
                          style={{ background: '#3b82f6', borderColor: '#3b82f6' }}
                          onClick={() => handleUndetectStudent(s)}
                          disabled={detectingStudentId === s.id || (s.headSwitchCount || 0) === 0}
                        >
                          UNDETECT
                        </button>
                      </div>
                  </div>
                </div>
              ))}
            </div>
            {false && (
              <div className="dd-detail-overlay">
                <div className="dd-detail-modal">
                  <div className="dd-detail-header">
                    <h4>Detailed View: {selectedStudent.name}</h4>
                    <button onClick={() => setSelectedStudent(null)}><FiXCircle /></button>
                  </div>
                  <div className="dd-detail-metrics">
                    <div className="metric"><span>ID:</span> <b>{selectedStudent.id}</b></div>
                    <div className="metric"><span>Latest Flag:</span> <b className={selectedStudent.status.toLowerCase()}>{selectedStudent.status}</b></div>
                    <div className="metric"><span>Head Switches:</span> <b className={selectedStudent.headSwitchCount >= HEAD_SWITCH_LIMIT ? 'warning' : 'active'}>{selectedStudent.headSwitchCount || 0}/{HEAD_SWITCH_LIMIT}</b></div>
                    <div className="metric"><span>Test Status:</span> <b className={selectedStudent.terminated ? 'warning' : 'active'}>{selectedStudent.terminated ? 'Terminated' : 'Running'}</b></div>
                    <div className="metric"><span>Frames Captured:</span> <b>{selectedStudent.allFrames?.length || 0}</b></div>
                    <div className="metric"><span>Last Seen:</span> <b>{selectedStudent.lastFrameAt ? new Date(selectedStudent.lastFrameAt).toLocaleTimeString() : '—'}</b></div>
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

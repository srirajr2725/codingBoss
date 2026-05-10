import React, { useState, useEffect, useRef } from 'react';
import { FiRefreshCw, FiUser, FiAlertTriangle, FiCamera, FiX, FiClock, FiLayers } from 'react-icons/fi';
import './ProctoringRecords.css';

const API_URL = 'https://unlanded-isela-unmunificently.ngrok-free.dev/api/upload-frame/';

const AuthorizedImage = ({ src, alt, style, className }) => {
  const [blobUrl, setBlobUrl] = useState(null);

  useEffect(() => {
    if (!src) return;

    const secureSrc = src.replace(/^http:\/\//i, 'https://');
    let objectUrl = null;
    let isMounted = true;

    fetch(secureSrc, {
      headers: { 'ngrok-skip-browser-warning': '1' },
    })
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
        console.error('Frame load error:', err);
        // Last resort: set src directly
        if (isMounted) setBlobUrl(secureSrc);
      });

    return () => {
      isMounted = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);

  if (!blobUrl) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', gap: '8px' }}>
        <FiCamera size={32} />
        <p style={{ margin: 0, fontSize: '0.75rem' }}>Loading frame…</p>
      </div>
    );
  }
  return <img src={blobUrl} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover', ...(style || {}) }} className={className} />;
};

const ProctoringRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('all');
  const [selectedFrame, setSelectedFrame] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchRecords();
    // Auto-refresh every 15 seconds to pick up new frames
    const interval = setInterval(fetchRecords, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchRecords = async (manual = false) => {
    if (manual) setRefreshing(true);
    else setLoading(true);
    setError('');
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
      // Support the new sessions format
      let list = [];
      if (data && data.sessions) {
        list = data.sessions;
      } else {
        list = Array.isArray(data) ? data : data.results || data.frames || data.data || [];
      }

      // Keep records that have a student_id
      const attended = list.filter(r => r.student_id !== undefined && r.student_id !== null);
      setRecords(attended);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Group by student
  const studentMap = records.reduce((acc, r) => {
    const key = String(r.student_id);
    if (!acc[key]) acc[key] = { id: key, name: r.student_name || `Student #${key}`, frames: [] };
    acc[key].frames.push(r);
    return acc;
  }, {});
  const students = Object.values(studentMap);

  const filtered = selectedStudent === 'all'
    ? records
    : records.filter(r => String(r.student_id) === selectedStudent);

  // Consider a session flagged if needed, for now default to false or whatever the backend returns
  const flaggedCount = records.filter(r => r.flagged).length;

  const formatTime = (ts) => {
    try { return new Date(ts).toLocaleString('en-IN'); } catch { return ts || '—'; }
  };

  return (
    <div className="pr-container">
      {/* Header */}
      <div className="pr-header">
        <div className="pr-header-left">
          <div className="pr-icon"><FiCamera /></div>
          <div>
            <h1 className="pr-title">Exam Proctoring Records</h1>
            <p className="pr-sub">Live camera frames captured during student test sessions</p>
          </div>
        </div>
        <button className="pr-refresh-btn" onClick={() => fetchRecords(true)} disabled={refreshing}>
          <FiRefreshCw style={{ marginRight: 6, animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Stats */}
      <div className="pr-stats">
        <div className="pr-stat-card">
          <FiLayers className="pr-stat-ico" />
          <span className="pr-stat-num">{records.length}</span>
          <span className="pr-stat-label">Total Frames</span>
        </div>
        <div className="pr-stat-card flagged">
          <FiAlertTriangle className="pr-stat-ico" style={{ color: '#ef4444' }} />
          <span className="pr-stat-num">{flaggedCount}</span>
          <span className="pr-stat-label">Flagged</span>
        </div>
        <div className="pr-stat-card">
          <FiUser className="pr-stat-ico" />
          <span className="pr-stat-num">{students.length}</span>
          <span className="pr-stat-label">Students Monitored</span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="pr-error">
          <FiAlertTriangle style={{ marginRight: 8 }} />
          No data from server: {error}. Waiting for students to take a test…
        </div>
      )}

      {/* No students yet */}
      {!loading && !error && records.length === 0 && (
        <div className="pr-no-data">
          <FiCamera size={48} style={{ color: '#cbd5e1', marginBottom: 16 }} />
          <h3>No Test Sessions Yet</h3>
          <p>Proctoring frames will appear here once a student starts an exam.</p>
        </div>
      )}

      {/* Student Tabs */}
      {students.length > 0 && (
        <div className="pr-student-tabs">
          <button
            className={`pr-tab ${selectedStudent === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedStudent('all')}
          >
            All Students ({records.length})
          </button>
          {students.map(s => (
            <button
              key={s.id}
              className={`pr-tab ${selectedStudent === s.id ? 'active' : ''}`}
              onClick={() => setSelectedStudent(s.id)}
            >
              <FiUser style={{ marginRight: 6 }} />
              {s.name} ({s.frames.length})
            </button>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="pr-loader">
          <div className="pr-spinner" />
          <p>Fetching proctoring data from server…</p>
        </div>
      )}

      {/* Frame Grid */}
      {!loading && filtered.length > 0 && (
        <div className="pr-grid">
          {filtered.map((record, idx) => (
            <div
              key={record.session_id || record.id || idx}
              className={`pr-card ${record.flagged ? 'flagged' : ''}`}
              onClick={() => setSelectedFrame(record)}
            >
              <div className="pr-card-img">
                <div className="pr-live-badge"><div className="pr-live-dot"></div> LIVE</div>
                {record.latest_frame_url || record.image ? (
                  <AuthorizedImage
                    src={record.latest_frame_url || (record.image.startsWith('data:') ? record.image : `data:image/jpeg;base64,${record.image}`)}
                    alt={`Student ${record.student_name}`}
                    onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                  />
                ) : null}
                <div className="pr-card-placeholder" style={{ display: (record.latest_frame_url || record.image) ? 'none' : 'flex' }}>
                  <FiUser size={40} />
                  <p>No Frame Available</p>
                </div>
                {record.flagged && (
                  <div className="pr-flag-badge">
                    <FiAlertTriangle style={{ marginRight: 4 }} /> Flagged
                  </div>
                )}
              </div>
              <div className="pr-card-info">
                <div className="pr-card-name">
                  <FiUser style={{ marginRight: 6, color: '#6366f1' }} />
                  {record.student_name || `Student #${record.student_id}`}
                </div>
                <div className="pr-card-time">
                  <FiClock style={{ marginRight: 4, opacity: 0.6 }} />
                  Last seen: {formatTime(record.latest_frame_created_at || record.timestamp)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Frame Modal */}
      {selectedFrame && (
        <div className="pr-modal-overlay" onClick={() => setSelectedFrame(null)}>
          <div className="pr-modal" onClick={e => e.stopPropagation()}>
            <button className="pr-modal-close" onClick={() => setSelectedFrame(null)}>
              <FiX />
            </button>
            <h2><FiUser style={{ marginRight: 10, color: '#6366f1' }} /> {selectedFrame.student_name || `Student #${selectedFrame.student_id}`}</h2>
            <div className="pr-modal-meta">
              <span><FiClock style={{ marginRight: 6, color: '#94a3b8' }} /> Session Started: {formatTime(selectedFrame.started_at || selectedFrame.timestamp)}</span>
              <span><FiCamera style={{ marginRight: 6, color: '#94a3b8' }} /> Latest Frame: {formatTime(selectedFrame.latest_frame_created_at || selectedFrame.timestamp)}</span>
            </div>
            {selectedFrame.latest_frame_url || selectedFrame.image ? (
              <AuthorizedImage
                src={selectedFrame.latest_frame_url || (selectedFrame.image.startsWith('data:') ? selectedFrame.image : `data:image/jpeg;base64,${selectedFrame.image}`)}
                alt="Enlarged Frame"
                style={{ width: '100%', borderRadius: '16px', marginTop: '16px', border: '2px solid #e2e8f0', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
              />
            ) : (
              <div className="pr-modal-placeholder">
                <FiUser size={48} />
                <p>No image data available.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProctoringRecords;

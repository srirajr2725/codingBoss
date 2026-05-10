import React, { useState, useEffect, useRef } from 'react';
import { FiRefreshCw, FiUser, FiAlertTriangle, FiCamera, FiX, FiClock, FiLayers } from 'react-icons/fi';
import './ProctoringRecords.css';

const API_URL = 'https://unlanded-isela-unmunificently.ngrok-free.dev/api/upload-frame/';

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
      // Support various response shapes
      const list = Array.isArray(data)
        ? data
        : data.results || data.frames || data.data || [];
      // Only keep records that have a student_id (meaning they attended a test)
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
              key={record.id || idx}
              className={`pr-card ${record.flagged ? 'flagged' : ''}`}
              onClick={() => setSelectedFrame(record)}
            >
              <div className="pr-card-img">
                {record.image ? (
                  <img
                    src={record.image.startsWith('data:') ? record.image : `data:image/jpeg;base64,${record.image}`}
                    alt={`Frame ${idx + 1}`}
                    onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                  />
                ) : null}
                <div className="pr-card-placeholder" style={{ display: record.image ? 'none' : 'flex' }}>
                  <FiUser size={40} />
                  <p>Frame #{idx + 1}</p>
                </div>
                {record.flagged && (
                  <div className="pr-flag-badge">
                    <FiAlertTriangle style={{ marginRight: 4 }} /> Flagged
                  </div>
                )}
              </div>
              <div className="pr-card-info">
                <div className="pr-card-name">
                  <FiUser style={{ marginRight: 6, opacity: 0.6 }} />
                  {record.student_name || `Student #${record.student_id}`}
                </div>
                <div className="pr-card-time">
                  <FiClock style={{ marginRight: 4, opacity: 0.6 }} />
                  {formatTime(record.timestamp)}
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
            <h2>
              <FiCamera style={{ marginRight: 10, color: '#6366f1' }} />
              Exam Frame
            </h2>
            <div className="pr-modal-meta">
              <span><FiUser style={{ marginRight: 6 }} />{selectedFrame.student_name || `Student #${selectedFrame.student_id}`}</span>
              <span><FiClock style={{ marginRight: 6 }} />{formatTime(selectedFrame.timestamp)}</span>
              <span style={{ color: selectedFrame.flagged ? '#ef4444' : '#10b981', fontWeight: 800 }}>
                {selectedFrame.flagged ? <><FiAlertTriangle style={{ marginRight: 4 }} />Flagged Violation</> : '✅ Clean'}
              </span>
            </div>
            {selectedFrame.image ? (
              <img
                src={selectedFrame.image.startsWith('data:') ? selectedFrame.image : `data:image/jpeg;base64,${selectedFrame.image}`}
                alt="Exam frame"
                style={{ width: '100%', borderRadius: 12, marginTop: 16, border: '2px solid #e2e8f0' }}
              />
            ) : (
              <div className="pr-modal-placeholder">
                <FiCamera size={36} style={{ color: '#94a3b8', marginBottom: 10 }} />
                <p>No image captured for this frame</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProctoringRecords;

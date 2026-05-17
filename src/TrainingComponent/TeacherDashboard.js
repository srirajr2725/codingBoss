import React, { useState, useEffect } from 'react';
import { FiMonitor, FiLogOut, FiGrid, FiUser, FiTrendingUp, FiAward, FiBarChart2, FiPieChart, FiSearch } from 'react-icons/fi';
import apiClient from '../utils/apiClient';
import './DoctorDashboard.css';

const TeacherDashboard = ({ username, handleLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDept, setSelectedDept] = useState('All');

  const getStudentDept = (student) => {
    const rawDept = student.user__institute || student.institute || student.user__department || student.department;
    if (rawDept && rawDept.trim()) {
      const deptClean = rawDept.trim();
      if (deptClean.toLowerCase().includes("bannari amman") || deptClean.toLowerCase().includes("srm") || deptClean.toLowerCase().includes("coimbatore")) {
        const email = (student.user__email || '').toLowerCase();
        if (email.includes('cse') || email.includes('computer')) return 'CSE';
        if (email.includes('it') || email.includes('info')) return 'IT';
        if (email.includes('ece') || email.includes('electro')) return 'ECE';
        return 'CSE';
      }
      return deptClean;
    }
    const email = (student.user__email || '').toLowerCase();
    if (email.includes('cse') || email.includes('computer')) return 'CSE';
    if (email.includes('it') || email.includes('info')) return 'IT';
    if (email.includes('ece') || email.includes('electro')) return 'ECE';
    if (email.includes('eee') || email.includes('elec')) return 'EEE';
    const id = student.user__id || 0;
    const depts = ['CSE', 'IT', 'ECE', 'EEE'];
    return depts[id % depts.length];
  };

  const formatSeconds = (sec) => {
    const s = Number(sec || 0);
    if (s <= 0) return "0s";
    if (s < 60) return `${s.toFixed(1)}s`;
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return rem > 0 ? `${m}m ${rem.toFixed(0)}s` : `${m}m`;
  };

  useEffect(() => {
    if (activeTab === 'performance') {
      fetchBatchPerformance();
    }
  }, [activeTab]);

  const fetchBatchPerformance = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient('batch-performance-report/', 'GET');
      setPerformanceData(data);
    } catch (err) {
      console.error('Failed to fetch performance:', err);
      setError('Failed to load performance reports.');
    } finally {
      setLoading(false);
    }
  };

  const renderPerformanceView = () => {
    if (loading) return <div className="ultra-empty-state"><div className="spinner"></div><p>Generating Batch Analytics...</p></div>;
    if (error) return <div className="ultra-empty-state"><p style={{ color: '#ef4444' }}>{error}</p></div>;
    if (!performanceData) return null;

    const { top_performers, total_assessments_completed, report_type } = performanceData;

    // 1. Get dynamically filtered list of students
    const filteredPerformers = !selectedDept || selectedDept === 'All'
      ? (top_performers || [])
      : (top_performers || []).filter(student => getStudentDept(student) === selectedDept);

    // 2. Dynamically calculate stats based on filter
    const topPerformer = filteredPerformers?.[0];
    const totalAssessments = selectedDept === 'All'
      ? total_assessments_completed
      : filteredPerformers.reduce((sum, s) => sum + (s.total_attempted || 0), 0);

    // 3. Build list of unique departments
    const allDepts = ['All', ...new Set((top_performers || []).map(getStudentDept))];

    return (
      <div className="performance-view animate-fade-in">
        <div className="perf-stats-grid">
          <div className="perf-card highlight">
            <FiAward className="perf-icon" />
            <div className="perf-info">
              <span className="label">Top Elite Performer</span>
              <span className="value">{topPerformer ? (topPerformer.user__email?.split('@')[0] || 'N/A') : 'N/A'}</span>
              <span className="sub">{topPerformer ? (topPerformer.overall_avg || 0) : 0}% Accuracy</span>
            </div>
          </div>
          <div className="perf-card highlight">
            <FiTrendingUp className="perf-icon" />
            <div className="perf-info">
              <span className="label">Total Assessments</span>
              <span className="value">{totalAssessments || 0}</span>
              <span className="sub">Completed by Batch</span>
            </div>
          </div>
        </div>

        {/* Dynamic Department Filter Row */}
        <div className="dept-filter-container">
          <span className="filter-label">Department:</span>
          <div className="dept-pills-row">
            {allDepts.map((dept) => (
              <button
                key={dept}
                className={`dept-pill ${selectedDept === dept ? 'active' : ''}`}
                onClick={() => setSelectedDept(dept)}
              >
                {dept}
                <span className="dept-count">
                  {dept === 'All'
                    ? (top_performers || []).length
                    : (top_performers || []).filter(s => getStudentDept(s) === dept).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="perf-main-grid-full">
          <div className="leaderboard-section">
            <div className="section-header">
              <FiAward /> <h3>{report_type || 'Top Performers'}</h3>
            </div>
            
            {filteredPerformers.length === 0 ? (
              <div className="ultra-empty-state" style={{ padding: '40px 0' }}>
                <p style={{ color: '#64748b', fontSize: '1rem', fontWeight: 600 }}>No student reports found for this department.</p>
              </div>
            ) : (
              <div className="leaderboard-grid-ultra">
                {filteredPerformers.map((student, idx) => (
                  <div key={idx} className="leader-card-ultra">
                    <div className="rank-badge">#{idx + 1}</div>
                    <div className="student-profile">
                      <div className="s-avatar">{student.user__email.charAt(0).toUpperCase()}</div>
                      <div className="s-details">
                        <span className="s-email">{student.user__email}</span>
                        <div className="s-meta-row">
                          <span className="s-id">ID: {student.user__id}</span>
                          <span className="s-dept-badge">{getStudentDept(student)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="performance-metrics">
                      <div className="metric-item">
                        <span className="m-label">Overall Avg</span>
                        <span className="m-value">{student.overall_avg}%</span>
                        <div className="m-progress">
                          <div className="m-fill" style={{ width: `${student.overall_avg}%` }}></div>
                        </div>
                      </div>
                      <div className="metric-row">
                        <div className="metric-pill success">
                          <span className="p-label">Correct</span>
                          <span className="p-value">{student.total_correct}</span>
                        </div>
                        <div className="metric-pill blue">
                          <span className="p-label">Attempted</span>
                          <span className="p-value">{student.total_attempted}</span>
                        </div>
                      </div>
                      <div className="metric-row" style={{ marginTop: '4px' }}>
                        <div className="metric-pill time-spent">
                          <span className="p-label">Total Time</span>
                          <span className="p-value">{formatSeconds(student.total_time_taken)}</span>
                        </div>
                        <div className="metric-pill time-avg">
                          <span className="p-label">Avg/Qn</span>
                          <span className="p-value">{formatSeconds(student.average_time_per_question)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="ultra-dashboard">
      <aside className="ultra-sidebar">
        <div className="ultra-logo">
          <div className="logo-icon"><FiMonitor /></div>
          <div className="logo-text">
            <h3>Coding<span>Boss</span></h3>
            <span className="role-tag">Teacher Portal</span>
          </div>
        </div>

        <nav className="ultra-nav">
          <div
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <FiGrid /> Overview
          </div>
          <div
            className={`nav-item ${activeTab === 'performance' ? 'active' : ''}`}
            onClick={() => setActiveTab('performance')}
          >
            <FiBarChart2 /> Performance
          </div>
        </nav>

        <div className="user-profile-brief">
          <div className="u-avatar">Tr</div>
          <div className="u-info">
            <div className="u-name">{username ? username.split('@')[0] : 'Teacher'}</div>
            <div className="u-status"><span className="online-dot"></span> Online</div>
          </div>
          <button className="u-logout-btn" onClick={handleLogout}><FiLogOut /></button>
        </div>
      </aside>

      <main className="ultra-main">
        <header className="ultra-header">
          <div className="header-left">
            <h1 className="ultra-title">
              {activeTab === 'overview' ? 'CTC Admin Center' : 'Batch Analytics Report'}
            </h1>
            <div className="system-status-pills">
              <span className="pill green">System: Optimal</span>
              <span className="pill blue">Role: Administrator</span>
            </div>
          </div>
          {activeTab === 'performance' && (
            <div className="header-actions">
              <button
                className="ultra-btn-refresh"
                onClick={fetchBatchPerformance}
                disabled={loading}
              >
                <FiSearch /> Refresh Data
              </button>
            </div>
          )}
        </header>

        <div className="ultra-content">
          {activeTab === 'overview' ? (
            <div className="ultra-empty-state" style={{ marginTop: '100px' }}>
              <FiUser size={64} style={{ color: '#6366f1', marginBottom: '24px' }} />
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>Welcome to the Teacher Portal</h2>
              <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto' }}>
                Access detailed student performance analytics using the navigation menu.
              </p>
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '32px' }}>
                <button
                  className="login-btn"
                  style={{ width: 'auto', padding: '12px 32px' }}
                  onClick={() => setActiveTab('performance')}
                >
                  View Performance Reports
                </button>
              </div>
            </div>
          ) : renderPerformanceView()}
        </div>
      </main>

      <style>{`
        .perf-stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 24px; margin-bottom: 32px; }
        .perf-card { background: white; padding: 24px; border-radius: 20px; display: flex; align-items: center; gap: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
        .perf-card.highlight { border-left: 6px solid #6366f1; }
        .perf-icon { font-size: 2.5rem; color: #6366f1; background: #eef2ff; padding: 12px; border-radius: 16px; }
        .perf-info .label { display: block; font-size: 0.85rem; color: #64748b; font-weight: 600; text-transform: uppercase; }
        .perf-info .value { display: block; font-size: 1.5rem; font-weight: 800; color: #0f172a; margin: 4px 0; }
        .perf-info .sub { font-size: 0.9rem; color: #10b981; font-weight: 600; }
        
        .perf-main-grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 32px; }
        .perf-main-grid-full { width: 100%; }
        .section-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; color: #0f172a; }
        .section-header h3 { margin: 0; font-size: 1.25rem; font-weight: 700; }
        
        .leaderboard-section, .topics-section { background: white; padding: 24px; border-radius: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
        .leaderboard-grid-ultra { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }
        
        .leader-card-ultra { background: #ffffff; border: 1px solid #f1f5f9; border-radius: 24px; padding: 24px; position: relative; transition: all 0.3s; box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
        .leader-card-ultra:hover { transform: translateY(-5px); border-color: #6366f1; box-shadow: 0 20px 25px -5px rgba(99, 102, 241, 0.1); }
        
        .rank-badge { position: absolute; top: -12px; left: 24px; background: linear-gradient(135deg, #6366f1, #a855f7); color: white; padding: 4px 12px; border-radius: 99px; font-weight: 900; font-size: 0.8rem; box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3); }
        
        .student-profile { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; margin-top: 8px; }
        .s-avatar { width: 48px; height: 48px; background: #f1f5f9; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-weight: 900; color: #6366f1; font-size: 1.2rem; }
        .s-details { display: flex; flex-direction: column; overflow: hidden; }
        .s-email { font-weight: 700; color: #0f172a; font-size: 0.9rem; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; }
        .s-id { font-size: 0.75rem; color: #94a3b8; font-weight: 600; }
        .s-meta-row { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
        .s-dept-badge {
          background: #f1f5f9;
          color: #475569;
          padding: 2px 8px;
          border-radius: 6px;
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
        }
        
        .dept-filter-container {
          background: white;
          padding: 20px 24px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 32px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          border: 1px solid #f1f5f9;
        }
        .filter-label {
          font-size: 0.9rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .dept-pills-row {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .dept-pill {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          color: #475569;
          padding: 8px 16px;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.25s ease;
        }
        .dept-pill:hover {
          background: #e2e8f0;
          color: #0f172a;
          transform: translateY(-1px);
        }
        .dept-pill.active {
          background: linear-gradient(135deg, #6366f1, #a855f7);
          border-color: transparent;
          color: white;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
        }
        .dept-count {
          font-size: 0.75rem;
          background: rgba(0, 0, 0, 0.06);
          padding: 2px 6px;
          border-radius: 6px;
          font-weight: 800;
        }
        .dept-pill.active .dept-count {
          background: rgba(255, 255, 255, 0.2);
        }
        
        .performance-metrics { display: flex; flex-direction: column; gap: 16px; }
        .metric-item { display: flex; flex-direction: column; gap: 8px; }
        .m-label { font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; }
        .m-value { font-size: 1.2rem; font-weight: 900; color: #6366f1; }
        .m-progress { height: 6px; background: #f1f5f9; border-radius: 99px; overflow: hidden; }
        .m-fill { height: 100%; background: linear-gradient(90deg, #6366f1, #a855f7); border-radius: 99px; }
        
        .metric-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .metric-pill { padding: 12px; border-radius: 16px; display: flex; flex-direction: column; align-items: center; gap: 4px; }
        .metric-pill.success { background: #f0fdf4; color: #15803d; }
        .metric-pill.blue { background: #f0f9ff; color: #0369a1; }
        .metric-pill.time-spent { background: #fffbeb; color: #b45309; }
        .metric-pill.time-avg { background: #faf5ff; color: #6b21a8; }
        .p-label { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; opacity: 0.8; }
        .p-value { font-size: 1rem; font-weight: 800; }

        .spinner { width: 30px; height: 30px; border: 3px solid rgba(99,102,241,0.1); border-top-color: #6366f1; border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 16px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        
        @media (max-width: 1024px) {
          .perf-main-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default TeacherDashboard;

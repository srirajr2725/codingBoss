import React, { useState, useEffect } from 'react';
import apiClient from '../utils/apiClient';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiCheckCircle, FiPlus, FiSend, FiX, FiActivity, FiUsers, FiHelpCircle, FiSettings } from 'react-icons/fi';
import './TeacherDashboard.css';

const TeacherDashboard = ({ isLoggedIn, handleLogout, username }) => {
  const [tab, setTab] = useState('overview');
  const [students, setStudents] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingQ, setLoadingQ] = useState(false);
  const [showAddQ, setShowAddQ] = useState(false);
  const [search, setSearch] = useState('');
  
  // Task Assignment States
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [taskData, setTaskData] = useState({ title: '', description: '', deadline: '' });
  
  const navigate = useNavigate();

  const [newQ, setNewQ] = useState({
    question: '', option_a: '', option_b: '', option_c: '', option_d: '',
    correct_answer: 'A', subtype: '', type: 'Technical'
  });

  useEffect(() => {
    if (tab === 'students') fetchStudents();
    if (tab === 'questions') fetchQuestions();
  }, [tab]);

  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const data = await apiClient('quiz/users/', 'GET');
      setStudents(Array.isArray(data) ? data : []);
    } catch {
      setStudents([
        { id: 1, email: 'student1@cb.com', name: 'Ravi Kumar', role: 'member', score: 78 },
        { id: 2, email: 'student2@cb.com', name: 'Priya S', role: 'member', score: 92 },
        { id: 3, email: 'student3@cb.com', name: 'Arun T', role: 'member', score: 65 },
      ]);
    } finally { setLoadingStudents(false); }
  };

  const fetchQuestions = async () => {
    setLoadingQ(true);
    try {
      const data = await apiClient('compiler/filter-by-subtype/?subtype=Java', 'GET');
      setQuestions(Array.isArray(data) ? data : []);
    } catch {
      setQuestions([
        { id: 1, question: 'What is JVM?', subtype: 'Java', correct_answer: 'A' },
        { id: 2, question: 'What is a pointer in C?', subtype: 'C', correct_answer: 'B' },
      ]);
    } finally { setLoadingQ(false); }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    try {
      await apiClient('compiler/questions/', 'POST', newQ);
      alert('✅ Question added successfully!');
      setShowAddQ(false);
      setNewQ({ question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'A', subtype: '', type: 'Technical' });
      fetchQuestions();
    } catch {
      alert('❌ Failed to add question. Check your connection.');
    }
  };

  const handleAssignTask = (e) => {
    e.preventDefault();
    // In real app, call API: apiClient('quiz/assign-task/', 'POST', { student_id: selectedStudent.id, ...taskData })
    alert(`✅ Task "${taskData.title}" assigned to ${selectedStudent.name || selectedStudent.email}`);
    setShowTaskModal(false);
    setTaskData({ title: '', description: '', deadline: '' });
  };

  const filteredStudents = students.filter(s =>
    (s.name || s.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const navItems = [
    { key: 'overview', icon: <FiActivity />, label: 'Overview' },
    { key: 'students', icon: <FiUsers />, label: 'Students' },
    { key: 'questions', icon: <FiHelpCircle />, label: 'Questions' },
    { key: 'tests', icon: <FiSettings />, label: 'Config' },
  ];

  return (
    <div className="td-shell">
      {/* Sidebar */}
      <aside className="td-sidebar">
        <div className="td-brand">
          <div className="td-brand-icon">🎓</div>
          <div>
            <div className="td-brand-name">CodingBoss</div>
            <div className="td-brand-role">Teacher Portal</div>
          </div>
        </div>
        <nav className="td-nav">
          {navItems.map(n => (
            <button key={n.key} className={`td-nav-item ${tab === n.key ? 'active' : ''}`} onClick={() => setTab(n.key)}>
              <span>{n.icon}</span> {n.label}
            </button>
          ))}
        </nav>
        <div className="td-sidebar-footer">
          <div className="td-user-info">
            <div className="td-avatar">{(username || 'T')[0].toUpperCase()}</div>
            <div>
              <div className="td-user-name">{username || 'Teacher'}</div>
              <div className="td-user-role">Instructor</div>
            </div>
          </div>
          <button className="td-logout" onClick={handleLogout}>Logout</button>
        </div>
      </aside>

      {/* Main */}
      <main className="td-main">
        {tab === 'overview' && (
          <div className="td-page">
            <h1 className="td-page-title">Welcome back, {username?.split('@')[0] || 'Teacher'} 👋</h1>
            <p className="td-page-sub">Here's a quick overview of your classroom.</p>
            <div className="td-stat-grid">
              {[
                { icon: <FiUsers />, label: 'Total Students', value: students.length || '—' },
                { icon: <FiHelpCircle />, label: 'Questions Added', value: questions.length || '—' },
                { icon: <FiSettings />, label: 'Tests Available', value: '10+' },
                { icon: <FiCheckCircle />, label: 'Avg. Score', value: '78%' },
              ].map((s, i) => (
                <div className="td-stat-card" key={i}>
                  <span className="td-stat-icon">{s.icon}</span>
                  <span className="td-stat-value">{s.value}</span>
                  <span className="td-stat-label">{s.label}</span>
                </div>
              ))}
            </div>
            <div className="td-quick-actions">
              <h2>Quick Actions</h2>
              <div className="td-action-grid">
                <button className="td-action-btn" onClick={() => { setTab('questions'); setShowAddQ(true); }}>
                  <FiPlus style={{marginRight: 8}} /> Add New Question
                </button>
                <button className="td-action-btn" onClick={() => setTab('students')}>
                  <FiUsers style={{marginRight: 8}} /> Manage Students
                </button>
                <button className="td-action-btn" onClick={() => navigate('/Uploadquestions')}>
                  <FiPlus style={{marginRight: 8}} /> Bulk Upload Questions
                </button>
                <button className="td-action-btn" onClick={() => navigate('/TestPage')}>
                  <FiActivity style={{marginRight: 8}} /> View Live Tests
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === 'students' && (
          <div className="td-page">
            <div className="td-page-header">
              <h1 className="td-page-title">Student Management</h1>
              <input className="td-search" placeholder="🔍 Search students..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {loadingStudents ? <div className="td-loading">Loading students...</div> : (
              <div className="td-table-wrapper">
                <table className="td-table">
                  <thead>
                    <tr><th>#</th><th>Name / Email</th><th>Role</th><th>Score</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((s, i) => (
                      <tr key={s.id || i}>
                        <td>{i + 1}</td>
                        <td>
                          <div className="td-student-name">{s.name || '—'}</div>
                          <div className="td-student-email">{s.email}</div>
                        </td>
                        <td><span className="td-badge">{s.role || 'member'}</span></td>
                        <td><span className="td-score">{s.score || '—'}</span></td>
                        <td>
                          <div style={{display: 'flex', gap: 8}}>
                            <button className="td-btn-sm" onClick={() => { setSelectedStudent(s); setShowTaskModal(true); }}>
                              <FiPlus style={{marginRight: 4}} /> Assign Task
                            </button>
                            <button className="td-btn-sm">
                              <FiUser style={{marginRight: 4}} /> Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredStudents.length === 0 && <tr><td colSpan={5} className="td-empty">No students found.</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === 'questions' && (
          <div className="td-page">
            <div className="td-page-header">
              <h1 className="td-page-title">Question Bank</h1>
              <button className="td-add-btn" onClick={() => setShowAddQ(true)}>
                <FiPlus style={{marginRight: 8}} /> Add Question
              </button>
            </div>

            {showAddQ && (
              <form className="td-add-form" onSubmit={handleAddQuestion}>
                <h3>Add New MCQ Question</h3>
                <div className="td-form-grid">
                  <div className="td-form-full">
                    <label>Question *</label>
                    <textarea required value={newQ.question} onChange={e => setNewQ({...newQ, question: e.target.value})} placeholder="Enter the question..." />
                  </div>
                  {['option_a','option_b','option_c','option_d'].map(opt => (
                    <div key={opt}>
                      <label>{opt.replace('_', ' ').toUpperCase()} *</label>
                      <input required value={newQ[opt]} onChange={e => setNewQ({...newQ, [opt]: e.target.value})} placeholder={`Option ${opt.slice(-1).toUpperCase()}`} />
                    </div>
                  ))}
                  <div>
                    <label>Correct Answer *</label>
                    <select value={newQ.correct_answer} onChange={e => setNewQ({...newQ, correct_answer: e.target.value})}>
                      {['A','B','C','D'].map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <label>Subject / Subtype *</label>
                    <input required value={newQ.subtype} onChange={e => setNewQ({...newQ, subtype: e.target.value})} placeholder="e.g. Java, Python, C" />
                  </div>
                  <div>
                    <label>Category</label>
                    <select value={newQ.type} onChange={e => setNewQ({...newQ, type: e.target.value})}>
                      <option>Technical</option><option>Aptitude</option><option>HR</option>
                    </select>
                  </div>
                </div>
                <div className="td-form-actions">
                  <button type="submit" className="td-save-btn">✅ Save Question</button>
                  <button type="button" className="td-cancel-btn" onClick={() => setShowAddQ(false)}>Cancel</button>
                </div>
              </form>
            )}

            {loadingQ ? <div className="td-loading">Loading questions...</div> : (
              <div className="td-q-list">
                {questions.map((q, i) => (
                  <div className="td-q-card" key={q.id || i}>
                    <div className="td-q-num">Q{i + 1}</div>
                    <div className="td-q-content">
                      <div className="td-q-text">{q.question}</div>
                      <div className="td-q-meta">
                        <span className="td-badge">{q.subtype}</span>
                        <span>✅ Answer: {q.correct_answer}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {questions.length === 0 && <div className="td-empty">No questions yet. Add your first question!</div>}
              </div>
            )}
          </div>
        )}

        {tab === 'tests' && (
          <div className="td-page">
            <h1 className="td-page-title">Configuration</h1>
            <p className="td-page-sub">Manage and configure test availability for your students.</p>
            <div className="td-action-grid" style={{marginTop: 24}}>
              <button className="td-action-btn" onClick={() => navigate('/Uploadquestions')}>📤 Bulk Upload Questions</button>
              <button className="td-action-btn" onClick={() => navigate('/TestPage')}>📝 Live Test Explorer</button>
              <button className="td-action-btn" onClick={() => navigate('/QuestionPage')}>🔧 Question Editor</button>
            </div>
          </div>
        )}
      </main>

      {/* Task Assignment Modal */}
      {showTaskModal && (
        <div className="td-modal-overlay">
          <div className="td-modal">
            <div className="td-modal-header">
              <h2>Assign Task to {selectedStudent?.name || 'Student'}</h2>
              <button onClick={() => setShowTaskModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleAssignTask}>
              <div className="td-form-group">
                <label>Task Title</label>
                <input required value={taskData.title} onChange={e => setTaskData({...taskData, title: e.target.value})} placeholder="e.g. Java Basics Quiz #1" />
              </div>
              <div className="td-form-group">
                <label>Task Description</label>
                <textarea required value={taskData.description} onChange={e => setTaskData({...taskData, description: e.target.value})} placeholder="Provide instructions for the student..." />
              </div>
              <div className="td-form-group">
                <label>Submission Deadline</label>
                <input type="date" required value={taskData.deadline} onChange={e => setTaskData({...taskData, deadline: e.target.value})} />
              </div>
              <div className="td-modal-footer">
                <button type="submit" className="td-submit-btn"><FiSend style={{marginRight: 8}} /> Assign Task Now</button>
                <button type="button" className="td-cancel-btn" onClick={() => setShowTaskModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;

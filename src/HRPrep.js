import React, { useState } from 'react';
import './HRPrep.css';
import { 
  FaUserTie, 
  FaLightbulb, 
  FaChevronDown, 
  FaPenNib,
  FaCheckCircle,
  FaComments
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';

const HRPrep = () => {
  const [openAccordionId, setOpenAccordionId] = useState(null);
  const [drafts, setDrafts] = useState({});

  const toggleAccordion = (id) => {
    setOpenAccordionId(openAccordionId === id ? null : id);
  };

  const handleDraftChange = (id, text) => {
    setDrafts(prev => ({ ...prev, [id]: text }));
  };

  const handleSave = (id) => {
    if (!drafts[id] || drafts[id].trim() === '') {
      toast.error('Draft cannot be empty!', { theme: "colored" });
      return;
    }
    toast.success('Response saved to your profile!', { theme: "colored" });
  };

  // Curated Content for HR Prep
  const questions = [
    {
      id: 1,
      title: "Tell me about yourself.",
      icon: <FaUserTie />,
      strategy: "Use the Present-Past-Future formula. Start with your current role/studies, highlight a key past achievement that relates to the role, and finish by explaining why you are excited about this specific opportunity. Keep it under 2 minutes."
    },
    {
      id: 2,
      title: "What is your biggest weakness?",
      icon: <FaComments />,
      strategy: "Choose an actual weakness, but pick one that is not a core requirement for the job. Most importantly, spend 80% of your answer explaining the proactive steps you are taking to improve upon it. Do NOT use fake weaknesses like 'I work too hard'."
    },
    {
      id: 3,
      title: "Where do you see yourself in 5 years?",
      icon: <FaLightbulb />,
      strategy: "Align your career goals with the company's trajectory. You don't need a perfectly mapped out plan, but show ambition. Focus on the skills you want to learn, the responsibilities you want to take on, and how you hope to contribute to the company's growth."
    },
    {
      id: 4,
      title: "Describe a time you failed and how you handled it.",
      icon: <FaComments />,
      strategy: "Use the STAR method (Situation, Task, Action, Result). Don't blame others. Own the mistake, explain exactly what went wrong, but emphasize the 'Action' and 'Result'—what did you learn, and what systems did you put in place to ensure it never happens again?"
    },
    {
      id: 5,
      title: "Why should we hire you?",
      icon: <FaUserTie />,
      strategy: "This is your closing pitch. Summarize your top 3 strengths that directly match the job description. Show enthusiasm for the company's mission and reiterate how your unique combination of skills will solve their specific problems."
    }
  ];

  // Calculate progress based on how many drafts have some content
  const completedCount = Object.values(drafts).filter(d => d.trim().length > 0).length;
  const progressPercent = (completedCount / questions.length) * 100;

  return (
    <div className="hr-container">
      <ToastContainer position="top-center" />

      {/* HERO BANNER */}
      <div className="hr-hero">
        <div className="hr-hero-content">
          <div className="hr-badge">
            <FaUserTie /> Behavioral Mastery
          </div>
          <h1 className="hr-title">Ace the HR Interview</h1>
          <p className="hr-desc">
            Technical skills get you the interview; cultural fit gets you the job. 
            Master the most common behavioral questions with expert strategies.
          </p>
        </div>

        {/* PROGRESS TRACKER */}
        <div className="hr-progress-section">
          <div 
            className="hr-progress-circle" 
            style={{ '--progress': `${progressPercent}%` }}
          >
            <div className="hr-progress-value">{completedCount}/{questions.length}</div>
          </div>
          <div className="hr-progress-label">Responses Drafted</div>
        </div>
      </div>

      {/* INTERACTIVE QUESTION ACCORDIONS */}
      <div className="hr-questions-list">
        {questions.map((q) => (
          <div key={q.id} className={`hr-accordion ${openAccordionId === q.id ? 'open' : ''}`}>
            
            <div className="hr-accordion-header" onClick={() => toggleAccordion(q.id)}>
              <div className="hr-q-icon">{q.icon}</div>
              <h3 className="hr-q-title">{q.title}</h3>
              <FaChevronDown className="hr-chevron" />
            </div>

            <div className="hr-accordion-body">
              <div className="hr-accordion-content">
                
                <div className="hr-strategy-box">
                  <h4 className="hr-strategy-title">
                    <FaLightbulb style={{ color: '#f59e0b' }} /> Expert Strategy
                  </h4>
                  <p className="hr-strategy-text">{q.strategy}</p>
                </div>

                <div className="hr-draft-area">
                  <label className="hr-draft-label">
                    <FaPenNib style={{ color: '#94a3b8' }} /> Draft your response:
                  </label>
                  <textarea 
                    className="hr-draft-input"
                    placeholder="Type your answer here using the strategy above..."
                    value={drafts[q.id] || ''}
                    onChange={(e) => handleDraftChange(q.id, e.target.value)}
                  />
                  <button className="hr-save-btn" onClick={() => handleSave(q.id)}>
                    <FaCheckCircle style={{ display: 'inline', marginRight: '6px' }} />
                    Save Draft
                  </button>
                </div>

              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};

export default HRPrep;

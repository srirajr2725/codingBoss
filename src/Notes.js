import React, { useState, useRef, useEffect } from 'react';
import { FaArrowLeft, FaFilePdf, FaDownload, FaExpand, FaCompress, FaArrowRight } from 'react-icons/fa';
import PdfViewer from './PdfViewer';
import './Notes.css';

export default function Notes() {
  const [selectedNote, setSelectedNote] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const viewerContainerRef = useRef(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Handle browser back button to close the PDF viewer instead of leaving the dashboard
  useEffect(() => {
    const handlePopState = () => {
      if (selectedNote) {
        setSelectedNote(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [selectedNote]);

  const openNote = (note) => {
    setSelectedNote(note);
    window.history.pushState({ noteOpen: true }, '');
  };

  const closeNote = () => {
    setSelectedNote(null);
    // If we pushed a state for this note, pop it off cleanly
    if (window.history.state && window.history.state.noteOpen) {
      window.history.back();
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (viewerContainerRef.current?.requestFullscreen) {
        viewerContainerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const notesList = [
    { id: 1, title: "C Programming Notes", pdfUrl: "/Clang.pdf", color: "#3b82f6" },
    { id: 2, title: "JavaScript Notes", pdfUrl: "/javascript.pdf", color: "#f59e0b" },
    { id: 3, title: "React.js Notes", pdfUrl: "/dummy.pdf", color: "#06b6d4" },
    { id: 4, title: "Python Notes", pdfUrl: "/PythonCB.pdf", color: "#10b981" },
    { id: 5, title: "Java Notes", pdfUrl: "/java.pdf", color: "#ef4444" },
  ];

  if (selectedNote) {
    return (
      <div className="notes-viewer-container" ref={viewerContainerRef}>
        <div className="notes-viewer-header">
          <button className="back-btn" onClick={closeNote}>
            <FaArrowLeft /> Back to Notes
          </button>
          <h2>{selectedNote.title}</h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="back-btn" onClick={toggleFullscreen} style={{ background: isFullscreen ? 'rgba(99, 102, 241, 0.1)' : '' }}>
              {isFullscreen ? <><FaCompress /> Exit Fullscreen</> : <><FaExpand /> Fullscreen</>}
            </button>
            <a href={selectedNote.pdfUrl} download className="download-btn">
              <FaDownload /> Download PDF
            </a>
          </div>
        </div>
        <div className="notes-pdf-wrapper" style={{ height: isFullscreen ? 'calc(100vh - 80px)' : '' }}>
          <PdfViewer pdfUrl={selectedNote.pdfUrl} />
        </div>
      </div>
    );
  }

  return (
    <div className="notes-container">
      <div className="notes-header">
        <div className="ultra-badge">✨ Learning Resources</div>
        <h1>Study Materials & Notes</h1>
        <p>Access high-quality, comprehensive notes to accelerate your learning.</p>
      </div>
      <div className="notes-grid">
        {notesList.map(note => (
          <div key={note.id} className="note-card" onClick={() => openNote(note)}>
            <div className="note-icon" style={{ backgroundColor: `${note.color}15`, color: note.color, boxShadow: `inset 0 0 0 1px ${note.color}30` }}>
              <FaFilePdf />
            </div>
            <div className="note-info">
              <h3>{note.title}</h3>
              <p>Click to view or download</p>
            </div>
            <div className="note-arrow">
              <FaArrowRight />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

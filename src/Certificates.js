import React, { useState, useEffect } from 'react';
import './Certificates.css';
import { 
  WorkspacePremium, 
  Download, 
  Lock, 
  Share
} from '@mui/icons-material';
import html2pdf from 'html2pdf.js';
import CryptoJS from 'crypto-js';
import apiClient from './utils/apiClient';

const Certificates = () => {
  const [certificatesData, setCertificatesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const storedEncryptedUserID = localStorage.getItem('userID');
        let userId = null;
        if (storedEncryptedUserID) {
          const bytes = CryptoJS.AES.decrypt(storedEncryptedUserID, 'thirancoding360mgai');
          userId = bytes.toString(CryptoJS.enc.Utf8);
        }

        if (!userId) {
          console.error("No user ID found for fetching certificates.");
          setLoading(false);
          return;
        }

        const data = await apiClient(`https://untrumpeted-sallie-shallowly.ngrok-free.dev/compiler/users/${userId}/certificates/`, 'GET');
        setCertificatesData(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching certificates:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCertificates();
  }, []);

  // Since the backend doesn't explicitly send 'earned' or 'locked' status yet, 
  // we will map all active certificates to 'earned' for now.
  const earned = certificatesData
    .filter(c => c.is_active !== false) // Default to true if missing
    .map(c => ({
      ...c,
      status: 'earned',
      skillsArray: typeof c.skills === 'string' ? c.skills.split(',').map(s => s.trim()) : (c.skills || []),
      formattedDate: c.created_at ? new Date(c.created_at).toLocaleDateString() : 'Recent'
    }));
    
  const locked = certificatesData
    .filter(c => c.is_active === false)
    .map(c => ({
      ...c,
      status: 'locked',
      skillsArray: typeof c.skills === 'string' ? c.skills.split(',').map(s => s.trim()) : (c.skills || [])
    }));

  const handleDownload = (cert) => {
    // Generate raw HTML string with inline styles to prevent any html2canvas bounding-box issues
    const htmlContent = `
      <div style="width: 11in; height: 8.5in; padding: 0.5in; font-family: 'Times New Roman', serif; background: white; color: black; box-sizing: border-box;">
        <div style="border: 10px solid #0f172a; height: 100%; padding: 10px; box-sizing: border-box;">
          <div style="border: 2px solid #eab308; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 40px; box-sizing: border-box;">
            <h2 style="font-size: 3.5rem; margin: 0; font-family: 'Inter', sans-serif; font-weight: 800; letter-spacing: 1px;">
              <span style="color: #0f172a;">Coding</span> <span style="color: #f59e0b;">Boss</span>
            </h2>
            <p style="font-size: 1.5rem; margin: 10px 0 40px 0; color: #64748b; letter-spacing: 2px;">CERTIFICATE OF COMPLETION</p>
            
            <p style="font-size: 1.2rem; font-style: italic; margin: 0 0 20px 0;">This is proudly presented to</p>
            <h1 style="font-size: 4rem; font-family: 'Brush Script MT', cursive, serif; color: #0f172a; margin: 0 0 20px 0; border-bottom: 2px solid #e2e8f0; padding: 0 40px 10px 40px; display: inline-block;">Student Name</h1>
            <p style="font-size: 1.2rem; margin: 0 0 20px 0; max-width: 600px;">for successfully completing the rigorous requirements and mastering the skills in</p>
            <h2 style="font-size: 2.5rem; color: #6366f1; margin: 0 0 50px 0;">${cert.title}</h2>
            
            <div style="display: flex; justify-content: space-between; align-items: flex-end; width: 100%; padding: 0 50px; margin-top: 50px;">
              <div style="text-align: center;">
                <div style="font-size: 1.5rem; font-family: 'Brush Script MT', cursive, serif; border-bottom: 1px solid #000; width: 200px; margin-bottom: 5px;">Manickavasagar</div>
                <p style="margin: 0; font-size: 0.9rem; color: #64748b;">CEO, CodingBoss</p>
              </div>
              <div style="text-align: center;">
                <div style="font-size: 5rem; color: #eab308;">★</div>
              </div>
              <div style="text-align: center;">
                <div style="font-size: 1.5rem; border-bottom: 1px solid #000; width: 200px; margin-bottom: 5px; padding-bottom: 5px;">${cert.date}</div>
                <p style="margin: 0; font-size: 0.9rem; color: #64748b;">Date of Issue</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    const opt = {
      margin:       0,
      filename:     `${cert.title.replace(/\s+/g, '_')}_Certificate.pdf`,
      image:        { type: 'jpeg', quality: 1 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'landscape' }
    };
    
    html2pdf().set(opt).from(htmlContent).save();
  };

  return (
    <div className="certificates-container">
      <div className="certificates-header">
        <div className="certificates-header-content">
          <h1>My Certificates</h1>
          <p>Showcase your achievements and verify your skills to employers.</p>
        </div>
        <div className="certificates-stats">
          <div className="stat-box">
            <span className="stat-num">{earned.length}</span>
            <span className="stat-label">Earned</span>
          </div>
          <div className="stat-box">
            <span className="stat-num">{locked.length}</span>
            <span className="stat-label">In Progress</span>
          </div>
        </div>
      </div>

      <div className="certificates-section">
        <div className="certificates-grid">
          {loading ? (
            <div style={{ color: '#64748b' }}>Loading certificates...</div>
          ) : earned.length > 0 ? (
            earned.map((cert, index) => (
              <div key={cert.id} className="certificate-card earned" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="certificate-visual">
                  <div className={`cert-seal ${cert.image || 'frontend-cert'}`}>
                    <WorkspacePremium />
                  </div>
                  <div className="cert-watermark">CodingBoss</div>
                </div>
                <div className="certificate-details">
                  <h3>{cert.title}</h3>
                  <p className="issuer">Issued by {cert.issuer || 'CodingBoss'} • {cert.formattedDate}</p>
                  <div className="cert-skills">
                    {cert.skillsArray && cert.skillsArray.map(skill => (
                      <span key={skill} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                </div>
                <div className="certificate-actions">
                  <button className="action-btn primary" onClick={() => handleDownload(cert)}>
                    <Download /> Download PDF
                  </button>
                  <button className="action-btn secondary"><Share /> Share</button>
                </div>
              </div>
            ))
          ) : (
            <div style={{ color: '#64748b' }}>No earned certificates yet.</div>
          )}
        </div>
      </div>

      <div className="certificates-section">
        <h2 className="section-title"><Lock className="section-icon gray" /> Locked Certificates</h2>
        <div className="certificates-grid">
          {loading ? (
            <div style={{ color: '#64748b' }}>Loading locked certificates...</div>
          ) : locked.length > 0 ? (
            locked.map((cert, index) => (
              <div key={cert.id} className="certificate-card locked" style={{ animationDelay: `${(index + earned.length) * 0.1}s` }}>
                <div className="certificate-details">
                  <h3>{cert.title}</h3>
                  <p className="locked-msg">{cert.message || 'Complete required projects to unlock'}</p>
                  
                  <div className="progress-container">
                    <div className="progress-bar-bg">
                      <div className="progress-bar-fill" style={{ width: `${cert.progress || 0}%` }}></div>
                    </div>
                    <span className="progress-text">{cert.progress || 0}% Completed</span>
                  </div>
  
                  <div className="cert-skills locked-skills">
                    {cert.skillsArray && cert.skillsArray.map(skill => (
                      <span key={skill} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                </div>
                <div className="certificate-actions">
                  <button className="action-btn locked-btn" disabled><Lock /> Locked</button>
                </div>
              </div>
            ))
          ) : (
            <div style={{ color: '#64748b' }}>No locked certificates.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Certificates;

import React, { useState } from 'react';
import { FaEnvelope, FaLock, FaKey, FaArrowRight, FaTimes, FaCheckCircle, FaArrowLeft } from 'react-icons/fa';
import apiClient from '../utils/apiClient';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Passwords
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiClient("https://unlanded-isela-unmunificently.ngrok-free.dev/quiz/send-otp/", "POST", { email });
      setStep(2);
    } catch (err) {
      setError(err.message || "Failed to send OTP. Please check your email.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    setLoading(true);

    try {
      await apiClient("https://unlanded-isela-unmunificently.ngrok-free.dev/quiz/reset-password/", "POST", {
        email,
        otp,
        new_password: newPassword
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
        resetModal();
      }, 3000);
    } catch (err) {
      setError(err.message || "Invalid OTP or failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setStep(1);
    setSuccess(false);
    setEmail('');
    setOtp('');
    setNewPassword('');
    setError('');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content forgot-modal animate-fade-in">
        <button className="close-btn" onClick={() => { onClose(); resetModal(); }}><FaTimes /></button>
        
        {success ? (
          <div className="success-view text-center">
            <FaCheckCircle className="success-icon animate-bounce" />
            <h3>Password Reset Successful!</h3>
            <p>Your password has been updated. You can now login with your new credentials.</p>
          </div>
        ) : (
          <>
            <div className="modal-header">
              <h2>{step === 1 ? "Reset Password" : step === 2 ? "Verify OTP" : "Set Password"}</h2>
              <p>
                {step === 1 && "Enter your email to receive a 6-digit OTP."}
                {step === 2 && `Enter the 6-digit code sent to ${email}`}
                {step === 3 && "Choose a new secure password for your account."}
              </p>
            </div>

            {error && <div className="error-msg">{error}</div>}

            <form onSubmit={step === 3 ? handleResetPassword : (e) => e.preventDefault()}>
              {step === 1 && (
                <div className="form-group">
                  <label><FaEnvelope className="me-2" /> Email Address</label>
                  <input
                    type="email"
                    placeholder="name@codingboss.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <button type="button" className="login-btn" onClick={handleSendOTP} disabled={loading || !email}>
                    {loading ? "Sending..." : "Send OTP"}
                    {!loading && <FaArrowRight className="ms-2" />}
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="form-group">
                  <label><FaKey className="me-2" /> 6-Digit OTP</label>
                  <input
                    type="text"
                    placeholder="123456"
                    maxLength="6"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                  <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button type="button" className="back-btn-alt" onClick={() => setStep(1)}>
                      <FaArrowLeft className="me-2" /> Back
                    </button>
                    <button 
                      type="button" 
                      className="login-btn" 
                      style={{ marginTop: 0 }}
                      onClick={() => otp.length === 6 ? setStep(3) : setError("Please enter 6 digits.")}
                    >
                      Verify & Continue
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <>
                  <div className="form-group">
                    <label><FaLock className="me-2" /> New Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '32px' }}>
                    <button type="button" className="back-btn-alt" onClick={() => setStep(2)}>
                      <FaArrowLeft className="me-2" /> Back
                    </button>
                    <button type="submit" className="login-btn" style={{ marginTop: 0 }} disabled={loading}>
                      {loading ? "Resetting..." : "Complete Reset"}
                    </button>
                  </div>
                </>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;

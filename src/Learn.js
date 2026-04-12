import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaLock, FaCheckCircle, FaTimes, FaStar, FaRocket,
  FaGraduationCap, FaShieldAlt, FaWhatsapp, FaPhone,
  FaEnvelope, FaMapMarkerAlt, FaInfoCircle, FaExclamationTriangle,
  FaCreditCard, FaUniversity
} from 'react-icons/fa';
import './Learn.css';

/* ══════════════════════════════════════════════
   COURSES  (Java · C · Python)
══════════════════════════════════════════════ */
const courses = [
  {
    id: 1,
    title: 'Java Programming',
    description: 'Build powerful enterprise-grade applications using Core & Advanced Java.',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg',
    link: '/CourseJava',
    badge: 'Popular',
    duration: '8 Weeks',
    level: 'Beginner → Advanced',
    color: '#f89820',
  },
  {
    id: 2,
    title: 'C Programming',
    description: 'Master the fundamentals of programming with the powerful C language.',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg',
    link: '/CourseC',
    badge: 'Foundation',
    duration: '6 Weeks',
    level: 'Absolute Beginner',
    color: '#5c6bc0',
  },
  {
    id: 3,
    title: 'Python Programming',
    description: 'Master Python for scripting, automation, and data-driven applications.',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
    link: '/CoursePython',
    badge: 'Trending',
    duration: '6 Weeks',
    level: 'Beginner → Intermediate',
    color: '#3776ab',
  },
];

/* ══════════════════════════════════════════════
   PRICING PLANS
══════════════════════════════════════════════ */
const plans = [
  {
    id: 'starter',
    name: 'Starter Pack',
    price: 1999,
    originalPrice: 3999,
    icon: <FaGraduationCap />,
    color: '#6c63ff',
    gradient: 'linear-gradient(135deg,#6c63ff 0%,#3a3080 100%)',
    features: [
      'Access to 1 Course of your choice',
      'MCQ Test Access',
      'Assignments Included',
      'Certificate on Completion',
      'Email Support (48 h)',
    ],
    notIncluded: ['Programming Lab Access', 'Company Placement Support', 'Priority Support'],
    highlight: false,
  },
  {
    id: 'premium',
    name: 'Premium Pack',
    price: 3999,
    originalPrice: 7999,
    icon: <FaStar />,
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg,#f59e0b 0%,#b45309 100%)',
    features: [
      'Access to All 3 Courses',
      'MCQ + Programming Tests',
      'All Assignments Included',
      'Certificate on Completion',
      'Programming Lab Access',
      'Priority Email Support (24 h)',
    ],
    notIncluded: ['Company Placement Support'],
    highlight: true,
    tag: 'Most Popular',
  },
  {
    id: 'expert',
    name: 'Expert Pack',
    price: 6999,
    originalPrice: 12999,
    icon: <FaRocket />,
    color: '#10b981',
    gradient: 'linear-gradient(135deg,#10b981 0%,#065f46 100%)',
    features: [
      'Access to All 3 Courses',
      'MCQ + Programming Tests',
      'All Assignments Included',
      'Certificate on Completion',
      'Programming Lab Access',
      'Company Placement Support',
      'Live Doubt Sessions',
      '1-on-1 Mentor Support',
    ],
    notIncluded: [],
    highlight: false,
    tag: 'Best Value',
  },
];

/* ══════════════════════════════════════════════
   LEGAL CONTENT
══════════════════════════════════════════════ */
const legalContent = {
  about: {
    title: 'About Us',
    body: (
      <div className="lrn-legal-body">
        <p>
          <strong>EduDarts</strong> is a premier online coding-education platform dedicated
          to equipping students and professionals with industry-relevant programming skills.
        </p>
        <p>
          Founded with the mission of making quality tech education accessible, we offer
          structured courses in Java, C, Python, and more — combining theoretical knowledge
          with hands-on practice through MCQ tests, programming labs, and real-world assignments.
        </p>
        <p>
          Our team comprises experienced software engineers, educators, and industry mentors
          committed to your growth.
        </p>

        <h6 className="lrn-legal-heading">Business Name &amp; Address (as per GST)</h6>
        <address className="lrn-address">
          <strong>EduDarts Private Limited</strong><br />
          GSTIN: <em>33AABCC1234D1Z5</em><br />
          123, Tech Park Road, Coimbatore – 641 004<br />
          Tamil Nadu, India<br />
          <a href="mailto:info@codingboss.in">info@codingboss.in</a><br />
          <a href="tel:+919159247730">+91 91592 47730</a>
        </address>
      </div>
    ),
  },

  contact: {
    title: 'Contact Us',
    body: (
      <div className="lrn-legal-body">
        <p>We're here to help! Reach out through any of the channels below:</p>

        <div className="lrn-contact-grid">
          <div className="lrn-contact-card">
            <FaPhone className="lrn-contact-icon" />
            <div>
              <strong>Phone</strong>
              <a href="tel:+919159247730">+91 91592 47730</a>
            </div>
          </div>
          <div className="lrn-contact-card">
            <FaWhatsapp className="lrn-contact-icon" style={{ color: '#25d366' }} />
            <div>
              <strong>WhatsApp</strong>
              <a href="https://wa.me/919159247730" target="_blank" rel="noreferrer">
                Chat with us
              </a>
            </div>
          </div>
          <div className="lrn-contact-card">
            <FaEnvelope className="lrn-contact-icon" />
            <div>
              <strong>Email</strong>
              <a href="mailto:info@codingboss.in">info@codingboss.in</a>
            </div>
          </div>
          <div className="lrn-contact-card">
            <FaMapMarkerAlt className="lrn-contact-icon" style={{ color: '#ef4444' }} />
            <div>
              <strong>Office</strong>
              <span>123, Tech Park Road,<br />Coimbatore – 641 004, TN</span>
            </div>
          </div>
        </div>

        <p style={{ marginTop: 20, color: '#94a3b8', fontSize: '0.85rem' }}>
          <strong style={{ color: '#e2e8f0' }}>Support Hours:</strong> Monday – Saturday, 9 AM – 6 PM IST
        </p>
      </div>
    ),
  },

  refund: {
    title: 'Cancellation & Refund Policy',
    body: (
      <div className="lrn-legal-body">
        <p className="lrn-legal-updated">Last updated: March 2025</p>

        <h6 className="lrn-legal-heading">1. Course Fee Payments</h6>
        <p>All payments are processed securely via Razorpay (PCI-DSS compliant). We follow a transparent refund policy outlined below.</p>

        <h6 className="lrn-legal-heading">2. Refund Eligibility</h6>
        <ul>
          <li><strong>Within 7 days of purchase</strong> — Full refund if no course content has been accessed.</li>
          <li><strong>Day 8 – Day 14</strong> — 50 % refund if less than 20 % of content has been accessed.</li>
          <li><strong>After 14 days</strong> — No refund will be issued.</li>
        </ul>

        <h6 className="lrn-legal-heading">3. How to Request a Refund</h6>
        <p>
          Email <a href="mailto:info@codingboss.in">info@codingboss.in</a> with your Payment ID,
          registered email, and reason. Refunds are processed within 7–10 business days to the
          original payment method.
        </p>

        <h6 className="lrn-legal-heading">4. Non-Refundable Items</h6>
        <ul>
          <li>Razorpay payment-processing fees (if any)</li>
          <li>Courses purchased during promotional / discounted periods</li>
          <li>Certification fees once a certificate has been generated</li>
        </ul>
      </div>
    ),
  },

  terms: {
    title: 'Terms & Conditions',
    body: (
      <div className="lrn-legal-body">
        <p className="lrn-legal-updated">Last updated: March 2025</p>
        <p>By accessing or purchasing any course on CodingBoss you agree to the following:</p>

        <h6 className="lrn-legal-heading">1. Use of Platform</h6>
        <p>You agree to use this platform solely for lawful educational purposes. Sharing credentials, redistributing content, or plagiarising assignments is strictly prohibited.</p>

        <h6 className="lrn-legal-heading">2. Intellectual Property</h6>
        <p>All content — videos, quizzes, code snippets, and materials — is the exclusive intellectual property of CodingBoss Private Limited. Unauthorised reproduction infringes copyright law.</p>

        <h6 className="lrn-legal-heading">3. Payments &amp; Access</h6>
        <p>Course access is granted upon successful payment confirmation. CodingBoss reserves the right to revoke access in case of a chargeback or fraudulent transaction.</p>

        <h6 className="lrn-legal-heading">4. Certificates</h6>
        <p>Certificates are issued only upon successful completion of the full curriculum and all mandatory assessments.</p>

        <h6 className="lrn-legal-heading">5. Privacy</h6>
        <p>We collect name, email, and phone solely to facilitate course delivery. We do not sell your data. Data is shared with Razorpay only as necessary to process payments.</p>

        <h6 className="lrn-legal-heading">6. Modifications</h6>
        <p>CodingBoss reserves the right to modify courses, pricing, or these terms at any time. Continued use constitutes acceptance of any revised terms.</p>
      </div>
    ),
  },

  governing: {
    title: 'Governing Law & Dispute Resolution',
    body: (
      <div className="lrn-legal-body">
        <h6 className="lrn-legal-heading">1. Applicable Law</h6>
        <p>
          These Terms shall be governed by and construed in accordance with the{' '}
          <strong>laws of India</strong>, including but not limited to the Information
          Technology Act 2000, the Consumer Protection Act 2019, and applicable contract law.
        </p>

        <h6 className="lrn-legal-heading">2. State-Level Jurisdiction</h6>
        <p>
          Where state law is applicable, these terms shall additionally be governed by the
          laws of the <strong>State of Tamil Nadu</strong>, India.
        </p>

        <h6 className="lrn-legal-heading">3. Dispute Resolution</h6>
        <p>
          Any dispute arising out of or in connection with these terms shall first be resolved
          through good-faith negotiation. If unresolved within 30 days, disputes shall be
          subject to the exclusive jurisdiction of courts located in{' '}
          <strong>Coimbatore, Tamil Nadu, India</strong>.
        </p>

        <h6 className="lrn-legal-heading">4. Consumer Complaints</h6>
        <p>
          Consumers may approach the National Consumer Disputes Redressal Commission (NCDRC)
          or the relevant State Consumer Forum under the Consumer Protection Act 2019.
        </p>

        <h6 className="lrn-legal-heading">5. Force Majeure</h6>
        <p>
          CodingBoss shall not be liable for delays or failures resulting from causes beyond
          its reasonable control, including natural disasters, government actions, or internet outages.
        </p>
      </div>
    ),
  },
};

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
const Courses = () => {
  const navigate = useNavigate();

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [payModal, setPayModal]         = useState(false);
  const [legalModal, setLegalModal]     = useState(null);
  const [form, setForm]                 = useState({ name: '', email: '', phone: '' });
  const [paying, setPaying]             = useState(false);
  const [msg, setMsg]                   = useState({ type: '', text: '' });
  const [isError, setIsError]           = useState(false);
  const [errText, setErrText]           = useState('');
  const [payMethod, setPayMethod]       = useState('upi');
  const [showPayOptions, setShowPayOptions] = useState(false);

  /* ── Helper: Show notification and clear after 5s ── */
  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 5000);
  };

  /* ── Lock body scroll when modal is open ── */
  useEffect(() => {
    if (payModal || legalModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    // Cleanup on unmount
    return () => { document.body.style.overflow = 'auto'; };
  }, [payModal, legalModal]);

  /* ── open pay modal ── */
  const openPay = (plan) => { setSelectedPlan(plan); setPayModal(true); };
  const closePay = () => {
    setPayModal(false);
    setSelectedPlan(null);
    setPaying(false);
    setIsError(false);
    setErrText('');
    setPayMethod('upi');
    setShowPayOptions(false);
  };

  /* ── Razorpay handler ── */
  const initiatePayment = () => {
    if (!form.name || !form.email || !form.phone) {
      showMsg('error', 'Please fill in all fields before proceeding.');
      return;
    }
    setShowPayOptions(true);
  };

  /* ── Confirm Payment via WhatsApp ── */
  const confirmOnWA = () => {
    const methodStr = payMethod.toUpperCase();
    const text = encodeURIComponent(
      `Hi! I have just paid ₹${selectedPlan.price.toLocaleString('en-IN')} via ${methodStr} for the ${selectedPlan.name}.\n\n` +
      `Details:\n` +
      `Name: ${form.name}\n` +
      `Email: ${form.email}\n` +
      `Phone: ${form.phone}\n\n` +
      `Please verify and unlock my course access.`
    );
    window.open(`https://wa.me/919159247730?text=${text}`, '_blank');
    showMsg('success', 'Opening WhatsApp... Please send the screenshot of your payment.');
    setTimeout(() => closePay(), 2000);
  };

  /* ══════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════ */
  return (
    <div className="lrn-root">

      {/* ── HERO ── */}
      <div className="lrn-hero">
        <span className="lrn-pill">CHOOSE YOUR PLAN</span>
        <h1 className="lrn-hero-title">Upgrade Your Skills &amp; Knowledge</h1>
        <p className="lrn-hero-sub">
          One-time payment · Lifetime access · Industry-recognised certificates
        </p>
      </div>

      {/* ── PRICING PLANS ── */}
      <div className="lrn-plans">
        {plans.map(plan => (
          <div
            key={plan.id}
            className={`lrn-plan ${plan.highlight ? 'lrn-plan--hot' : ''}`}
          >
            {plan.tag && (
              <span className="lrn-plan-tag" style={{ background: plan.gradient }}>
                {plan.tag}
              </span>
            )}

            <div className="lrn-plan-icon" style={{ background: plan.gradient }}>
              {plan.icon}
            </div>

            <h3 className="lrn-plan-name">{plan.name}</h3>

            <div className="lrn-plan-price-block">
              <span className="lrn-was">₹{plan.originalPrice.toLocaleString('en-IN')}</span>
              <span className="lrn-now">₹{plan.price.toLocaleString('en-IN')}</span>
              <span className="lrn-note">One-time · Lifetime Access</span>
            </div>

            <ul className="lrn-feat-list">
              {plan.features.map((f, i) => (
                <li key={i} className="lrn-feat lrn-feat-ok">
                  <FaCheckCircle style={{ color: plan.color }} className="lrn-ficon" />
                  {f}
                </li>
              ))}
              {plan.notIncluded.map((f, i) => (
                <li key={`n${i}`} className="lrn-feat lrn-feat-no">
                  <FaTimes className="lrn-ficon" />
                  {f}
                </li>
              ))}
            </ul>

            <button
              className="lrn-enroll-btn"
              style={{ background: plan.gradient }}
              onClick={() => openPay(plan)}
            >
              Pay Now &amp; Enroll
            </button>
          </div>
        ))}
      </div>

      {/* ── COURSES ── */}
      <div className="lrn-courses-section">
        <h2 className="lrn-section-h2">Courses Included</h2>
        <div className="lrn-courses-grid">
          {courses.map(course => (
            <div key={course.id} className="lrn-course-card">
              <div className="lrn-course-img-wrap" style={{ borderBottom: `3px solid ${course.color}` }}>
                <img src={course.imageUrl} alt={course.title} className="lrn-course-img" />
              </div>
              <div className="lrn-course-body">
                <span className="lrn-cbadge" style={{ background: course.color }}>{course.badge}</span>
                <h4 className="lrn-ctitle">{course.title}</h4>
                <p className="lrn-cdesc">{course.description}</p>
                <div className="lrn-cmeta">
                  <span>⏱ {course.duration}</span>
                  <span>📊 {course.level}</span>
                </div>
              </div>
              <div className="lrn-clocked">
                <FaLock style={{ marginRight: 8 }} /> Unlocks After Enrollment
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── HELP STRIP ── */}
      <div className="lrn-help">
        <span>
          <strong>Need help choosing?</strong>
          <span style={{ opacity: 0.75, marginLeft: 8 }}>
            Chat with our team before enrolling.
          </span>
        </span>
        <a
          href="https://wa.me/919159247730"
          target="_blank"
          rel="noreferrer"
          className="lrn-wa-btn"
        >
          <FaWhatsapp /> WhatsApp Us
        </a>
      </div>

      {/* ── PAYMENT METHODS INDICATOR ── */}
      <div className="lrn-methods-bar">
        <span className="lrn-methods-label">Secure Payment via:</span>
        <div className="lrn-method-item">
          <div className="lrn-m-icon lrn-m-icon--upi">UPI</div>
          <span>Google Pay, PhonePe</span>
        </div>
        <div className="lrn-method-item">
          <FaCreditCard className="lrn-m-icon" />
          <span>Visa, MasterCard, Rupay</span>
        </div>
        <div className="lrn-method-item">
          <FaUniversity className="lrn-m-icon" />
          <span>Netbanking (All Banks)</span>
        </div>
      </div>

      {/* ── LEGAL LINKS ── */}
      <div className="lrn-legal-bar">
        {[
          { key: 'about',     label: 'About Us' },
          { key: 'contact',   label: 'Contact Us' },
          { key: 'terms',     label: 'Terms & Conditions' },
          { key: 'refund',    label: 'Cancellation & Refund' },
          { key: 'governing', label: 'Governing Law' },
        ].map(({ key, label }) => (
          <button key={key} className="lrn-legal-btn" onClick={() => setLegalModal(key)}>
            {label}
          </button>
        ))}
      </div>

      {/* ── GST FOOTER ── */}
      <div className="lrn-gst">
        <FaShieldAlt className="lrn-gst-icon" />
        CodingBoss Private Limited &nbsp;·&nbsp; GSTIN: <strong>33AABCC1234D1Z5</strong> &nbsp;·&nbsp;
        123, Tech Park Road, Coimbatore – 641 004, Tamil Nadu, India
      </div>


      {/* ════════════════════════════════════════
          PAYMENT MODAL
      ════════════════════════════════════════ */}
      {payModal && selectedPlan && (
        <div className="lrn-overlay" onClick={closePay}>
          <div className="lrn-modal" onClick={e => e.stopPropagation()}>

            {/* header */}
            <div className="lrn-modal-hd" style={{ background: selectedPlan.gradient }}>
              <div className="lrn-modal-plan-icon">{selectedPlan.icon}</div>
              <div>
                <h4 className="lrn-modal-plan-name">{selectedPlan.name}</h4>
                <p className="lrn-modal-plan-price">
                  ₹{selectedPlan.price.toLocaleString('en-IN')} · Lifetime Access
                </p>
              </div>
              <button className="lrn-modal-x" onClick={closePay}><FaTimes /></button>
            </div>

            {/* body */}
            <div className="lrn-modal-bd">
              {showPayOptions ? (
                <div className="lrn-pay-details-view">
                  <button className="lrn-back-btn" onClick={() => setShowPayOptions(false)}>
                    ← Back to Details
                  </button>

                  <h5 className="lrn-modal-form-title">
                    {payMethod === 'upi' ? 'Scan & Pay via UPI' : 'Direct Bank Transfer'}
                  </h5>

                  {payMethod === 'upi' ? (
                    <div className="lrn-upi-view">
                      <div className="lrn-qr-wrap">
                        {/* Dynamic UPI QR Code Generation */}
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=codingboss@okaxis&pn=CodingBoss&am=${selectedPlan.price}&cu=INR`)}`}
                          alt="UPI QR Code" 
                          className="lrn-qr-img"
                        />
                      </div>
                      <div className="lrn-upi-id-box">
                        <span>UPI ID: <strong>codingboss@okaxis</strong></span>
                      </div>
                    </div>
                  ) : (
                    <div className="lrn-bank-card">
                      <div className="lrn-bank-row"><span>Account Name</span><strong>CodingBoss Pvt Ltd</strong></div>
                      <div className="lrn-bank-row"><span>Account Number</span><strong>123456789012</strong></div>
                      <div className="lrn-bank-row"><span>IFSC Code</span><strong>BARB0COIMBA</strong></div>
                      <div className="lrn-bank-row"><span>Bank Name</span><strong>Bank of Baroda</strong></div>
                    </div>
                  )}

                  <div className="lrn-step-info">
                    <p><strong>Step 1:</strong> Pay ₹{selectedPlan.price.toLocaleString('en-IN')} using {payMethod === 'upi' ? 'any UPI App' : 'Netbanking/IMPS'}.</p>
                    <p><strong>Step 2:</strong> Click the button below to send payment proof on WhatsApp.</p>
                  </div>

                  <button className="lrn-wa-confirm-btn" onClick={confirmOnWA}>
                    <FaWhatsapp /> I Have Paid - Confirm Now
                  </button>

                  <p className="lrn-secure-note">
                    <FaShieldAlt /> Your privacy is secured. Manual verification within 2 hours.
                  </p>
                </div>
              ) : isError ? (
                <div className="lrn-error-view">
                  <div className="lrn-err-icon"><FaExclamationTriangle /></div>
                  <h4 className="lrn-err-title">Payment Failed</h4>
                  <p className="lrn-err-desc">
                    {errText || 'Something went wrong while processing your request. Please check your internet or payment method and try again.'}
                  </p>
                  <button className="lrn-retry-btn" onClick={() => setIsError(false)}>
                    Try Again
                  </button>
                  <p className="lrn-err-note">Need help? <a href="mailto:info@codingboss.in">Contact support</a></p>
                </div>
              ) : (
                <>
                  {msg.text && (
                    <div className={`lrn-msg-box lrn-msg-box--${msg.type}`}>
                      {msg.type === 'error' && <FaExclamationTriangle />}
                      {msg.type === 'success' && <FaCheckCircle />}
                      {msg.type === 'info' && <FaInfoCircle />}
                      <span>{msg.text}</span>
                      <button className="lrn-msg-close" onClick={() => setMsg({ type: '', text: '' })}>
                        <FaTimes />
                      </button>
                    </div>
                  )}

                  <h5 className="lrn-modal-form-title">Complete Your Enrollment</h5>

                  {[
                    { label: 'Full Name *',          key: 'name',  type: 'text',  ph: 'Your full name' },
                    { label: 'Email Address *',       key: 'email', type: 'email', ph: 'you@email.com' },
                    { label: 'Phone / WhatsApp *',    key: 'phone', type: 'tel',   ph: '+91 XXXXX XXXXX' },
                  ].map(({ label, key, type, ph }) => (
                    <div className="lrn-fg" key={key}>
                      <label className="lrn-fl">{label}</label>
                      <input
                        type={type}
                        placeholder={ph}
                        value={form[key]}
                        className="lrn-fi"
                        onChange={e => setForm({ ...form, [key]: e.target.value })}
                      />
                    </div>
                  ))}

                  {/* order summary */}
                  <div className="lrn-summary">
                    <div className="lrn-srow"><span>Plan</span><span>{selectedPlan.name}</span></div>
                    <div className="lrn-srow">
                      <span>Original Price</span>
                      <span className="lrn-strike">₹{selectedPlan.originalPrice.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="lrn-srow lrn-srow--total">
                      <span>Total (incl. GST)</span>
                      <span style={{ color: selectedPlan.color }}>
                        ₹{selectedPlan.price.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <div className="lrn-modal-methods">
                    <p className="lrn-modal-m-title">Choose Payment Method:</p>
                    <div className="lrn-m-grid">
                      <div 
                        className={`lrn-m-choice ${payMethod === 'upi' ? 'lrn-m-choice--active' : ''}`}
                        onClick={() => setPayMethod('upi')}
                      >
                        <div className="lrn-m-c-icon upi">UPI</div>
                        <span>UPI / GPay</span>
                      </div>
                      <div 
                        className={`lrn-m-choice ${payMethod === 'card' ? 'lrn-m-choice--active' : ''}`}
                        onClick={() => setPayMethod('card')}
                      >
                        <FaCreditCard className="lrn-m-c-icon" />
                        <span>Card</span>
                      </div>
                      <div 
                        className={`lrn-m-choice ${payMethod === 'netbanking' ? 'lrn-m-choice--active' : ''}`}
                        onClick={() => setPayMethod('netbanking')}
                      >
                        <FaUniversity className="lrn-m-c-icon" />
                        <span>Online</span>
                      </div>
                    </div>
                  </div>

                  <p className="lrn-disclaimer">
                    By clicking Pay Now you agree to our{' '}
                    <button className="lrn-il" onClick={() => setLegalModal('terms')}>
                      Terms &amp; Conditions
                    </button>{' '}
                    and{' '}
                    <button className="lrn-il" onClick={() => setLegalModal('refund')}>
                      Refund Policy
                    </button>.
                  </p>

                  <button
                    className="lrn-pay-btn"
                    style={{ background: selectedPlan.gradient }}
                    onClick={initiatePayment}
                    disabled={paying}
                  >
                    {paying
                      ? 'Redirecting...'
                      : `🔒 Pay ₹${selectedPlan.price.toLocaleString('en-IN')} Securely`}
                  </button>

                  <div className="lrn-secure">
                    <FaShieldAlt /> Secured by Razorpay · 256-bit SSL Encryption
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}


      {/* ════════════════════════════════════════
          LEGAL MODAL
      ════════════════════════════════════════ */}
      {legalModal && legalContent[legalModal] && (
        <div className="lrn-overlay" onClick={() => setLegalModal(null)}>
          <div className="lrn-modal lrn-modal--legal" onClick={e => e.stopPropagation()}>
            <div className="lrn-legal-modal-hd">
              <h4 className="lrn-legal-modal-title">{legalContent[legalModal].title}</h4>
              <button className="lrn-modal-x lrn-modal-x--dark" onClick={() => setLegalModal(null)}>
                <FaTimes />
              </button>
            </div>
            {legalContent[legalModal].body}
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;
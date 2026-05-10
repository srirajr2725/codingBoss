import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FaInstagram, FaLinkedin, FaPhone, FaEnvelope } from 'react-icons/fa';
import './Footer.css';
const Footer = () => {
  return (
    <footer className="footer border-top">
      <div>
        <Row className="align-items-end justify-content-end p-4">
          <Col md={6} className="mb-3 mb-md-0 text-start">
            <p className="mb-0">
              © {new Date().getFullYear()} <strong>CodingBoss</strong>. All rights reserved.
            </p>
          </Col>
          <Col md={6} className="d-flex flex-column align-items-md-end text-md-end gap-2">
          {/* <ContactItem 
              href="tel:9159247730"
              label="9159247730"
              icon={<FaPhone />}
            /> */}
            <ContactItem 
              href="mailto:info@codingboss.com"
              label="info@codingboss.com"
              icon={<FaEnvelope />}
            />
            <ContactItem 
              href="https://instagram.com/codingboss_2.0"
              label="instagram.com/codingboss_2.0"
              icon={<FaInstagram />}
            />
            <ContactItem 
              href="https://linkedin.com/company/codingboss"
              label="linkedin.com/company/codingboss"
              icon={<FaLinkedin />}
            />                      
          </Col>
        </Row>
      </div>
    </footer>
  );
};
const ContactItem = ({ href, label, icon }) => (
  <a 
    href={href} 
    target={href.startsWith('http') ? "_blank" : undefined}
    rel={href.startsWith('http') ? "noopener noreferrer" : undefined}
    className="d-flex align-items-center gap-2 text-decoration-none text-light"
    aria-label={label}
  >
    <span>{label}</span>
    {icon}
  </a>
);
export default Footer;

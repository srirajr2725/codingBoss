import React, { useState } from 'react';
import axios from 'axios';
import { Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import './Enquiry.css';
import apiClient from './utils/apiClient';


const Enquiry = () => {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    email: '',
  })
  const [loading, setLoading] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  // Update formData on input change
  const handleChange = (e) => {
    const { id, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }))
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true) // Start loading
    setSubmitSuccess(false) // Reset success state
    setSubmitError(null) // Reset error state

    try {
      const response = await apiClient(
        'quiz/post-query/post-enqueries',
        'POST',
        formData,
        { 'Content-Type': 'application/json' }
      )

      // Handle successful response
      if (response) {
        setSubmitSuccess(true)
        setFormData({ name: '', contact: '', email: '' }) // Reset form fields
      } else {
        setSubmitError("Please try again later.")
      }
      } catch (error) {
        // console.error("Error submitting form:")
      
        if (error.message) {
          setSubmitError("Submission failed. Please try again.")
        } else {
          setSubmitError("Please contact support if the issue persists.")
        }
      } finally {
        setLoading(false) // Stop loading after submission attempt
      }      
  }

  return (
    <div className="enquiry-container my-5">
      <Row className="align-items-center call-to-action-row">
        {/* Left Column with Description */}
        <Col md={6} className="text-left">
          <Card className="call-to-action-card h-100">
            <Card.Body>
              <h1>
                <b>Get Started</b>
              </h1>
              <h2>Ready to become the next success story?</h2>
              <ul className="cta-list">
                <li>Discover new courses & preparatory materials</li>
                <li>Practice with our company-specific mock tests</li>
                <li>Improve your performance using our Advanced Analytics</li>
                <li>Ace the interviews and launch a career</li>
                <li>Get access to special courses and programs</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>

        {/* Right Column with Contact Form */}
        <Col md={6} className="text-center">
          <Card>
            <Card.Body>
              <h1>
                <b>Let's Talk!</b>
              </h1>
              {/* Success and Error Messages */}
              {submitSuccess && (
                <Alert variant="success">Form submitted successfully!</Alert>
              )}
              {submitError && <Alert variant="danger">{submitError}</Alert>}

              {/* Contact Form */}
              <Form onSubmit={handleSubmit}>
                {/* Name Input */}
                <Form.Group controlId="name">
                  <Form.Control
                    type="text"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                <br />

                {/* Contact Number Input */}
                <Form.Group controlId="contact">
                  <Form.Control
                    type="text"
                    placeholder="Contact number"
                    value={formData.contact}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                <br />

                {/* Email Input */}
                <Form.Group controlId="email">
                  <Form.Control
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                <br />

                {/* Submit Button with Loading Spinner */}
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    'Book a Call'
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
};

export default Enquiry;

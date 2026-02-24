import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import 'bootstrap/dist/css/bootstrap.min.css'
import './Chat.css' // Import the CSS file
import apiClient from './utils/apiClient'


const Chat = ({ closeChat }) => {
  const [step, setStep] = useState(0)
  const [chatMessages, setChatMessages] = useState([
    {
      type: 'ai',
      text: 'I am happy to welcome you to Thiran360AI as a Thiran Assistant.',
    },
    { type: 'ai', text: 'Your Full Name?' },
  ])
  const [userResponse, setUserResponse] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState()
  const [jsonData, setJsonData] = useState({})
  const [file, setFile] = useState(null)
  const [showRoleOptions, setShowRoleOptions] = useState(true)
  const [showThankYou, setShowThankYou] = useState(false)

  const chatBoxRef = useRef(null)

  const updateJsonData = (key, value) => {
    setJsonData((prevData) => ({
      ...prevData,
      [key]: value,
    }))
  }

  const handleNextStep = () => {
    switch (step) {
      case 0:
        setName(userResponse)
        updateJsonData('name', userResponse)
        setChatMessages((prevMessages) => [
          ...prevMessages,
          { type: 'user', text: userResponse },
          {
            type: 'ai',
            text: `Nice to meet you, ${userResponse}. Please choose from the options below`,
            roleOptions: true,
          },
        ])
        setUserResponse('')
        setStep(1)
        break

      case 1:
        if (role) {
          updateJsonData('role', role)
          setChatMessages((prevMessages) => [
            ...prevMessages,
            { type: 'user', text: role },
            {
              type: 'ai',
              text:
                role === "I'm seeking for a job"
                  ? 'Kindly share your resume with us.'
                  : 'Describe it',
            },
          ])
          setStep(role === "I'm seeking for a job" ? 2 : 21)
          setShowRoleOptions(false)
        }
        break

      // Job Seeker: Step 2 - Resume Upload
      case 2:
        if (file) {
          updateJsonData('resume', file.name)
          setChatMessages((prevMessages) => [
            ...prevMessages,
            { type: 'user', text: file.name },
            {
              type: 'ai',
              text: 'Can you give us a quick introduction about who you are?',
            },
          ])
          setUserResponse('')
          setStep(7)
        }
        // else {
        //   setChatMessages((prevMessages) => [
        //     ...prevMessages,
        //     { type: 'ai', text: 'Please upload a resume to proceed.' },
        //   ])
        // }
        break

      // Client: Step 9 - Document Upload
      case 9:
        if (file) {
          updateJsonData('documentUpload', file.name)
          setChatMessages((prevMessages) => [
            ...prevMessages,
            { type: 'user', text: file.name },
            { type: 'ai', text: 'Tell us more about your company.' },
          ])
          setUserResponse('')
          setStep(4)
        }
        break

      // Client: Step 4 - Company Description
      case 4:
        updateJsonData('companyDescription', userResponse)
        setChatMessages((prevMessages) => [
          ...prevMessages,
          { type: 'user', text: userResponse },
          {
            type: 'ai',
            text: 'Kindly provide the link to your company’s website or social channels.',
          },
        ])
        setUserResponse('')
        setStep(5)
        break

      case 5:
        if (userResponse.trim() !== '') {
          updateJsonData('companyWebsite', userResponse)
          setChatMessages((prevMessages) => [
            ...prevMessages,
            { type: 'user', text: userResponse },
            {
              type: 'ai',
              text: 'Could you share your contact details for better communication?',
            },
          ])
          setUserResponse('')
          setStep(10)
        }
        break

      case 6:
        updateJsonData('skills', userResponse)
        setChatMessages((prevMessages) => [
          ...prevMessages,
          { type: 'user', text: userResponse },
          {
            type: 'ai',
            text: 'Could you share your professional goals with us?',
          },
        ])
        setUserResponse('')
        setStep(8)
        break

      case 8:
        updateJsonData('careerGoals', userResponse)
        setChatMessages((prevMessages) => [
          ...prevMessages,
          { type: 'user', text: userResponse },
          { type: 'ai', text: 'Are you willing to relocate for employment?' },
        ])
        setUserResponse('')
        setStep(10)
        break

      case 10:
        // Use apiClient for the POST request
        const sendFloorPlanData = async () => {
          try {
            const response = await apiClient(
              'building/generate_floor_plan/',
              'POST',
              jsonData
            )

            console.log('Data sent successfully:', response)

            // Update the chat with a success message or next steps if needed
            setChatMessages((prevMessages) => [
              ...prevMessages,
              {
                type: 'ai',
                text: 'Your data has been submitted successfully! Thank you.',
              },
            ])

            // Show thank you message
            setShowThankYou(true)
            setTimeout(() => {
              setShowThankYou(false)
              closeChat()
            }, 3000)
          } catch (error) {
            // console.error('Error sending data:', error)

            // Show error message in chat
            setChatMessages((prevMessages) => [
              ...prevMessages,
              {
                type: 'ai',
                text: 'There was an error submitting your data. Please try again later.',
              },
            ])
          }
        }

        sendFloorPlanData()
        break

      // After the resume upload, extend the next steps for job seekers

      case 7:
        updateJsonData('selfIntroduction', userResponse)
        setChatMessages((prevMessages) => [
          ...prevMessages,
          { type: 'user', text: userResponse },
          { type: 'ai', text: 'Please provide your phone number.' },
        ])
        setUserResponse('')
        setStep(11)
        break

      case 11: // Collect Phone Number
        updateJsonData('phoneNumber', userResponse)
        setChatMessages((prevMessages) => [
          ...prevMessages,
          { type: 'user', text: userResponse },
          { type: 'ai', text: 'Please provide your email address.' },
        ])
        setUserResponse('')
        setStep(12)
        break

      case 12: // Collect Email
        updateJsonData('email', userResponse)
        setChatMessages((prevMessages) => [
          ...prevMessages,
          { type: 'user', text: userResponse },
          { type: 'ai', text: 'What is your current location?' },
        ])
        setUserResponse('')
        setStep(13)
        break

      case 13: // Collect Current Location
        updateJsonData('currentLocation', userResponse)
        setChatMessages((prevMessages) => [
          ...prevMessages,
          { type: 'user', text: userResponse },
          { type: 'ai', text: 'What is your native location?' },
        ])
        setUserResponse('')
        setStep(14)
        break

      case 14: // Collect Native Location
        updateJsonData('nativeLocation', userResponse)
        setChatMessages((prevMessages) => [
          ...prevMessages,
          { type: 'user', text: userResponse },
          {
            type: 'ai',
            text: 'What year did you pass out of your last educational qualification?',
          },
        ])
        setUserResponse('')
        setStep(15)
        break

      case 15: // Collect Passed Out Year
        updateJsonData('passedOutYear', userResponse)
        setChatMessages((prevMessages) => [
          ...prevMessages,
          { type: 'user', text: userResponse },
          {
            type: 'ai',
            text: 'Post Graduate Degree and Percentage (Otherwise N/A)',
          },
        ])
        setUserResponse('')
        setStep(16)
        break

      case 16: // Collect PG Degree and Percentage
        updateJsonData('pgDegree', userResponse)
        setChatMessages((prevMessages) => [
          ...prevMessages,
          { type: 'user', text: userResponse },
          {
            type: 'ai',
            text: 'Post Graduate College Name (Otherwise N/A)',
          },
        ])
        setUserResponse('')
        setStep(17)
        break

      case 17: // Collect PG College Name
        updateJsonData('pgCollegeName', userResponse)
        setChatMessages((prevMessages) => [
          ...prevMessages,
          { type: 'user', text: userResponse },
          { type: 'ai', text: 'Under Graduate Degree and Percentage' },
        ])
        setUserResponse('')
        setStep(18)
        break

      case 18: // Collect UG Degree and Percentage
        updateJsonData('ugDegree', userResponse)
        setChatMessages((prevMessages) => [
          ...prevMessages,
          { type: 'user', text: userResponse },
          { type: 'ai', text: 'Under Graduate College Name' },
        ])
        setUserResponse('')
        setStep(19)
        break

      case 19: // Collect UG College Name
        updateJsonData('ugCollegeName', userResponse)
        setChatMessages((prevMessages) => [
          ...prevMessages,
          { type: 'user', text: userResponse },
          {
            type: 'ai',
            text: '12th / PUC / Diploma and Percentage',
          },
        ])
        setUserResponse('')
        setStep(20)
        break

      case 20: // Collect 12th/Diploma/PUC Percentage
        updateJsonData('higherEducationPercentage', userResponse)
        setChatMessages((prevMessages) => [
          ...prevMessages,
          { type: 'user', text: userResponse },
          {
            type: 'ai',
            text: 'Enter your LinkedIn URL (Follow our LinkedIn page for company updates and insights, and go through the page to express your interest in joining our team!)',
            link: 'https://www.linkedin.com/company/thiran360ai',
          },
        ])
        setUserResponse('')
        setStep(10)
        break

      case 21: // Client Project describe it
        updateJsonData('phoneNumber', userResponse)
        setChatMessages((prevMessages) => [
          ...prevMessages,
          { type: 'user', text: userResponse },
          {
            type: 'ai',
            text: 'If you have relevant files,please upload them.',
          },
        ])
        setUserResponse('')
        setStep(9)
        break

      default:
        break
    }
  }

  useEffect(() => {
    if (role) {
      handleNextStep()
    }
  }, [role])

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole)
  }

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && step !== 4 && step !== 9) {
      handleNextStep()
    }
  }

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight
    }
  }, [chatMessages])

  return (
    <div className="chat-modal">
      {showThankYou ? (
        <div className="thank-you-card">
          <div className="thank-you-message">
            <span>
              Thank you for chatting with us! We will be in touch soon.
            </span>
          </div>
        </div>
      ) : (
        <>
          <div className="chat-header">
            <div className="chat-logo">
              <img
                src="https://t4.ftcdn.net/jpg/05/88/95/25/240_F_588952520_7AzwyRgAF2EqyWxDbDbGmM0ssPwgrogb.jpg"
                alt="Chat Logo"
              />
              <span className="chat-title">Chat with Thiran Assistant</span>
            </div>
            <button className="close-button" onClick={closeChat}>
              &times;
            </button>
          </div>
          <div id="chat-box" className="chat-box" ref={chatBoxRef}>
            {chatMessages.map((message, index) => (
              <div key={index} className={`chat-message ${message.type}`}>
                <span className="mb-2">
                  {message.text}{' '}
                  {message.link && (
                    <a
                      href={message.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {message.link}
                    </a>
                  )}
                </span>

                {message.roleOptions && showRoleOptions && (
                  <div className="role-options">
                    <button
                      className="btn btn-primary"
                      onClick={() => handleRoleSelect('I need software')}
                    >
                      I need software
                    </button>
                    <button
                      className="btn btn-secondary ms-2"
                      onClick={() => handleRoleSelect("I'm seeking for a job")}
                    >
                      I'm seeking for a job
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {(step === 2 || step === 9) && (
            <div className="chat-message user file-upload-input d-flex justify-content-end align-items-center">
              <div
                className="file-upload-container"
                style={{ maxWidth: '250px' }}
              >
                <input
                  type="file"
                  className="form-control"
                  onChange={handleFileChange}
                  style={{ width: '100%', padding: '5px', fontSize: '14px' }}
                />
                <button
                  className="btn btn-primary btn-sm mt-2"
                  style={{ width: '100%', fontSize: '14px' }}
                  onClick={handleNextStep}
                >
                  Upload and Continue
                </button>
              </div>
            </div>
          )}

          {step !== 2 && step !== 9 && (
            <div className="input-container">
              <textarea
                type="text"
                className="form-control"
                placeholder="Type your message here..."
                value={userResponse}
                onChange={(e) => setUserResponse(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button className="btn btn-primary" onClick={handleNextStep}>
                Send
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Chat

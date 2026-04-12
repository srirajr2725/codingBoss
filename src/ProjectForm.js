import React, { useState, useEffect, useRef } from "react";
import apiClient from "./utils/apiClient";
import "bootstrap/dist/css/bootstrap.min.css";

const ProjectForm = ({ closeChat }) => {
  const [step, setStep] = useState(0);
  const [chatMessages, setChatMessages] = useState([
    { type: "ai", text: "Welcome CodingBoss! Let's get started with your project booking." },
    { type: "ai", text: "May I know your name?" },
  ]);
  const [userResponse, setUserResponse] = useState("");
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", techStack: "", requirements: "", documents: [],
  });

  const chatBoxRef = useRef(null);

  const handleNextStep = async () => {
    let newMessages = [];

    switch (step) {
      case 0:
        setFormData({ ...formData, name: userResponse });
        newMessages = [
          { type: "user", text: userResponse },
          { type: "ai", text: `Nice to meet you, ${userResponse}! Could you share your email address?` }
        ];
        setStep(1);
        break;

      case 1:
        setFormData({ ...formData, email: userResponse });
        newMessages = [
          { type: "user", text: userResponse },
          { type: "ai", text: "Thanks! What’s your contact number?" }
        ];
        setStep(2);
        break;

      case 2:
        setFormData({ ...formData, phone: userResponse });
        newMessages = [
          { type: "user", text: userResponse },
          { type: "ai", text: "Please let me know the tech stack in which you require the project" }
        ];
        setStep(3);
        break;

      case 3:
        setFormData({ ...formData, techStack: userResponse });
        newMessages = [
          { type: "user", text: userResponse },
          { type: "ai", text: "Perfect! Could you briefly describe your project requirements?" }
        ];
        setStep(4);
        break;

      case 4:
        const updatedForm = { ...formData, requirements: userResponse };
        setFormData(updatedForm);
        newMessages = [
          { type: "user", text: userResponse },
          { type: "ai", text: "Thank you for the details! Our team will review your project and contact you shortly." },
          { type: "ai", text: "Have a great day, CodingBoss! 😊" }
        ];
        setStep(5);

        // API CALL
        try {
          const result = await apiClient("quiz/post-query/", "POST", {
            name: updatedForm.name,
            contact: updatedForm.phone,
            email: JSON.stringify({
              email: updatedForm.email,
              techStack: updatedForm.techStack,
              requirements: updatedForm.requirements,
            }),
          });
          console.log("API Response:", result);
        } catch (error) {
          console.error("Error sending data to API:", error);
        }

        setTimeout(() => closeChat(), 4000);
        break;

      default:
        break;
    }

    setChatMessages(prev => [...prev, ...newMessages]);
    setUserResponse("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleNextStep();
  };

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chatMessages]);

  return (
    <div className="chat-modal">
      <div className="chat-header">
        <div className="chat-logo">
          <img src="https://t4.ftcdn.net/jpg/05/88/95/25/240_F_588952520_7AzwyRgAF2EqyWxDbDbGmM0ssPwgrogb.jpg" alt="Chat Logo" />
          <span className="chat-title">Chat with CodingBoss Assistant</span>
        </div>
        <button className="close-button" onClick={closeChat}>&times;</button>
      </div>

      <div id="chat-box" className="chat-box" ref={chatBoxRef}>
        {chatMessages.map((message, index) => (
          <div key={index} className={`chat-message ${message.type}`}>
            <span>{message.text}</span>
          </div>
        ))}
      </div>

      {step < 5 && (
        <div className="input-container">
          <textarea
            className="form-control"
            placeholder="Type your message here..."
            value={userResponse}
            onChange={(e) => setUserResponse(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button className="btn btn-primary" onClick={handleNextStep}>Send</button>
        </div>
      )}
    </div>
  );
};

export default ProjectForm;

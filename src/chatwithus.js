import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Chat from "./chat"; // Assuming your Chat component is in the same folder

const Cwithus = () => {
  const [showChatModal, setShowChatModal] = useState(false);

  const toggleChatModal = () => {
    setShowChatModal(!showChatModal);
  };

  const closeChatModal = () => {
    setShowChatModal(false);
  };

  return (
    <div>
      {/* Floating Chat Button */}
      <button className="chat-button" onClick={toggleChatModal}>
        <span className="icon">🤖</span>
      </button>

      {/* Chat Modal */}
      {showChatModal && (
        <div className="chat-modal-overlay" onClick={closeChatModal}>
          <div
            className="chat-modal"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
          >
            <Chat closeChat={closeChatModal} />
          </div>
        </div>
      )}

      <style jsx>{`
        .chat-button {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background-color: #fff;
          color: #007bff;
          border: none;
          border-radius: 50%;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          cursor: pointer;
          transition: transform 0.2s ease-in-out;
          z-index: 100; /* Ensure the button is above the modal */
        }

        .chat-button:hover {
          transform: scale(1.1);
        }

        .icon {
          font-size: 24px;
          animation: bounce 1s infinite;
        }

        .chat-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5); /* Dark overlay with opacity */
          display: flex;
          justify-content: center;
          align-items: center; /* Center the modal vertically */
          z-index: 1000; /* Ensure the modal is above the button */
        }

        .chat-modal {
          width: 90%;
          max-width: 60%; /* Increased max width of the chat modal */
          height: 87%;
          max-height: 800px; /* Max height of the chat modal */
          background: rgba(255, 255, 255, 0.9); /* Semi-transparent background */
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        /* Responsive Styles */
        @media (max-width: 768px) {
          .chat-button {
            width: 50px;
            height: 50px;
            bottom: 10px;
            right: 10px;
          }

          .chat-button .icon {
            font-size: 20px;
          }

          .chat-modal {
            width: 95%;
            height: 80%;
            max-width: none;
            max-height: none;
          }
        }

        /* Additional Styles for Input Container */
        .input-container {
          height: auto; /* Ensure it doesn't stretch like a textarea */
          resize: none; /* Prevent resizing */
        }

      `}</style>
    </div>
  );
};

export default Cwithus;

import React, { useState } from 'react';
import { Button, Card } from 'react-bootstrap';
import  Navbar  from './NavbarComponent';
import CryptoJS from 'crypto-js';

const UploadQuestions = ({ isLoggedIn ,setIsLoggedIn,userRole, handleLogout, username }) => {
  const [selectedButton, setSelectedButton] = useState(null);


  useEffect(() => {
        if (!isLoggedIn) {
          if(localStorage.getItem("username") && localStorage.getItem("password")){
            const email = localStorage.getItem("username");
            const EncryptPassword = localStorage.getItem("password");
            const bytes = CryptoJS.AES.decrypt(EncryptPassword, 'thirancoding360mgai');
            const password = bytes.toString(CryptoJS.enc.Utf8);
            const Login = async () => {
              try {
                const response = await apiClient(
                  "quiz/users/login/",
                  "POST",
                  JSON.stringify({ email, password }),
                  { "Content-Type": "application/json" }
                );
                if (!response.status === "success") {
                  navigate('/LoginPage');
                }
                setIsLoggedIn(true);
              } catch (error) {
                navigate('/LoginPage');
              }
            }
            Login();
          }
          else {
            
            navigate('/LoginPage');
          }
        } 
      }, [isLoggedIn, navigate])


  const handleButtonClick = (button) => {
    setSelectedButton(button);
  };

  return (

    <>

    <Navbar 
            isLoggedIn={isLoggedIn} 
            setIsLoggedIn={setIsLoggedIn}
            username={username} 
            userRole={userRole} 
            handleLogout={handleLogout} 
          />
    <Card
      style={{
        width: '1150px', // Adjusted width
        padding: '20px',
        textAlign: 'center',
        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '30vh', // Center card vertically
        margin: '0 auto', // Center card horizontally
        overflow: 'hidden' // Prevent internal scroll if any
      }}
    >
      <Card.Body>
        <Card.Title>Upload Questions</Card.Title>
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          gap: '10px',
          marginTop: '20px'
        }}>
          <Button
            style={{
              backgroundColor: selectedButton === 'mcq' ? '#007bff' : '#f8f9fa',
              color: selectedButton === 'mcq' ? '#fff' : '#333',
              width: '190px', // Adjusted width
            }}
            variant="secondary"
            onClick={() => handleButtonClick('mcq')}
          >
            MCQ Upload
          </Button>

          <Button
            style={{
              backgroundColor: selectedButton === 'programming' ? '#28a745' : '#f8f9fa',
              color: selectedButton === 'programming' ? '#fff' : '#333',
              width: '190px', // Adjusted width
            }}
            variant="secondary"
            onClick={() => handleButtonClick('programming')}
          >
            Programming Upload
          </Button>

          <Button
            style={{
              backgroundColor: selectedButton === 'assessment' ? '#17a2b8' : '#f8f9fa',
              color: selectedButton === 'assessment' ? '#fff' : '#333',
              width: '190px', // Adjusted width
            }}
            variant="secondary"
            onClick={() => handleButtonClick('assessment')}
          >
            Assessment Upload
          </Button>
        </div>
        <div style={{ marginTop: '20px' }}> {/* Separate div for the next row */}
          <Button
            style={{
              backgroundColor: selectedButton === 'upload' ? '#17a2b8' : '#f8f9fa',
              color: selectedButton === 'upload' ? '#fff' : '#333',
              width: '190px', // Adjusted width
            }}
            variant="secondary"
            onClick={() => handleButtonClick('upload')}
          >
            Upload
          </Button>
        </div>
      </Card.Body>
    </Card>
    </>
  );
};

export default UploadQuestions;

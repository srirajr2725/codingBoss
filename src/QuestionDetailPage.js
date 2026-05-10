import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Container } from 'react-bootstrap';
import './QuestionPage.css';
import  Navbar  from './Navbar';
import apiClient from './utils/apiClient'

const QuestionPage = ({ isLoggedIn , setIsLoggedIn, userRole, handleLogout, username }) => {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);

 useEffect(() => {
   const fetchQuestion = async () => {
     try {
       const url = `api/get/program/${id}` // Correct template literal usage
       const data = await apiClient(url, 'GET')

       setQuestion(data) // Set the fetched question data
     } catch (error) {
      //  console.error('Error fetching question:', error)
     }
   }

   if (id) {
     fetchQuestion()
   }
 }, [id])

  return (

    <>

    <Navbar 
            isLoggedIn={isLoggedIn} 
            setIsLoggedIn={setIsLoggedIn}
            username={username} 
            userRole={userRole} 
            handleLogout={handleLogout} 
          />
    <Container>
      {question ? (
        <>
          <h2>{question.title}</h2>
          <p>{question.description}</p>
          {/* Add more details about the question as needed */}
        </>
      ) : (
        <p>Loading...</p>
      )}
    </Container>
    </>
  );
};

export default QuestionPage;

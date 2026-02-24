import React from 'react';
import './MCQQuiz.css';

function QuestionCard({ question, currentQuestionIndex, handleAnswerSelect, selectedAnswer }) {
  return (
    <div className="question-card">
      <h3>Question {currentQuestionIndex + 1} of {question.length}</h3>
      <p>{question.question}</p>
      <div className="options-container">
        {question.options.split(', ').map((option, i) => (
          <div
            key={i}
            className={`option-card ${selectedAnswer[currentQuestionIndex] === option ? 'selected' : ''}`}
            onClick={() => handleAnswerSelect(option)}
          >
            <div className="option-content">{option}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default QuestionCard;

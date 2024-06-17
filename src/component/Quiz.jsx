import React, { useState, useEffect } from 'react';
import questions from '../data/question.json';

const Quiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState(Array(20).fill(null)); // Updated to 20 questions
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [fullscreen, setFullscreen] = useState(false);
  const [score, setScore] = useState(null); // To store the score after quiz completion

  useEffect(() => {
    const savedState = JSON.parse(localStorage.getItem('quizState'));
    if (savedState) {
      setCurrentQuestion(savedState.currentQuestion);
      setAnswers(savedState.answers);
      setTimeLeft(savedState.timeLeft);
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('quizState', JSON.stringify({ currentQuestion, answers, timeLeft }));
  }, [currentQuestion, answers, timeLeft]);

  const handleFullscreenChange = () => {
    setFullscreen(!!document.fullscreenElement);
  };

  const enterFullscreen = () => {
    document.documentElement.requestFullscreen();
  };

  const handleAnswer = (index) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = index;
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleCompleteQuiz = () => {
    let correctAnswers = 0;
    for (let i = 0; i < questions.length; i++) {
      if (answers[i] !== null && questions[i].options[answers[i]] === questions[i].answer) {
        correctAnswers += 1;
      }
    }
    setScore(correctAnswers);
    alert(`Quiz Completed! Your score is: ${correctAnswers}/${questions.length}`);
    // Optionally, you can reset the quiz state here
    setCurrentQuestion(0);
    setAnswers(Array(20).fill(null));
    setTimeLeft(600);
    localStorage.removeItem('quizState');
  };

  if (!fullscreen) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <p className="mb-4">Please enter full screen to continue the quiz</p>
          <button
            onClick={enterFullscreen}
            className="bg-blue-500 text-white py-2 px-4 rounded"
          >
            Enter Full Screen
          </button>
        </div>
      </div>
    );
  }

  if (timeLeft <= 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <p>Time's up! Your score is: {score !== null ? `${score}/${questions.length}` : 'Calculating...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 md:w-1/2 lg:w-1/3">
        <div className="mb-4">
          <p>Time left: {Math.floor(timeLeft / 60)}:{timeLeft % 60 < 10 ? '0' : ''}{timeLeft % 60}</p>
        </div>
        <div className="mb-4">
          <p className="text-lg font-semibold">{questions[currentQuestion].question}</p>
        </div>
        <div className="mb-4">
          {questions[currentQuestion].options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              className="bg-blue-500 text-white py-2 px-4 rounded mb-2 w-full hover:bg-blue-600"
            >
              {option}
            </button>
          ))}
        </div>
        <button
          onClick={handleCompleteQuiz}
          className="bg-red-500 text-white py-2 px-4 rounded w-full hover:bg-red-600"
        >
          Complete Quiz
        </button>
      </div>
    </div>
  );
};

export default Quiz;

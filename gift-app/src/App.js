import "./App.css";
import axios from "axios";
import React, { useState } from "react";
import questionsData from "./questions";

function App() {
  const [userMessage, setUserMessage] = useState("");
  const [generalQuestions, setGeneralQuestions] = useState(
    questionsData.map((question) => ({ question, answer: "" }))
  );
  const [newQuestions, setNewQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [giftSuggestions, setGiftSuggestions] = useState([]);

  const handleSubmitGeneralQuestions = async (e) => {
    e.preventDefault();
    if (currentQuestionIndex !== generalQuestions.length - 1) {
      generalQuestions[currentQuestionIndex].answer = userMessage;

      if (
        (currentQuestionIndex === 4 || currentQuestionIndex === 6) &&
        generalQuestions[currentQuestionIndex].answer.includes("No")
      ) {
        // Dont show the next question
        generalQuestions[currentQuestionIndex + 1].answer = "No answer";
        setCurrentQuestionIndex(currentQuestionIndex + 2);
      } else {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }

      setUserMessage(""); // Clear the user's input field after submitting
    } else {
      generalQuestions[currentQuestionIndex].answer = userMessage;
      getMoreQuestions();
    }
  };

  const handleSubmitNewQuestions = async (e) => {
    e.preventDefault();
    if (currentQuestionIndex !== newQuestions.length - 1) {
      newQuestions[currentQuestionIndex].answer = userMessage;
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setUserMessage("");
    } else {
      newQuestions[currentQuestionIndex].answer = userMessage;
      getGiftSuggestion();
    }
  };

  const getMoreQuestions = async () => {
    const { data } = await axios.post("http://localhost:8080/more-questions", {
      message: generalQuestions,
    });

    setUserMessage("");
    const improvedQuestions = data.improvedQuestions.map((question) => ({
      question,
      answer: "",
    }));

    setCurrentQuestionIndex(0);
    setNewQuestions(improvedQuestions);
  };

  const getGiftSuggestion = async () => {
    const { data } = await axios.post("http://localhost:8080/suggest-gift", {
      generalQuestions: generalQuestions,
      additionalQuestions: newQuestions,
    });
    setGiftSuggestions(data.suggestions);
    setCurrentQuestionIndex(0);
  };

  return (
    <div className="App">
      <h1>Get Gift Ideas</h1>

      {giftSuggestions.length === 0 ? (
        <>
          <form
            onSubmit={
              newQuestions.length === 0
                ? handleSubmitGeneralQuestions
                : handleSubmitNewQuestions
            }
          >
            <input
              id="userMessage"
              type="text"
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
            />
            <button type="submit">Submit</button>
          </form>
          <p>
            {newQuestions.length === 0
              ? generalQuestions[currentQuestionIndex].question
              : newQuestions[currentQuestionIndex].question}
          </p>
        </>
      ) : (
        giftSuggestions.map((suggestion) => <p>{suggestion}</p>)
      )}
    </div>
  );
}

export default App;

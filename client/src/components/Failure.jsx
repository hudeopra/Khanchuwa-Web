import React from "react";
import { useNavigate } from "react-router-dom";

const Failure = () => {
  const navigate = useNavigate();
  return (
    <main>
      <h1>Payment Failed!</h1>
      <p>There was an issue with your payment. Please try again.</p>
      <button onClick={() => navigate("/")} className="go-home-button">
        Go to Homepage
      </button>
    </main>
  );
};

export default Failure;

import React, { useState } from "react";
import axios from "axios";
import { generateUniqueId } from "esewajs";

export const PaymentForm = () => {
  const [amount, setAmount] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // Add error state

  const handlePayment = async (e) => {
    e.preventDefault();

    // Basic client-side validation
    if (!amount || amount <= 0) {
      setErrorMessage("Please enter a valid amount");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:4500/initiate-payment",
        {
          amount: Number(amount), // Ensure amount is a number
          productId: generateUniqueId(),
        },
        {
          headers: {
            "Content-Type": "application/json", // Explicitly set content type
          },
        }
      );

      window.location.href = response.data.url;
    } catch (error) {
      // Enhanced error handling
      console.error("Error initiating payment:", error);
      if (error.response) {
        // Server responded with a status other than 2xx
        setErrorMessage(
          `Server error: ${error.response.data.message || error.message}`
        );
      } else if (error.request) {
        // Request was made but no response received
        setErrorMessage("Server not responding. Is it running on port 4500?");
      } else {
        // Error setting up the request
        setErrorMessage("Request setup error: " + error.message);
      }
    }
  };

  return (
    <main>
      <h1>eSewa Payment Integration</h1>

      <div className="form-container">
        <form className="styled-form" onSubmit={handlePayment}>
          <div className="form-group">
            <label htmlFor="Amount">Amount:</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              placeholder="Enter amount"
              min="1" // Add minimum value
            />
          </div>

          {errorMessage && <div className="error-message">{errorMessage}</div>}

          <button type="submit" className="submit-button">
            Pay with eSewa
          </button>
        </form>
      </div>
    </main>
  );
};

export default PaymentForm;

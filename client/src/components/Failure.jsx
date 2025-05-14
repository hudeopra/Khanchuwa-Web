import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const Failure = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const data = queryParams.get("data");

  let decodedData;
  try {
    decodedData = JSON.parse(atob(data));
  } catch (error) {
    decodedData = null;
  }

  useEffect(() => {
    if (decodedData) {
      const updateOrderStatus = async () => {
        try {
          await axios.put(
            "http://localhost:3000/orders/update-by-transaction",
            {
              transaction_uuid: decodedData.transaction_uuid,
              status: "FAILED",
            }
          );
        } catch (error) {
          console.error("Error updating order status to FAILED:", error);
        }
      };

      updateOrderStatus();
    }
  }, [decodedData]);

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

import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

function PaymentSuccess() {
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
      const handleEsewaResponse = async () => {
        try {
          // Create a new transaction
          await axios.post("http://localhost:3000/transactions/create", {
            product_id: decodedData.transaction_uuid,
            amount: decodedData.total_amount,
            status: decodedData.status,
          });

          // Update the order status
          await axios.put(
            "http://localhost:3000/orders/update-by-transaction",
            {
              transaction_uuid: decodedData.transaction_uuid,
              status: decodedData.status,
            }
          );
        } catch (error) {
          console.error("Error handling eSewa response:", error);
        }
      };

      handleEsewaResponse();
    }
  }, [decodedData]);

  if (!decodedData) {
    return <div>Error: Invalid or missing data</div>;
  }

  return (
    <main style={{ padding: "20px" }}>
      <h1>Payment Success</h1>
      <p>
        <strong>Transaction Code:</strong> {decodedData.transaction_code}
      </p>
      <p>
        <strong>Status:</strong> {decodedData.status}
      </p>
      <p>
        <strong>Total Amount:</strong> {decodedData.total_amount}
      </p>
      <p>
        <strong>Transaction UUID:</strong> {decodedData.transaction_uuid}
      </p>
      <p>
        <strong>Product Code:</strong> {decodedData.product_code}
      </p>
    </main>
  );
}

export default PaymentSuccess;

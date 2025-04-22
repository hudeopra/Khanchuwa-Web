import React from "react";
import { useLocation } from "react-router-dom";

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

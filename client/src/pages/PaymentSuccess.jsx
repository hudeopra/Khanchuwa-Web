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
      const updateOrderInDB = async () => {
        try {
          // Update the order status in the database
          const response = await axios.put(
            "http://localhost:3000/orders/update-by-transaction",
            {
              transaction_uuid: decodedData.transaction_uuid,
              status: decodedData.status,
              transaction_code: decodedData.transaction_code,
              product_code: decodedData.product_code,
              signature: decodedData.signature,
            }
          );

          // If payment was successful, update stock
          if (decodedData.status === "COMPLETE") {
            // Find the order by transaction ID to get cart details
            const orderResponse = await axios.get(
              `http://localhost:3000/orders/by-transaction/${decodedData.transaction_uuid}`
            );

            if (orderResponse.data && orderResponse.data.order) {
              // Update stock for successful payment
              await axios.patch("http://localhost:3000/api/tag/updateStock", {
                cart: orderResponse.data.order.cart,
                orderId: orderResponse.data.order._id,
              });
            }
          }
        } catch (error) {
          console.error("Error updating order in database:", error);
        }
      };

      updateOrderInDB();
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
      <p>
        <strong>Signature:</strong> {decodedData.signature}
      </p>
    </main>
  );
}

export default PaymentSuccess;

import { processPayment } from "./payment/payment.js";

// Example: Call the payment function with sample data
const paymentDetails = {
  amount: 100,
  currency: "USD",
  method: "Esewa",
};

processPayment(paymentDetails);

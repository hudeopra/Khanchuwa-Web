import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function OrderDetail() {
  const { id } = useParams(); // Get order ID from URL params
  const [order, setOrder] = useState(null);

  useEffect(() => {
    // Fetch order details by ID
    const fetchOrder = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/orders/${id}`);
        setOrder(response.data.order);
      } catch (error) {
        console.error("Error fetching order details:", error);
      }
    };

    fetchOrder();
  }, [id]);

  if (!order) {
    return <div>Loading...</div>;
  }

  return (
    <main className=" ">
      <h1>Order Details</h1>
      <p>
        <strong>Order ID:</strong> {order._id}
      </p>
      <p>
        <strong>User ID:</strong> {order.user}
      </p>
      <p>
        <strong>Transaction:</strong>
      </p>
      <ul>
        <li>
          <strong>Product ID:</strong> {order.transaction.product_id}
        </li>
        <li>
          <strong>Amount:</strong> {order.transaction.amount}
        </li>
        <li>
          <strong>Status:</strong> {order.transaction.status}
        </li>
      </ul>
      <p>
        <strong>Cart Items:</strong>
      </p>
      <ul>
        {order.cart.map((item, index) => (
          <li key={index}>
            <strong>Product ID:</strong> {item.id}, <strong>Quantity:</strong>{" "}
            {item.quantity}
          </li>
        ))}
      </ul>
      <p>
        <strong>Created At:</strong>{" "}
        {new Date(order.createdAt).toLocaleString()}
      </p>
      <p>
        <strong>Updated At:</strong>{" "}
        {new Date(order.updatedAt).toLocaleString()}
      </p>
    </main>
  );
}

export default OrderDetail;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAlert } from "../components/AlertContext";
import { Link } from "react-router-dom"; // Import Link for navigation

function Orderlist() {
  const [orders, setOrders] = useState([]);
  const { showAlert } = useAlert();

  useEffect(() => {
    // Fetch all orders on component mount
    const fetchOrders = async () => {
      try {
        const response = await axios.get("http://localhost:3000/orders/all");
        setOrders(response.data.orders);
      } catch (error) {
        showAlert("danger", "Failed to fetch orders");
      }
    };

    fetchOrders();
  }, [showAlert]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(`http://localhost:3000/orders/update/${orderId}`, {
        transaction: { status: newStatus },
      });
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId
            ? {
                ...order,
                transaction: { ...order.transaction, status: newStatus },
              }
            : order
        )
      );
      showAlert("success", "Order status updated successfully");
    } catch (error) {
      showAlert("danger", "Failed to update order status");
    }
  };

  return (
    <main className="">
      <h1>Order List</h1>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>User ID</th>
            <th>Product ID</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              <td>
                <Link to={`/orderdetail/${order._id}`}>{order._id}</Link>
              </td>
              <td>{order.user}</td>
              <td>{order.transaction.product_id}</td>
              <td>{order.transaction.amount}</td>
              <td>
                <select
                  className="form-select"
                  value={order.transaction.status}
                  onChange={(e) =>
                    handleStatusChange(order._id, e.target.value)
                  }
                >
                  <option value="PENDING">PENDING</option>
                  <option value="COMPLETE">COMPLETE</option>
                  <option value="FAILED">FAILED</option>
                  <option value="REFUNDED">REFUNDED</option>
                </select>
              </td>
              <td>
                <button
                  className="btn btn-danger"
                  onClick={() =>
                    showAlert("info", "Additional actions can be added here")
                  }
                >
                  Actions
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}

export default Orderlist;

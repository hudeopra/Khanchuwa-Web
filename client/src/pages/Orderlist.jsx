import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAlert } from "../components/AlertContext";
import { Link } from "react-router-dom"; // Import Link for navigation

function Orderlist() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
  const { showAlert } = useAlert();

  useEffect(() => {
    // Fetch all orders on component mount
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:3000/orders/all");
        setOrders(response.data.orders);
        if (response.data.orders && response.data.orders.length > 0) {
          setActiveOrder(response.data.orders[0]);
        }
      } catch (error) {
        setError("Failed to fetch orders");
        showAlert("danger", "Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [showAlert]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(`http://localhost:3000/orders/update/${orderId}`, {
        transaction: { status: newStatus },
      });

      // Update the orders list
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

      // Update the active order if it's the one being modified
      if (activeOrder && activeOrder._id === orderId) {
        setActiveOrder({
          ...activeOrder,
          transaction: { ...activeOrder.transaction, status: newStatus },
        });
      }

      showAlert("success", "Order status updated successfully");
    } catch (error) {
      showAlert("danger", "Failed to update order status");
    }
  };

  if (loading)
    return <div className="container mt-5 text-center">Loading orders...</div>;
  if (error)
    return <div className="container mt-5 text-center">Error: {error}</div>;
  if (!orders || orders.length === 0)
    return (
      <div className="container mt-5 text-center">No orders available.</div>
    );

  return (
    <main className="kh-cookshop-page kh-cookshop">
      <section className="container">
        <div className="row">
          <div className="col-12 mb-4">
            <h1 className="text-center">Order Management</h1>
          </div>
          <div className="col-12 col-md-6 col-lg-8">
            <div className="kh-cookshop__list">
              <ul className="kh-cookshop__list--items">
                {orders.map((order) => (
                  <li
                    key={order._id}
                    className={`kh-cookshop__list--item ${
                      activeOrder?._id === order._id ? "active" : ""
                    }`}
                    onClick={() => setActiveOrder(order)}
                  >
                    <div className="d-flex align-items-center">
                      <div
                        className={`status-indicator ${order.transaction?.status.toLowerCase()}`}
                        style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          backgroundColor:
                            order.transaction?.status === "COMPLETE"
                              ? "green"
                              : order.transaction?.status === "PENDING"
                              ? "orange"
                              : order.transaction?.status === "CASH"
                              ? "blue"
                              : order.transaction?.status === "FAILED"
                              ? "red"
                              : "gray",
                          marginRight: "10px",
                        }}
                      ></div>
                      <div className="ms-2">
                        <p className="mb-0 fw-bold">
                          Order #{order._id.substring(0, 8)}
                        </p>
                        <small>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </small>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="col-12 col-md-6 col-lg-4">
            {activeOrder && (
              <div className="kh-cookshop__details">
                <h3>Order Details</h3>
                <div className="card mb-3">
                  <div className="card-body">
                    <p className="mb-1">
                      <strong>Order ID:</strong> {activeOrder._id}
                    </p>
                    <p className="mb-1">
                      <strong>User ID:</strong> {activeOrder.user}
                    </p>
                    <p className="mb-1">
                      <strong>Date:</strong>{" "}
                      {new Date(activeOrder.createdAt).toLocaleString()}
                    </p>
                    <p className="mb-1">
                      <strong>Product ID:</strong>{" "}
                      {activeOrder.transaction?.product_id}
                    </p>
                    <p className="mb-1">
                      <strong>Amount:</strong> $
                      {activeOrder.transaction?.amount}
                    </p>

                    <div className="mt-3">
                      <label className="form-label">
                        <strong>Status:</strong>
                      </label>
                      <select
                        className="form-select mb-3"
                        value={activeOrder.transaction?.status || "PENDING"}
                        onChange={(e) =>
                          handleStatusChange(activeOrder._id, e.target.value)
                        }
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="CASH">CASH</option>
                        <option value="COMPLETE">COMPLETE</option>
                        <option value="FAILED">FAILED</option>
                        <option value="REFUNDED">REFUNDED</option>
                      </select>
                    </div>
                  </div>
                </div>

                {activeOrder.items && activeOrder.items.length > 0 && (
                  <div className="card mb-3">
                    <div className="card-header">
                      <h5 className="mb-0">Order Items</h5>
                    </div>
                    <ul className="list-group list-group-flush">
                      {activeOrder.items.map((item, index) => (
                        <li key={index} className="list-group-item">
                          <div className="d-flex justify-content-between">
                            <div>
                              <p className="mb-0">
                                <strong>{item.productName}</strong>
                              </p>
                              <small>Quantity: {item.quantity}</small>
                            </div>
                            <div className="text-end">
                              <p className="mb-0">${item.price}</p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="d-flex gap-2">
                  <Link
                    to={`/orderdetail/${activeOrder._id}`}
                    className="btn btn-primary w-100"
                  >
                    View Full Details
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default Orderlist;

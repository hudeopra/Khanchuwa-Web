import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAlert } from "../components/AlertContext";

function OrderDetail() {
  const { id } = useParams(); // Get order ID from URL params
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  useEffect(() => {
    // Fetch order details by ID
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3000/orders/${id}`);
        setOrder(response.data.order);
      } catch (error) {
        console.error("Error fetching order details:", error);
        setError("Failed to fetch order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      await axios.put(`http://localhost:3000/orders/update/${id}`, {
        transaction: { status: newStatus },
      });

      setOrder((prev) => ({
        ...prev,
        transaction: { ...prev.transaction, status: newStatus },
      }));

      showAlert("success", "Order status updated successfully");
    } catch (error) {
      showAlert("danger", "Failed to update order status");
    }
  };

  const handleRefund = async () => {
    if (
      window.confirm(
        "Are you sure you want to refund this order? This will restore the stock."
      )
    ) {
      try {
        await handleStatusChange("REFUNDED");
        showAlert(
          "success",
          "Order refunded successfully. Stock has been restored."
        );
      } catch (error) {
        showAlert("danger", "Failed to refund order");
      }
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "COMPLETE":
        return "bg-success";
      case "PENDING":
        return "bg-warning text-dark";
      case "CASH":
        return "bg-info";
      case "REFUNDED":
        return "bg-secondary";
      case "FAILED":
        return "bg-danger";
      default:
        return "bg-light text-dark";
    }
  };

  const getShippingMethodDisplay = (method) => {
    switch (method) {
      case "standard":
        return "Standard Shipping";
      case "business":
        return "Business Shipping";
      case "premium":
        return "Premium Shipping";
      default:
        return method;
    }
  };

  const calculateSubtotal = () => {
    if (!order.cart) return 0;
    return order.cart.reduce((sum, item) => sum + item.price, 0);
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mt-5 text-center">
        <div className="alert alert-danger" role="alert">
          {error || "Order not found"}
        </div>
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/orderlist")}
        >
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        .timeline {
          position: relative;
          padding-left: 30px;
        }

        .timeline::before {
          content: "";
          position: absolute;
          left: 10px;
          top: 0;
          bottom: 0;
          width: 2px;
          background: #e9ecef;
        }

        .timeline-item {
          position: relative;
          margin-bottom: 20px;
        }

        .timeline-marker {
          position: absolute;
          left: -25px;
          top: 5px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 0 0 3px #e9ecef;
        }

        .timeline-content {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          border-left: 3px solid #007bff;
        }

        .timeline-title {
          margin-bottom: 5px;
          color: #495057;
          font-size: 0.95rem;
          font-weight: 600;
        }

        .timeline-text {
          margin: 0;
          color: #6c757d;
          font-size: 0.875rem;
        }

        .order-summary-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .info-card {
          transition: transform 0.2s ease;
        }

        .info-card:hover {
          transform: translateY(-2px);
        }

        .badge-custom {
          font-size: 0.75rem;
          padding: 0.5em 0.75em;
        }

        @media print {
          .no-print {
            display: none !important;
          }
          .card {
            border: 1px solid #dee2e6 !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      <main className="container mt-4">
        {/* Header Section */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              <h1 className="h2 mb-0">Order Details</h1>
              <button
                className="btn btn-outline-secondary no-print"
                onClick={() => navigate("/orderlist")}
              >
                ← Back to Orders
              </button>
            </div>
          </div>
        </div>

        {/* Order Overview Card */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card info-card order-summary-card">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-8">
                    <h4 className="mb-3">
                      Order #{order._id.substring(0, 8).toUpperCase()}
                      <span
                        className={`badge badge-custom ms-3 ${getStatusBadgeClass(
                          order.transaction?.status
                        )}`}
                      >
                        {order.transaction?.status}
                      </span>
                    </h4>
                    <div className="row">
                      <div className="col-sm-6">
                        <p className="mb-2">
                          <strong>Order ID:</strong> <code>{order._id}</code>
                        </p>
                        <p className="mb-2">
                          <strong>Customer:</strong>{" "}
                          {order.userInfo?.fullname || "N/A"}
                        </p>
                        <p className="mb-2">
                          <strong>Payment Method:</strong>{" "}
                          {order.paymentMethod?.toUpperCase() || "N/A"}
                        </p>
                      </div>
                      <div className="col-sm-6">
                        <p className="mb-2">
                          <strong>Transaction ID:</strong>{" "}
                          <code>{order.transaction?.product_id}</code>
                        </p>
                        <p className="mb-2">
                          <strong>Created:</strong>{" "}
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                        <p className="mb-2">
                          <strong>Stock Status:</strong>
                          <span
                            className={`badge badge-custom ms-2 ${
                              order.stockUpdated
                                ? "bg-light text-dark"
                                : "bg-warning text-dark"
                            }`}
                          >
                            {order.stockUpdated ? "Updated" : "Not Updated"}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 text-end">
                    <h2 className="mb-0">
                      <span className="badge bg-light text-dark fs-4">
                        NPR {order.transaction?.amount || 0}
                      </span>
                    </h2>
                    <p className="mb-0 mt-2 opacity-75">Total Amount</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer and Shipping Info Row */}
        <div className="row mb-4">
          {/* Customer Information */}
          {order.userInfo && (
            <div className="col-lg-6 mb-3">
              <div className="card info-card h-100">
                <div className="card-header bg-light">
                  <h5 className="mb-0">
                    <i className="fas fa-user me-2"></i>Customer Information
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-12">
                      <p className="mb-2">
                        <strong>Full Name:</strong> {order.userInfo.fullname}
                      </p>
                      <p className="mb-2">
                        <strong>Email:</strong>{" "}
                        <a href={`mailto:${order.userInfo.email}`}>
                          {order.userInfo.email}
                        </a>
                      </p>
                      <p className="mb-2">
                        <strong>Phone:</strong>{" "}
                        <a href={`tel:${order.userInfo.phoneNumber}`}>
                          {order.userInfo.phoneNumber}
                        </a>
                      </p>
                      <p className="mb-0">
                        <strong>Address:</strong> {order.userInfo.address}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Shipping Information */}
          {order.shipping && (
            <div className="col-lg-6 mb-3">
              <div className="card info-card h-100">
                <div className="card-header bg-light">
                  <h5 className="mb-0">
                    <i className="fas fa-shipping-fast me-2"></i>Shipping
                    Information
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-12">
                      <p className="mb-2">
                        <strong>Shipping Method:</strong>
                        <span className="text-primary ms-2">
                          {getShippingMethodDisplay(order.shipping.method)}
                        </span>
                      </p>
                      <p className="mb-2">
                        <strong>Shipping Cost:</strong>
                        <span className="text-success ms-2 fw-bold">
                          NPR {order.shipping.cost}
                        </span>
                      </p>
                      <p className="mb-0">
                        <strong>Delivery Address:</strong>{" "}
                        {order.userInfo?.address || "Same as billing"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Order Items */}
        {(order.cart || order.items) && (
          <div className="row mb-4">
            <div className="col-12">
              <div className="card info-card">
                <div className="card-header bg-light">
                  <h5 className="mb-0">
                    <i className="fas fa-shopping-cart me-2"></i>Order Items
                  </h5>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-striped mb-0">
                      <thead className="table-dark">
                        <tr>
                          <th>Product Name</th>
                          <th>Product ID</th>
                          <th className="text-center">Quantity</th>
                          <th className="text-end">Unit Price</th>
                          <th className="text-end">Total Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(order.cart || order.items)?.map((item, index) => (
                          <tr key={index}>
                            <td>
                              <strong>{item.productName || "N/A"}</strong>
                            </td>
                            <td>
                              <code className="text-muted">{item.id}</code>
                            </td>
                            <td className="text-center">
                              <span className="badge bg-primary">
                                {item.quantity}
                              </span>
                            </td>
                            <td className="text-end">
                              NPR {(item.price / item.quantity).toFixed(2)}
                            </td>
                            <td className="text-end text-success fw-bold">
                              NPR {item.price}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="table-light">
                        <tr>
                          <th colSpan="4" className="text-end border-top-2">
                            Subtotal:
                          </th>
                          <th className="text-end text-success border-top-2">
                            NPR {calculateSubtotal()}
                          </th>
                        </tr>
                        {order.shipping && (
                          <tr>
                            <th colSpan="4" className="text-end">
                              Shipping:
                            </th>
                            <th className="text-end text-info">
                              NPR {order.shipping.cost}
                            </th>
                          </tr>
                        )}
                        <tr className="table-warning">
                          <th colSpan="4" className="text-end fs-5">
                            Total Order Amount:
                          </th>
                          <th className="text-end text-success fs-5">
                            NPR {order.transaction?.amount}
                          </th>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Order Management Actions */}
        <div className="row mb-4 no-print">
          <div className="col-12">
            <div className="card info-card">
              <div className="card-header bg-light">
                <h5 className="mb-0">
                  <i className="fas fa-cogs me-2"></i>Order Management
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <label className="form-label">
                      <strong>Update Order Status:</strong>
                    </label>
                    <select
                      className="form-select mb-3"
                      value={order.transaction?.status || "PENDING"}
                      onChange={(e) => handleStatusChange(e.target.value)}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="CASH">CASH</option>
                      <option value="COMPLETE">COMPLETE</option>
                      <option value="FAILED">FAILED</option>
                      <option value="REFUNDED">REFUNDED</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">
                      <strong>Quick Actions:</strong>
                    </label>
                    <div className="d-flex gap-2 flex-wrap">
                      {(order.transaction?.status === "COMPLETE" ||
                        order.transaction?.status === "CASH") && (
                        <button
                          className="btn btn-danger"
                          onClick={handleRefund}
                        >
                          <i className="fas fa-undo me-2"></i>Process Refund
                        </button>
                      )}
                      <button
                        className="btn btn-secondary"
                        onClick={() => window.print()}
                      >
                        <i className="fas fa-print me-2"></i>Print Order
                      </button>
                      <button
                        className="btn btn-info"
                        onClick={() => navigate(`/orderlist`)}
                      >
                        <i className="fas fa-list me-2"></i>All Orders
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card info-card">
              <div className="card-header bg-light">
                <h5 className="mb-0">
                  <i className="fas fa-history me-2"></i>Transaction History
                </h5>
              </div>
              <div className="card-body">
                <div className="timeline">
                  <div className="timeline-item">
                    <div className="timeline-marker bg-primary"></div>
                    <div className="timeline-content">
                      <h6 className="timeline-title">Order Created</h6>
                      <p className="timeline-text">
                        Order was created with{" "}
                        {order.paymentMethod?.toUpperCase()} payment method
                        <br />
                        <small className="text-muted">
                          {new Date(order.createdAt).toLocaleString()}
                        </small>
                      </p>
                    </div>
                  </div>
                  {order.stockUpdated && (
                    <div className="timeline-item">
                      <div className="timeline-marker bg-success"></div>
                      <div className="timeline-content">
                        <h6 className="timeline-title">Stock Updated</h6>
                        <p className="timeline-text">
                          Inventory has been deducted for this order
                          <br />
                          <small className="text-muted">
                            {new Date(order.updatedAt).toLocaleString()}
                          </small>
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="timeline-item">
                    <div
                      className={`timeline-marker ${
                        order.transaction?.status === "COMPLETE"
                          ? "bg-success"
                          : order.transaction?.status === "FAILED"
                          ? "bg-danger"
                          : order.transaction?.status === "REFUNDED"
                          ? "bg-secondary"
                          : "bg-warning"
                      }`}
                    ></div>
                    <div className="timeline-content">
                      <h6 className="timeline-title">
                        Current Status: {order.transaction?.status}
                      </h6>
                      <p className="timeline-text">
                        {order.transaction?.status === "COMPLETE" &&
                          "Payment completed successfully"}
                        {order.transaction?.status === "PENDING" &&
                          "Payment is pending confirmation"}
                        {order.transaction?.status === "CASH" &&
                          "Cash payment received"}
                        {order.transaction?.status === "FAILED" &&
                          "Payment failed"}
                        {order.transaction?.status === "REFUNDED" &&
                          "Order has been refunded and stock restored"}
                        <br />
                        <small className="text-muted">
                          {new Date(order.updatedAt).toLocaleString()}
                        </small>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default OrderDetail;

import React, { useState } from "react";
import axios from "axios";
import { generateUniqueId } from "esewajs";
import { useSelector, useDispatch } from "react-redux";
import {
  clearCart,
  removeFromCart,
  updateCartItem,
} from "../redux/user/userCart"; // Ensure consistent imports

const Checkout = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [shippingCost, setShippingCost] = useState(0); // State to track selected shipping cost
  const [editingField, setEditingField] = useState(null); // Track which field is being edited
  const [updatedValue, setUpdatedValue] = useState(""); // Track the updated value
  const cartItems = useSelector((state) => state.userCart?.items || []); // Dynamically fetch cart items
  const currentUser = useSelector((state) => state.user?.currentUser); // Updated to match the structure in Header.jsx

  const dispatch = useDispatch();

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!totalAmount || totalAmount <= 0) {
      setErrorMessage("Please enter a valid amount");
      return;
    }

    try {
      // Create order in the database
      const orderResponse = await axios.post(
        "http://localhost:3000/orders/create",
        {
          transaction: {
            product_id: generateUniqueId(),
            amount: Number(totalAmount),
            status: "PENDING",
          },
          user: currentUser._id, // Pass user ID
          cart: cartItems.map((item) => ({
            id: item.id,
            quantity: item.quantity,
          })),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Initiate payment with eSewa
      const paymentResponse = await axios.post(
        "http://localhost:3000/initiate-payment",
        {
          amount: Number(totalAmount),
          productId: orderResponse.data.order.transaction.product_id,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      window.location.href = paymentResponse.data.url;
    } catch (error) {
      console.error("Error initiating payment:", error);
      if (error.response) {
        setErrorMessage(
          `Server error: ${error.response.data.message || error.message}`
        );
      } else if (error.request) {
        setErrorMessage("Esewa Server down");
      } else {
        setErrorMessage("Request setup error: " + error.message);
      }
    }
  };

  const handleRemoveFromCart = (itemId) => {
    dispatch(removeFromCart(itemId));
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) return; // Prevent quantity from being less than 1
    dispatch(updateCartItem({ id: itemId, quantity: newQuantity }));
  };

  const handleShippingChange = (cost) => {
    setShippingCost(cost); // Update shipping cost based on selection
  };

  const totalAmount =
    cartItems.reduce((total, item) => total + item.price, 0) + shippingCost; // Calculate total amount

  const handleEditClick = (field) => {
    setEditingField(field);
    setUpdatedValue(currentUser?.[field] || "");
  };

  const handleUpdate = () => {
    // Dispatch an action to update the user data in Redux (not implemented here)
    console.log(`Updated ${editingField}:`, updatedValue);
    setEditingField(null);
  };

  return (
    <main className="mt-innerpage mt-checkout-page">
      <div className="mt-check-out">
        <div className="container-fluid">
          <div className="row no-gutters">
            <div
              className="col-12 col-lg-5 wow slideInLeft"
              style={{ visibility: "visible", animationName: "slideInLeft" }}
            >
              <aside className="mt-checkout-aside mt-section__padding-sm--tb mt-aside-wrapper">
                <div className="mt-aside__head">
                  <div className="mt-order-summary-toggle d-flex justify-content-between align-items-center d-lg-none">
                    <a href="#" onClick={(e) => e.preventDefault()}>
                      <i className="fa fa-shopping-cart" aria-hidden="true"></i>
                      Order Summary
                      <i className="fa fa-chevron-down" aria-hidden="true"></i>
                    </a>
                    <p>SAR. 499.5</p>
                  </div>
                </div>
                <div className="mt-aside__body">
                  <div className="mt-aside__body--item-list">
                    {cartItems.map((item) => (
                      <div className="mt-aside__body--item" key={item.id}>
                        <div className="mt-item-img">
                          <img
                            src={item.favImg || "default-image.jpg"}
                            alt={item.productName}
                          />
                          <span>{item.quantity}</span>
                        </div>
                        <div className="mt-item-content">
                          <h3>{item.productName}</h3>
                          <small className="mt-item-color">
                            Unit Price: {item.mrkPrice}
                          </small>
                        </div>
                        <div className="mt-item-price">
                          <p>Total: {item.price}</p>
                        </div>
                        <div className="mt-item-actions">
                          <button
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity - 1)
                            }
                          >
                            -
                          </button>
                          <button
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity + 1)
                            }
                          >
                            +
                          </button>
                          <button onClick={() => handleRemoveFromCart(item.id)}>
                            x
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-aside__total">
                    <div className="mt-aside__total--charges">
                      <div className="mt-add-charge">
                        <h4>Sub-Total</h4>
                        <p>
                          {cartItems.reduce(
                            (total, item) => total + item.price,
                            0
                          )}
                        </p>
                      </div>
                      <div className="mt-add-charge mt-add-charge__shipping">
                        <h4>Shipping</h4>
                        <p>
                          {shippingCost > 0
                            ? `$${shippingCost}.00`
                            : "Calculated at next step"}
                        </p>
                      </div>
                    </div>
                    <div className="mt-aside__total--final">
                      <h4>Total</h4>
                      <p>{totalAmount}</p>
                    </div>
                  </div>
                </div>
                <a
                  className="mt-btn mt-btn__line"
                  href="https://binzagrprof.961digital.com/static/checkout-1.html"
                >
                  Return to Information
                </a>
              </aside>
            </div>
            <div
              className="col-12 col-lg-7 wow slideInRight"
              style={{ visibility: "visible", animationName: "slideInRight" }}
            >
              <section className="mt-checkout-form mt-section__padding-sm--tb">
                <div className="mt-checkout__header"></div>
                <div className="mt-checkout__form">
                  <form action="">
                    <div className="mt-checkout__form--section">
                      <div className="mt-checkout__form--head">
                        <h2>Contact Information</h2>
                      </div>
                      <div className="mt-checkout__overview">
                        <div className="mt-checkout__overview--item">
                          <h3>Full Name</h3>
                          {editingField === "fullname" ? (
                            <>
                              <input
                                type="text"
                                value={updatedValue}
                                onChange={(e) =>
                                  setUpdatedValue(e.target.value)
                                }
                              />
                              <button type="button" onClick={handleUpdate}>
                                OK
                              </button>
                            </>
                          ) : (
                            <>
                              <p>{currentUser?.fullname || "N/A"}</p>
                              <button
                                type="button"
                                onClick={() => handleEditClick("fullname")}
                              >
                                Change
                              </button>
                            </>
                          )}
                        </div>
                        <div className="mt-checkout__overview--item">
                          <h3>Email</h3>
                          {editingField === "username" ? (
                            <>
                              <input
                                type="text"
                                value={updatedValue}
                                onChange={(e) =>
                                  setUpdatedValue(e.target.value)
                                }
                              />
                              <button type="button" onClick={handleUpdate}>
                                OK
                              </button>
                            </>
                          ) : (
                            <>
                              <p>{currentUser?.username || "N/A"}</p>
                              <button
                                type="button"
                                onClick={() => handleEditClick("username")}
                              >
                                Change
                              </button>
                            </>
                          )}
                        </div>
                        <div className="mt-checkout__overview--item">
                          <h3>Phone Number</h3>
                          {editingField === "phoneNumber" ? (
                            <>
                              <input
                                type="text"
                                value={updatedValue}
                                onChange={(e) =>
                                  setUpdatedValue(e.target.value)
                                }
                              />
                              <button type="button" onClick={handleUpdate}>
                                OK
                              </button>
                            </>
                          ) : (
                            <>
                              <p>{currentUser?.phoneNumber || "N/A"}</p>
                              <button
                                type="button"
                                onClick={() => handleEditClick("phoneNumber")}
                              >
                                Change
                              </button>
                            </>
                          )}
                        </div>
                        <div className="mt-checkout__overview--item">
                          <h3>Shipping Address</h3>
                          {editingField === "address" ? (
                            <>
                              <input
                                type="text"
                                value={updatedValue}
                                onChange={(e) =>
                                  setUpdatedValue(e.target.value)
                                }
                              />
                              <button type="button" onClick={handleUpdate}>
                                OK
                              </button>
                            </>
                          ) : (
                            <>
                              <p>{currentUser?.address || "N/A"}</p>
                              <button
                                type="button"
                                onClick={() => handleEditClick("address")}
                              >
                                Change
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-checkout__form--section">
                      <div className="mt-checkout__form--head">
                        <h2>Shipping Information</h2>
                      </div>
                      <div className="mt-checkout__shipping-option">
                        <div className="mt-input-wrapper">
                          <input
                            type="radio"
                            name="shipping-option"
                            onChange={() => handleShippingChange(30)}
                          />
                          <span>
                            Standered Shipping <small>(2 - 4 days)</small>
                          </span>
                          <p>$30.00</p>
                        </div>
                        <div className="mt-input-wrapper">
                          <input
                            type="radio"
                            name="shipping-option"
                            onChange={() => handleShippingChange(40)}
                          />
                          <span>
                            Business Shipping <small>(1 - 3 days)</small>
                          </span>
                          <p>$40.00</p>
                        </div>
                        <div className="mt-input-wrapper">
                          <input
                            type="radio"
                            name="shipping-option"
                            onChange={() => handleShippingChange(50)}
                          />
                          <span>
                            Premium Shipping <small>(1 - 2 days)</small>
                          </span>
                          <p>$50.00</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-checkout__form--section">
                      <div className="mt-checkout__form--head">
                        <h2>Payment Methode</h2>
                      </div>
                      <div className="mt-checkout__payment-option">
                        <div className="mt-input-wrapper">
                          <input type="radio" name="payment-option" />
                          <span>Cash on Delivery</span>
                          <div className="mt-checkout__payment-info">
                            <p>
                              We look forward meeting to complete your
                              transaction.
                            </p>
                          </div>
                        </div>
                        <div className="mt-input-wrapper">
                          <input type="radio" name="payment-option" />
                          <span>Esewa</span>
                          <div className="mt-checkout__payment-info">
                            <div className="form-group">
                              <label htmlFor="Amount">Amount:</label>
                              <input
                                type="number"
                                value={totalAmount} // Set value to total amount
                                readOnly // Make input read-only
                              />
                            </div>

                            {errorMessage && (
                              <div className="error-message">
                                {errorMessage}
                              </div>
                            )}

                            <button
                              type="button"
                              className="submit-button"
                              onClick={handlePayment}
                            >
                              Pay with eSewa
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-checkout-buttons">
                      <input
                        className="mt-btn mt-btn__invert"
                        type="submit"
                        value="Continue with Payment"
                      />
                    </div>
                  </form>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Checkout;

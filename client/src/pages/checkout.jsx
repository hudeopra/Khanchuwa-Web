import React, { useState, useEffect } from "react";
import axios from "axios";
import { generateUniqueId } from "esewajs";
import { useSelector, useDispatch } from "react-redux";
import {
  clearCart,
  removeFromCart,
  updateCartItem,
} from "../redux/user/userCart"; // Ensure consistent imports
import { useAlert } from "../components/AlertContext"; // Import useAlert hook

const Checkout = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [shippingCost, setShippingCost] = useState(0); // State to track selected shipping cost
  const [editingField, setEditingField] = useState(null); // Track which field is being edited
  const [updatedPhoneNumber, setUpdatedPhoneNumber] = useState(""); // Track the updated phone number
  const [updatedEmail, setUpdatedEmail] = useState(""); // Track the updated email
  const [updatedFullname, setUpdatedFullname] = useState(""); // Track the updated fullname
  const [updatedAddress, setUpdatedAddress] = useState(""); // Track the updated address
  const [userData, setUserData] = useState({}); // State to store user data
  const [paymentMethod, setPaymentMethod] = useState(""); // Track selected payment method
  const [formErrors, setFormErrors] = useState({}); // State to track individual field errors
  const [showAlert, setShowAlert] = useState(false); // State to show success alert
  const [initialPhoneNumberEntered, setInitialPhoneNumberEntered] =
    useState(false); // Track if phone number was initially empty and then filled
  const [initialAddressEntered, setInitialAddressEntered] = useState(false); // Track if address was initially empty and then filled
  const cartItems = useSelector((state) => state.userCart?.items || []); // Dynamically fetch cart items
  const currentUser = useSelector((state) => state.user?.currentUser); // Updated to match the structure in Header.jsx
  const isCartEmpty = cartItems.length === 0; // Check if cart is empty

  const dispatch = useDispatch();
  const { showAlert: showSuccessAlert } = useAlert(); // Get showAlert function from AlertContext

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/user/current", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch user data");
        const data = await res.json();

        // If fullname is not available, use username instead
        const displayName = data.fullname || data.username || "";

        setUserData({
          fullname: displayName,
          email: data.email || "",
          phoneNumber: data.phoneNumber || "",
          address: data.address || "",
        });

        // Initialize updated fields with current values
        setUpdatedFullname(displayName);
        setUpdatedEmail(data.email || "");
        setUpdatedPhoneNumber(data.phoneNumber || "");
        setUpdatedAddress(data.address || "");

        // Set initial state flags based on whether fields were empty
        setInitialPhoneNumberEntered(!!data.phoneNumber);
        setInitialAddressEntered(!!data.address);
      } catch (error) {
        console.error(error.message);
      }
    };

    fetchUser();
  }, []);

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!totalAmount || totalAmount <= 0) {
      setErrorMessage("Please enter a valid amount");
      return;
    }
    try {
      // Create order in the database as PENDING (no stock update)
      const orderResponse = await axios.post(
        "http://localhost:3000/orders/create",
        {
          transaction: {
            product_id: generateUniqueId(),
            amount: Number(totalAmount),
            status: "PENDING",
          },
          user: currentUser._id,
          userInfo: {
            fullname: userData.fullname,
            email: userData.email,
            phoneNumber: userData.phoneNumber,
            address: userData.address,
          },
          shipping: {
            method:
              shippingCost === 30
                ? "standard"
                : shippingCost === 40
                ? "business"
                : "premium",
            cost: shippingCost,
          },
          paymentMethod: "esewa",
          cart: cartItems.map((item) => ({
            id: item.id,
            quantity: item.quantity,
            productName: item.productName,
            price: item.price,
          })),
          stockUpdated: false, // Explicitly set to false for eSewa orders
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // DO NOT update stock here for eSewa orders - stock will be updated only on successful payment in PaymentSuccess

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

    // Find the item to check if it has a maxQuantity constraint
    const item = cartItems.find((item) => item.id === itemId);
    if (
      item &&
      item.maxQuantity !== undefined &&
      newQuantity > item.maxQuantity
    ) {
      showSuccessAlert(
        "warning",
        `Only ${item.maxQuantity} units available in stock.`
      );
      newQuantity = item.maxQuantity; // Limit to max available quantity
    }

    dispatch(updateCartItem({ id: itemId, quantity: newQuantity }));
  };

  const handleShippingChange = (cost) => {
    setShippingCost(cost); // Update shipping cost based on selection
  };
  const totalAmount =
    cartItems.reduce(
      (total, item) =>
        total + (item.disPrice || item.mrkPrice || 0) * item.quantity,
      0
    ) + shippingCost; // Calculate total amount

  const handleEditClick = (field) => {
    setEditingField(field);
    if (field === "phoneNumber") {
      setUpdatedPhoneNumber(userData?.phoneNumber || "");
    } else if (field === "address") {
      setUpdatedAddress(userData?.address || "");
    }
  };

  const handleFieldUpdate = (field) => {
    if (field === "phoneNumber") {
      if (updatedPhoneNumber.trim()) {
        setUserData((prev) => ({ ...prev, phoneNumber: updatedPhoneNumber }));
        setEditingField(null);
        // Set flag to show that the phone number was initially entered
        if (!initialPhoneNumberEntered) {
          setInitialPhoneNumberEntered(true);
        }
      }
    } else if (field === "address") {
      if (updatedAddress.trim()) {
        setUserData((prev) => ({ ...prev, address: updatedAddress }));
        setEditingField(null);
        // Set flag to show that the address was initially entered
        if (!initialAddressEntered) {
          setInitialAddressEntered(true);
        }
      }
    } else if (field === "email") {
      if (updatedEmail.trim()) {
        setUserData((prev) => ({ ...prev, email: updatedEmail }));
        setEditingField(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!userData.fullname) errors.fullname = "Full Name is required.";
    if (!userData.email) errors.email = "Email is required.";
    if (!userData.phoneNumber) errors.phoneNumber = "Phone Number is required.";
    if (!updatedAddress) errors.address = "Shipping Address is required.";
    if (!shippingCost) errors.shipping = "Shipping Information is required.";
    if (!paymentMethod) errors.payment = "Payment Method is required.";

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) return;

    if (paymentMethod === "cash") {
      // Process cash payment - the actual processing happens in the onClick handler
      // No alert here to avoid interrupting the flow
    } else if (paymentMethod === "esewa") {
      handlePayment(e); // Call the existing eSewa payment logic
    }
  };

  return (
    <main className=" mt-checkout-page">
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
                  </div>{" "}
                  <div className="mt-aside__total">
                    <div className="mt-aside__total--charges">
                      <div className="mt-add-charge">
                        <h4>Sub-Total</h4>
                        <p>
                          {cartItems.reduce(
                            (total, item) =>
                              total +
                              (item.disPrice || item.mrkPrice || 0) *
                                item.quantity,
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
                  <form onSubmit={handleSubmit}>
                    <div className="mt-checkout__form--section">
                      <div className="mt-checkout__form--head">
                        <h2>Contact Information</h2>
                      </div>
                      <div className="mt-checkout__overview">
                        <div className="mt-checkout__overview--item">
                          <h3>Full Name</h3>
                          <p>{userData.fullname}</p>
                          {formErrors.fullname && (
                            <p className="error-text">{formErrors.fullname}</p>
                          )}
                        </div>
                        <div className="mt-checkout__overview--item">
                          <h3>Email</h3>
                          {!userData.email ? (
                            <>
                              <input
                                type="email"
                                value={updatedEmail}
                                onChange={(e) =>
                                  setUpdatedEmail(e.target.value)
                                }
                                placeholder="Enter your email"
                              />
                              <button
                                type="button"
                                className="ok-button"
                                onClick={() => handleFieldUpdate("email")}
                              >
                                OK
                              </button>
                            </>
                          ) : (
                            <p>{userData.email}</p>
                          )}
                          {formErrors.email && (
                            <p className="error-text">{formErrors.email}</p>
                          )}
                        </div>
                        <div className="mt-checkout__overview--item">
                          <h3>Phone Number</h3>
                          {editingField === "phoneNumber" ? (
                            <>
                              <input
                                type="text"
                                value={updatedPhoneNumber}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (/^\d{0,10}$/.test(value)) {
                                    setUpdatedPhoneNumber(value);
                                  }
                                }}
                                placeholder="Enter your phone number"
                              />
                              <button
                                type="button"
                                className="ok-button"
                                onClick={() => handleFieldUpdate("phoneNumber")}
                              >
                                OK
                              </button>
                            </>
                          ) : !userData.phoneNumber ? (
                            <>
                              <input
                                type="text"
                                value={updatedPhoneNumber}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (/^\d{0,10}$/.test(value)) {
                                    setUpdatedPhoneNumber(value);
                                  }
                                }}
                                placeholder="Enter your phone number"
                              />
                              <button
                                type="button"
                                className="ok-button"
                                onClick={() => handleFieldUpdate("phoneNumber")}
                              >
                                OK
                              </button>
                            </>
                          ) : (
                            <>
                              <p>{userData.phoneNumber}</p>
                              {initialPhoneNumberEntered && (
                                <button
                                  type="button"
                                  className="change-button"
                                  onClick={() => handleEditClick("phoneNumber")}
                                >
                                  Change
                                </button>
                              )}
                            </>
                          )}
                          {formErrors.phoneNumber && (
                            <p className="error-text">
                              {formErrors.phoneNumber}
                            </p>
                          )}
                        </div>
                        <div className="mt-checkout__overview--item">
                          <h3>Shipping Address</h3>
                          {editingField === "address" ? (
                            <>
                              <input
                                type="text"
                                value={updatedAddress}
                                onChange={(e) =>
                                  setUpdatedAddress(e.target.value)
                                }
                                placeholder="Enter your shipping address"
                              />
                              <button
                                type="button"
                                className="ok-button"
                                onClick={() => handleFieldUpdate("address")}
                              >
                                OK
                              </button>
                            </>
                          ) : !userData.address ? (
                            <>
                              <input
                                type="text"
                                value={updatedAddress}
                                onChange={(e) =>
                                  setUpdatedAddress(e.target.value)
                                }
                                placeholder="Enter your shipping address"
                              />
                              <button
                                type="button"
                                className="ok-button"
                                onClick={() => handleFieldUpdate("address")}
                              >
                                OK
                              </button>
                            </>
                          ) : (
                            <>
                              <p>{userData.address}</p>
                              {initialAddressEntered && (
                                <button
                                  type="button"
                                  className="change-button"
                                  onClick={() => handleEditClick("address")}
                                >
                                  Change
                                </button>
                              )}
                            </>
                          )}
                          {formErrors.address && (
                            <p className="error-text">{formErrors.address}</p>
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
                      {formErrors.shipping && (
                        <p className="error-text">{formErrors.shipping}</p>
                      )}
                    </div>
                    <div className="mt-checkout__form--section">
                      <div className="mt-checkout__form--head">
                        <h2>Payment Method</h2>
                      </div>
                      <div className="mt-checkout__payment-option">
                        <div className="mt-input-wrapper">
                          <input
                            type="radio"
                            name="payment-option"
                            value="cash"
                            onChange={(e) => setPaymentMethod(e.target.value)}
                          />
                          <span>Cash on Delivery</span>
                        </div>
                        <div className="mt-input-wrapper">
                          <input
                            type="radio"
                            name="payment-option"
                            value="esewa"
                            onChange={(e) => setPaymentMethod(e.target.value)}
                          />
                          <span>eSewa</span>
                        </div>
                      </div>
                      {formErrors.payment && (
                        <p className="error-text">{formErrors.payment}</p>
                      )}
                    </div>
                    <div className="mt-checkout-buttons">
                      {formErrors.common && (
                        <p className="error-text">{formErrors.common}</p>
                      )}
                      {isCartEmpty && (
                        <p className="error-text">
                          Your cart is empty. Please add items to your cart
                          before checkout.
                        </p>
                      )}
                      {paymentMethod === "cash" && (
                        <input
                          className="mt-btn mt-btn__invert"
                          type="submit"
                          value={`Continue with Payment (Total: $${totalAmount})`}
                          disabled={isCartEmpty} // Disable button if cart is empty
                          onClick={async (e) => {
                            e.preventDefault();
                            const errors = {};
                            if (!userData.fullname)
                              errors.fullname = "Full Name is required.";
                            if (!userData.email)
                              errors.email = "Email is required.";
                            if (!userData.phoneNumber)
                              errors.phoneNumber = "Phone Number is required.";
                            if (!updatedAddress)
                              errors.address = "Shipping Address is required.";
                            if (!shippingCost)
                              errors.shipping =
                                "Shipping Information is required.";
                            if (!paymentMethod)
                              errors.payment = "Payment Method is required.";

                            if (Object.keys(errors).length > 0) {
                              errors.common =
                                "All fields are required. Please fill out all fields.";
                              setFormErrors(errors);
                              return;
                            }
                            try {
                              const orderResponse = await axios.post(
                                "http://localhost:3000/orders/create",
                                {
                                  transaction: {
                                    product_id: generateUniqueId(),
                                    amount: Number(totalAmount),
                                    status: "CASH",
                                  },
                                  user: currentUser._id,
                                  userInfo: {
                                    fullname: userData.fullname,
                                    email: userData.email,
                                    phoneNumber: userData.phoneNumber,
                                    address: userData.address,
                                  },
                                  shipping: {
                                    method:
                                      shippingCost === 30
                                        ? "standard"
                                        : shippingCost === 40
                                        ? "business"
                                        : "premium",
                                    cost: shippingCost,
                                  },
                                  paymentMethod: "cash",
                                  cart: cartItems.map((item) => ({
                                    id: item.id,
                                    quantity: item.quantity,
                                    productName: item.productName,
                                    price: item.price,
                                  })),
                                  stockUpdated: false, // Will be set to true after stock update
                                },
                                {
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                }
                              );

                              // Update tag quantities in the database and mark stock as updated
                              await axios.patch(
                                "http://localhost:3000/api/tag/updateStock",
                                {
                                  cart: cartItems.map((item) => ({
                                    id: item.id,
                                    quantity: item.quantity,
                                  })),
                                  orderId: orderResponse.data.order._id,
                                },
                                {
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                }
                              );

                              // Clear the cart after successful order
                              dispatch(clearCart());

                              // Show success alert with correct parameters (type, message, duration)
                              showSuccessAlert(
                                "success",
                                "Order placed successfully with Cash on Delivery!",
                                3000
                              );

                              // Redirect to homepage after alert is shown
                              setTimeout(() => {
                                window.location.href = "/";
                              }, 3000);
                            } catch (error) {
                              console.error(
                                "Error creating order or updating stock:",
                                error
                              );
                              setErrorMessage(
                                "Failed to create order or update stock. Please try again."
                              );
                            }
                          }}
                        />
                      )}
                      {paymentMethod === "esewa" && (
                        <button
                          type="button"
                          className="submit-button"
                          onClick={(e) => {
                            e.preventDefault();
                            const errors = {};
                            if (!userData.fullname)
                              errors.fullname = "Full Name is required.";
                            if (!userData.email)
                              errors.email = "Email is required.";
                            if (!userData.phoneNumber)
                              errors.phoneNumber = "Phone Number is required.";
                            if (!userData.address)
                              errors.address = "Shipping Address is required.";
                            if (!shippingCost)
                              errors.shipping =
                                "Shipping Information is required.";
                            if (!paymentMethod)
                              errors.payment = "Payment Method is required.";

                            if (Object.keys(errors).length > 0) {
                              // Show all errors in a single alert message
                              const errorMessages =
                                Object.values(errors).join("\n• ");
                              showSuccessAlert(
                                "error",
                                `Please correct the following:\n• ${errorMessages}`,
                                5000
                              );
                              setFormErrors(errors); // Set form errors for highlighting
                              return;
                            }

                            handlePayment(e);
                          }}
                          disabled={
                            !userData.fullname ||
                            !userData.email ||
                            !userData.phoneNumber ||
                            !userData.address ||
                            !shippingCost ||
                            isCartEmpty // Disable button if cart is empty
                          }
                        >
                          Pay with eSewa (Total: ${totalAmount})
                        </button>
                      )}
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

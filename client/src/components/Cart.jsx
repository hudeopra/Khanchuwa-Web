import React from "react";
import { Link, useNavigate } from "react-router-dom"; // Add useNavigate import
import { useAlert } from "./AlertContext"; // Import the alert context
import { FaShoppingCart } from "react-icons/fa";

export default function Cart({
  cartItems,
  isCartActive,
  toggleCart,
  handleClearCart,
  handleQuantityChange,
  handleRemoveFromCart,
  userCart,
  currentUser, // Add currentUser prop
}) {
  const { showAlert } = useAlert(); // Access the showAlert function
  const navigate = useNavigate(); // Initialize navigate hook

  const handleClearCartWithAlert = () => {
    handleClearCart();
    showAlert("success", "Cart cleared successfully!"); // Show success alert
  };

  const handleRemoveFromCartWithAlert = (itemId) => {
    const item = cartItems.find((item) => item.id === itemId);
    handleRemoveFromCart(itemId);
    showAlert("success", `${item.productName} removed from cart!`); // Show specific success alert
  };

  const handleQuantityChangeWithAlert = (itemId, newQuantity) => {
    const item = cartItems.find((item) => item.id === itemId);

    // Enforce minimum quantity of 1
    if (newQuantity < 1) {
      newQuantity = 1;
    }

    // Check if the item has a maximum quantity restriction
    if (item.maxQuantity !== undefined && newQuantity > item.maxQuantity) {
      showAlert(
        "warning",
        `Only ${item.maxQuantity} units available in stock.`
      );
      newQuantity = item.maxQuantity;
    }

    const change = newQuantity - item.quantity;

    if (change > 0) {
      showAlert("info", `${item.productName} quantity increased by ${change}.`); // Show specific info alert
    } else if (change < 0) {
      showAlert(
        "info",
        `${item.productName} quantity decreased by ${Math.abs(change)}.`
      ); // Show specific info alert
    }

    handleQuantityChange(itemId, newQuantity);
  };

  const handleCheckout = () => {
    if (!currentUser) {
      showAlert("warning", "Please sign in to proceed to checkout.");
      navigate("/signin");
      return;
    }

    document.querySelector(".kh-header__overlay").classList.remove("active");
    document
      .querySelector(".kh-header__cart--content")
      .classList.remove("active");
    navigate("/checkout");
  };

  return (
    <div className="kh-header__cart">
      <div className="kh-header__cart--head ">
        <span
          className={`kh-header__cart--count trigger ${
            isCartActive ? "active" : ""
          }`}
          onClick={toggleCart}
        >
          <FaShoppingCart />

          <span className="count">{cartItems.length}</span>
        </span>
      </div>
      <div
        className={`kh-header__cart--content ${isCartActive ? "active" : ""}`}
      >
        <div className="kh-header__cart--title">
          <h3>Cart</h3>
          <button onClick={handleClearCartWithAlert} className="kh-btn">
            Clear Cart
          </button>
        </div>
        <div className="kh-header__cart--body">
          {cartItems && cartItems.length > 0 ? (
            <>
              <ul className="kh-header__cart--items">
                {cartItems.map((item) => (
                  <li className="kh-header__cart--item" key={item.id}>
                    <div className="kh-header__cart--item-wrapper">
                      <div className="kh-header__cart--item-details">
                        <div className="kh-header__cart--item-img">
                          <img
                            src={item.favImg}
                            alt={item.productName}
                            className="kh-header__cart--item-fav"
                          />
                          <button
                            onClick={() =>
                              handleQuantityChangeWithAlert(
                                item.id,
                                item.quantity + 1
                              )
                            }
                            className="kh-heaader__cart--count-up kh-btn kh-btn__small"
                          >
                            <span>+</span>
                          </button>
                        </div>
                        <div className="kh-header__cart--item-content">
                          <p className="kh-header__cart--item-name text-capitalize">
                            {item.productName}
                          </p>
                          <div className="kh-header__cart--inventory">
                            <p className="kh-money kh-header__cart--item-price">
                              {item.mrkPrice || null}
                            </p>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                handleQuantityChangeWithAlert(
                                  item.id,
                                  Number(e.target.value)
                                )
                              }
                              min="1"
                              className=""
                            />
                            <button
                              onClick={() =>
                                handleQuantityChangeWithAlert(
                                  item.id,
                                  item.quantity - 1
                                )
                              }
                              className="kh-heaader__cart--count-down kh-btn kh-btn__small invert"
                            >
                              -
                            </button>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveFromCartWithAlert(item.id)}
                        className="kh-header__cart--item-remove kh-btn kh-btn__x"
                      >
                        x
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="kh-header__cart--totals">
                <div className="kh-header__cart--totals-items">
                  <div className="kh-header__cart--totals-item">
                    <small>Sub-Total:</small>
                    <span>
                      {cartItems
                        .reduce(
                          (total, item) =>
                            total + (item.mrkPrice || 0) * item.quantity,
                          0
                        )
                        .toFixed(2)}
                    </span>
                  </div>
                  <div className="kh-header__cart--totals-item">
                    <small>Discount:</small>
                    <span>
                      {(
                        cartItems.reduce(
                          (total, item) =>
                            total + (item.mrkPrice || 0) * item.quantity,
                          0
                        ) -
                        cartItems.reduce(
                          (total, item) =>
                            total + (item.disPrice || 0) * item.quantity,
                          0
                        )
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="kh-header__cart--totals-item">
                  <small>Checkout :</small>
                  <span>
                    {cartItems
                      .reduce(
                        (total, item) =>
                          total + (item.disPrice || 0) * item.quantity,
                        0
                      )
                      .toFixed(2)}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-cart-container text-center py-4">
              <p>Cart is empty</p>
              <Link
                to="/cookshop"
                className="kh-btn bg-green-500 text-white py-2 px-4 rounded mt-3"
              >
                Check out our cookshop
              </Link>
            </div>
          )}
          <div className="kh-header__cart--checkout">
            <button
              className="bg-green-500 text-white py-2 px-4 rounded"
              onClick={handleCheckout}
            >
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

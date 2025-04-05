import React from "react";
import { Link } from "react-router-dom";

export default function Cart({
  cartItems,
  isCartActive,
  toggleCart,
  handleClearCart,
  handleQuantityChange,
  handleRemoveFromCart,
  userCart,
}) {
  return (
    <div className="kh-header__cart">
      <div className="kh-header__cart--head ">
        <span
          className={`kh-header__cart--count trigger ${
            isCartActive ? "active" : ""
          }`}
          onClick={toggleCart}
        >
          <img
            src="../src/assets/img/search/chefLogo.png"
            alt="Khanchuwa Logo"
          />
          <span className="count">
            {cartItems.reduce((total, item) => total + item.quantity, 0)}
          </span>
        </span>
      </div>
      <div
        className={`kh-header__cart--content ${isCartActive ? "active" : ""}`}
      >
        <div className="kh-header__cart--title">
          <h3>Cart</h3>
          <button onClick={handleClearCart} className="kh-btn">
            Clear Cart
          </button>
        </div>
        <div className="kh-header__cart--body">
          {cartItems && cartItems.length > 0 ? (
            <>
              <ul className="kh-header__cart--items">
                {cartItems.map((item) => (
                  <li className="kh-header__cart--item" key={item.id}>
                    <div className="kh-header__cart--item--wrapper">
                      <div className="kh-header__cart--item--details">
                        <div className="kh-header__cart--item--img">
                          <img
                            src={item.favImg}
                            alt={item.productName}
                            className="kh-header__cart--item--fav"
                          />
                          <button
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity + 1)
                            }
                            className="kh-heaader__cart--count-up kh-btn kh-btn__small"
                          >
                            <span>+</span>
                          </button>
                        </div>
                        <div className="kh-header__cart--item--content">
                          <p className="kh-header__cart--item--name">
                            {item.productName}
                          </p>
                          <div className="kh-header__cart--item__inventory">
                            <p className="kh-money kh-header__cart--item--price">
                              {item.mrkPrice || null}
                            </p>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                handleQuantityChange(
                                  item.id,
                                  Number(e.target.value)
                                )
                              }
                              min="1"
                              className=""
                            />
                            <button
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity - 1)
                              }
                              className="kh-heaader__cart--count-down kh-btn kh-btn__small invert"
                            >
                              -
                            </button>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveFromCart(item.id)}
                        className="kh-header__cart--item--remove kh-btn kh-btn__x"
                      >
                        x
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="kh-header__cart--totals">
                <div className="kh-header__cart--totals--items">
                  <div className="kh-header__cart--totals--item">
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
                  <div className="kh-header__cart--totals--item">
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
                <div className="kh-header__cart--totals--item">
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
            <p>Cart is empty</p>
          )}
          <div className="kh-header__cart--checkout">
            <Link
              to=""
              className="bg-green-500 text-white py-2 px-4 rounded"
              onClick={() =>
                console.log("Cart Data:", JSON.stringify(userCart, null, 2))
              }
            >
              Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

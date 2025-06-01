import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../redux/user/userCart";
import { useAlert } from "../components/AlertContext";
import { FaEye } from "react-icons/fa";

const Cookshop = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [activeItem, setActiveItem] = useState(null);

  const dispatch = useDispatch();
  const { showAlert } = useAlert();
  const userData = useSelector((state) => state.user);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch("/api/tag/ingredients/inStock");
        if (!response.ok) throw new Error("Failed to fetch items");
        const data = await response.json();
        setItems(data);
        const initialQuantities = data.reduce((acc, item) => {
          acc[item._id] = 1;
          return acc;
        }, {});
        setQuantities(initialQuantities);
        setActiveItem(data[0] || null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const handleQuantityChange = (itemId, value) => {
    setQuantities((prev) => ({
      ...prev,
      [itemId]: Math.max(1, Number(value)),
    }));
  };

  const handleIncreaseQuantity = (itemId) => {
    setQuantities((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 1) + 1,
    }));
  };

  const handleDecreaseQuantity = (itemId) => {
    setQuantities((prev) => ({
      ...prev,
      [itemId]: Math.max(1, (prev[itemId] || 1) - 1),
    }));
  };

  const handleAddToCart = () => {
    // First check if user is logged in
    if (!userData.currentUser) {
      showAlert("error", "Please sign in to use cart");
      return;
    }

    if (activeItem) {
      // Check if item is in stock
      if (!activeItem.inStock || activeItem.quantity === 0) {
        showAlert("error", "This product is out of stock");
        return;
      }

      const quantity = quantities[activeItem._id] || 1;

      // Check if requested quantity exceeds available stock
      if (quantity > activeItem.quantity) {
        showAlert(
          "error",
          `Only ${activeItem.quantity} units available in stock`
        );
        return;
      }

      const unitPrice = activeItem.disPrice || activeItem.mrkPrice || 0;
      const cartItem = {
        _id: activeItem._id,
        productName: activeItem.name,
        description: activeItem.description || "",
        quantity,
        price: unitPrice * quantity,
        favImg: activeItem.favImg,
        disPrice: activeItem.disPrice || null,
        mrkPrice: activeItem.mrkPrice || null,
        maxQuantity: activeItem.quantity, // Add maxQuantity to respect stock limits
      };
      dispatch(addToCart(cartItem));
      showAlert("success", `${activeItem.name} (${quantity}) added to cart!`);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <main className="kh-cookshop-page kh-cookshop ">
      <section className="container my-5">
        <div className="row">
          <div className="col-12 col-md-6 col-lg-8">
            <h1>Cookshop</h1>
            <div className="kh-cookshop__list">
              <ul className="kh-cookshop__list--items">
                {items.map((item) => (
                  <li
                    key={item._id}
                    className={`kh-cookshop__list--item ${
                      activeItem?._id === item._id ? "active" : ""
                    }`}
                    onClick={() => setActiveItem(item)}
                  >
                    <img src={item.favImg} alt={item.name} width="50" />
                    <p>{item.name}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="col-12 col-md-6 col-lg-4">
            {activeItem && (
              <div className="kh-cookshop__details">
                <div className="mb-4">
                  <img
                    src={activeItem.favImg}
                    alt={activeItem.name}
                    className="w-full h-auto rounded-lg object-cover"
                  />
                </div>
                <h3>{activeItem.name}</h3>
                <span className="bg-red-600 text-white px-2 py-1 rounded text-xs">
                  SALE
                </span>
                <p className="flex items-center gap-2">
                  Price:
                  {activeItem.disPrice &&
                  activeItem.disPrice < activeItem.mrkPrice ? (
                    <>
                      <span className="line-through text-gray-500">
                        ${activeItem.mrkPrice}
                      </span>
                      <span className="font-bold">${activeItem.disPrice}</span>
                    </>
                  ) : !activeItem.mrkPrice && activeItem.disPrice ? (
                    <span className="font-bold">${activeItem.disPrice}</span>
                  ) : (
                    <span className="font-bold">${activeItem.mrkPrice}</span>
                  )}
                </p>
                <div className="mt-2 mb-3">
                  <p className="mb-1">{activeItem.description}</p>
                  <p className="text-sm font-medium">
                    Quantity Available:{" "}
                    <span className="font-bold">
                      {activeItem.quantity || "Out of stock"}
                    </span>
                  </p>
                </div>
                <div>
                  <div className="d-flex">
                    <button
                      onClick={() => handleDecreaseQuantity(activeItem._id)}
                      className="p-2 border"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantities[activeItem._id] || 1}
                      min="1"
                      onChange={(e) =>
                        handleQuantityChange(activeItem._id, e.target.value)
                      }
                      className="w-16 p-2 border text-center"
                    />
                    <button
                      onClick={() => handleIncreaseQuantity(activeItem._id)}
                      className="p-2 border"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={handleAddToCart}
                    disabled={
                      !userData.currentUser ||
                      !activeItem.inStock ||
                      activeItem.quantity === 0 ||
                      (quantities[activeItem._id] || 1) > activeItem.quantity
                    }
                    className={`mt-2 p-3 text-white rounded-lg hover:opacity-90 ${
                      !userData.currentUser ||
                      !activeItem.inStock ||
                      activeItem.quantity === 0 ||
                      (quantities[activeItem._id] || 1) > activeItem.quantity
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-600"
                    }`}
                  >
                    {!userData.currentUser
                      ? "Sign in to purchase"
                      : !activeItem.inStock || activeItem.quantity === 0
                      ? "Out of stock"
                      : (quantities[activeItem._id] || 1) > activeItem.quantity
                      ? `Limited stock (${activeItem.quantity})`
                      : "Add to Cart"}
                  </button>
                  <div className="kh-buttons">
                    <button
                      onClick={() =>
                        (window.location.href = `/cookshop/${activeItem.tagType}/${activeItem._id}`)
                      }
                      className="mt-2 p-3 bg-blue-600 text-white rounded-lg hover:opacity-90"
                    >
                      <FaEye />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Cookshop;

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../redux/user/userCart";
import { useAlert } from "../components/AlertContext";
import { Link } from "react-router-dom";

const Cookshop = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [activeItem, setActiveItem] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const dispatch = useDispatch();
  const { showAlert } = useAlert();
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);

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
        setActiveItem(data[0] || null); // Set the first item as active by default
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchCurrentUser = async () => {
      try {
        const res = await fetch("/api/user/current", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch user data");
        const data = await res.json();
        setCurrentUser(data);
      } catch (error) {
        console.error(error.message);
      }
    };

    fetchItems();
    fetchCurrentUser();
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

  const handleAddToCart = (item) => {
    if (!isLoggedIn) {
      showAlert("error", "You need to log in to add items to the cart.");
      return;
    }

    const quantity = quantities[item._id] || 1;
    const unitPrice = item.disPrice || item.mrkPrice || 0;
    dispatch(
      addToCart({
        _id: item._id,
        productName: item.name,
        quantity,
        price: unitPrice * quantity,
        unitPrice,
        favImg: item.favImg,
        disPrice: item.disPrice || null,
        mrkPrice: item.mrkPrice || null,
      })
    );
    showAlert("success", `${item.name} added to cart!`);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <main className="cookshop-page">
      <section className="container">
        <h1>Cookshop</h1>
        <div className="d-flex">
          {/* Sidebar with item list */}
          <ul className="item-list">
            {items.map((item) => (
              <li
                key={item._id}
                className={`item-tab ${
                  activeItem?._id === item._id ? "active" : ""
                }`}
                onClick={() => setActiveItem(item)}
              >
                <img src={item.favImg} alt={item.name} width="50" />
                <p>{item.name}</p>
              </li>
            ))}
          </ul>

          {/* Active item details */}
          {activeItem && (
            <div className="item-details">
              <h3>{activeItem.name}</h3>
              {activeItem.favImg && (
                <img
                  src={activeItem.favImg}
                  alt={activeItem.name}
                  width="100"
                />
              )}
              <p>
                Price:{" "}
                <span className={activeItem.disPrice ? "offer" : ""}>
                  ${activeItem.mrkPrice}
                </span>
                {activeItem.disPrice && <span> ${activeItem.disPrice}</span>}
              </p>
              <div>
                <button
                  onClick={() => handleDecreaseQuantity(activeItem._id)}
                  className="p-2 bg-gray-300 rounded-l-lg hover:bg-gray-400"
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
                  className="p-2 bg-gray-300 rounded-r-lg hover:bg-gray-400"
                >
                  +
                </button>
                <button
                  onClick={() => handleAddToCart(activeItem)}
                  className="mt-2 p-2 bg-green-600 text-white rounded-lg hover:opacity-90"
                  disabled={!isLoggedIn}
                >
                  Add to Cart
                </button>
              </div>
              {currentUser?.role === "admin" && (
                <Link
                  to={`/cookshop/item.${activeItem.tagType}/${activeItem._id}`}
                  className="mt-2 p-2 bg-blue-600 text-white rounded-lg hover:opacity-90"
                >
                  Edit
                </Link>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default Cookshop;

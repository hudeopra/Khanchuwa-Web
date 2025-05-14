import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/user/userCart";
import { useAlert } from "../components/AlertContext";

const Cookshop = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [activeItem, setActiveItem] = useState(null);

  const dispatch = useDispatch();
  const { showAlert } = useAlert();

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
    if (activeItem) {
      const quantity = quantities[activeItem._id] || 1;
      const unitPrice = activeItem.disPrice || activeItem.mrkPrice || 0;
      const cartItem = {
        _id: activeItem._id,
        productName: activeItem.name,
        quantity,
        price: unitPrice * quantity,
        favImg: activeItem.favImg,
        disPrice: activeItem.disPrice || null,
        mrkPrice: activeItem.mrkPrice || null,
      };

      dispatch(addToCart(cartItem));
      showAlert("success", `${activeItem.name} added to cart!`);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <main className="kh-cookshop-page kh-cookshop">
      <section className="container">
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
                <h3>{activeItem.name}</h3>
                <p>
                  Price: <span>${activeItem.mrkPrice}</span>
                  {activeItem.disPrice && <span> ${activeItem.disPrice}</span>}
                </p>
                <div>
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
                  <button
                    onClick={handleAddToCart}
                    className="mt-2 p-3 bg-green-600 text-white rounded-lg hover:opacity-90"
                  >
                    Add to Cart
                  </button>
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

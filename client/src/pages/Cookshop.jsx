import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/user/userCart";
import { useAlert } from "../components/AlertContext";
import { Link } from "react-router-dom";

const Cookshop = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantities, setQuantities] = useState({});

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

  const handleAddToCart = (item) => {
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
        <ul className="d-flex flex-wrap gap-3">
          {items.map((item) => (
            <li key={item._id} className="tag-card">
              <Link to={`/cookshop/${item.tagType}/${item._id}`}>
                <h3>{item.name}</h3>
                {item.favImg && (
                  <img src={item.favImg} alt={item.name} width="100" />
                )}
              </Link>
              <p>
                Price:{" "}
                <span className={item.disPrice ? "offer" : ""}>
                  ${item.mrkPrice}
                </span>
                {item.disPrice && <span> ${item.disPrice}</span>}
              </p>
              <div>
                <button
                  onClick={() => handleDecreaseQuantity(item._id)}
                  className="p-2 bg-gray-300 rounded-l-lg hover:bg-gray-400"
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantities[item._id] || 1}
                  min="1"
                  onChange={(e) =>
                    handleQuantityChange(item._id, e.target.value)
                  }
                  className="w-16 p-2 border text-center"
                />
                <button
                  onClick={() => handleIncreaseQuantity(item._id)}
                  className="p-2 bg-gray-300 rounded-r-lg hover:bg-gray-400"
                >
                  +
                </button>
                <button
                  onClick={() => handleAddToCart(item)}
                  className="mt-2 p-2 bg-green-600 text-white rounded-lg hover:opacity-90"
                >
                  Add to Cart
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
};

export default Cookshop;

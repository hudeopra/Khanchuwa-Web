import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../redux/user/userCart";
import { useAlert } from "../components/AlertContext";
import { Link } from "react-router-dom";
import ProductEditForm from "../components/ProductEditForm";
import { FaEye, FaEdit } from "react-icons/fa";

const AdminCookshop = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [activeItem, setActiveItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const dispatch = useDispatch();
  const { showAlert } = useAlert();
  const userData = useSelector((state) => state.user);

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const response = await fetch("/api/tag/ingredientTag");
        if (!response.ok) throw new Error("Failed to fetch ingredients");
        const data = await response.json();
        setItems(data);
        const initialQuantities = data.reduce((acc, item) => {
          acc[item._id] = 1;
          return acc;
        }, {});
        setQuantities(initialQuantities);
        setActiveItem(data[0] || null);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchIngredients();
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

  const handleProductUpdate = (updatedProduct) => {
    // Update the items list with the updated product
    setItems((prevItems) =>
      prevItems.map((item) =>
        item._id === updatedProduct._id ? updatedProduct : item
      )
    );
    // Update the active item
    setActiveItem(updatedProduct);
    // Exit edit mode
    setIsEditing(false);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  return (
    <main
      className={`kh-cookshop-page kh-cookshop ${
        isEditing ? "kh-editactive" : ""
      }`}
    >
      <section className="container">
        <div className="row">
          <div className="col-12 ">
            <div className="d-flex justify-content-between align-items-center">
              <h1>Admin Cookshop Management</h1>
            </div>
          </div>
          <div
            className={
              isEditing ? "col-12 col-md-6" : "col-12 col-md-6 col-lg-8"
            }
          >
            <div className="kh-cookshop__list">
              <ul className="kh-cookshop__list--items">
                {items.map((item) => (
                  <li
                    key={item._id}
                    className={`kh-cookshop__list--item ${
                      activeItem?._id === item._id ? "active" : ""
                    }`}
                    onClick={() => {
                      setActiveItem(item);
                      setIsEditing(false); // Reset edit mode when switching products
                    }}
                  >
                    <img src={item.favImg} alt={item.name} width="50" />
                    <p>{item.name}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div
            className={
              isEditing ? "col-12 col-md-6" : "col-12 col-md-6 col-lg-4"
            }
          >
            {activeItem && (
              <div className="kh-cookshop__details">
                {!isEditing ? (
                  <>
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
                          <span className="font-bold">
                            ${activeItem.disPrice}
                          </span>
                        </>
                      ) : !activeItem.mrkPrice && activeItem.disPrice ? (
                        <span className="font-bold">
                          ${activeItem.disPrice}
                        </span>
                      ) : (
                        <span className="font-bold">
                          ${activeItem.mrkPrice}
                        </span>
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
                      <p className="text-sm font-medium">
                        In Stock:{" "}
                        <span className="font-bold">
                          {activeItem.inStock ? "Yes" : "No"}
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
                          (quantities[activeItem._id] || 1) >
                            activeItem.quantity
                        }
                        className={`p-3 text-white rounded-lg hover:opacity-90 ${
                          !userData.currentUser ||
                          !activeItem.inStock ||
                          activeItem.quantity === 0 ||
                          (quantities[activeItem._id] || 1) >
                            activeItem.quantity
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-green-600"
                        }`}
                      >
                        {!userData.currentUser
                          ? "Sign in to purchase"
                          : !activeItem.inStock || activeItem.quantity === 0
                          ? "Out of stock"
                          : (quantities[activeItem._id] || 1) >
                            activeItem.quantity
                          ? `Limited stock (${activeItem.quantity})`
                          : "Add to Cart"}
                      </button>
                      <div className="kh-buttons">
                        <Link
                          to={`/cookshop/${activeItem.tagType}/${activeItem._id}`}
                          className="p-3 bg-blue-600 text-white rounded-lg hover:opacity-90"
                        >
                          <FaEye />
                        </Link>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="p-3 bg-yellow-600 text-white rounded-lg hover:opacity-90"
                        >
                          <FaEdit />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mb-4 flex justify-between items-center">
                      <h3>Editing: {activeItem.name}</h3>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                    <ProductEditForm
                      productId={activeItem._id}
                      onProductUpdate={handleProductUpdate}
                    />
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default AdminCookshop;

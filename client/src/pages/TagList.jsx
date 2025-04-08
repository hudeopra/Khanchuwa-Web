import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/user/userCart";
import { useAlert } from "../components/AlertContext"; // Import the alert context

const TagList = () => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantities, setQuantities] = useState({}); // State to track quantities for each tag

  const dispatch = useDispatch();
  const { showAlert } = useAlert(); // Access the showAlert function

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch("/api/tag");
        if (!response.ok) throw new Error("Failed to fetch tags");
        const data = await response.json();
        setTags(data);
        // Initialize quantities for each tag
        const initialQuantities = data.reduce((acc, tag) => {
          acc[tag._id] = 1;
          return acc;
        }, {});
        setQuantities(initialQuantities);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  const handleQuantityChange = (tagId, value) => {
    setQuantities((prev) => ({
      ...prev,
      [tagId]: Math.max(1, Number(value)),
    }));
  };

  const handleAddToCart = (tag) => {
    const quantity = quantities[tag._id] || 1;
    const unitPrice = tag.disPrice || tag.mrkPrice || 0; // Ensure unit price is calculated correctly
    dispatch(
      addToCart({
        _id: tag._id, // Use '_id' to match the Redux state structure
        productName: tag.name,
        quantity,
        price: unitPrice * quantity, // Calculate total price
        unitPrice, // Store unit price for future calculations
        favImg: tag.favImg, // Include favImg
        disPrice: tag.disPrice || null, // Add disPrice if available
        mrkPrice: tag.mrkPrice || null, // Add mrkPrice if available
      })
    );
    showAlert("success", `${tag.name} added to cart!`); // Show success alert
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const renderTagsByType = (type, title) => {
    const filteredTags = tags.filter((tag) => tag.tagType === type);
    if (filteredTags.length === 0) return null;

    return (
      <section className="tag-section">
        <div className="container py-5">
          <h2>{title}</h2>
          <ul className="d-flex flex-wrap gap-3">
            {filteredTags.map((tag) => (
              <li key={tag._id}>
                <Link
                  to={`/cookshop/${tag.tagType}/${tag._id}`}
                  data-discover="true"
                >
                  <h3>{tag.name}</h3>
                  {tag.favImg && (
                    <img
                      src={tag.favImg}
                      alt={`${tag.name} favorite`}
                      width="100"
                    />
                  )}
                  {type === "ingredientTag" && (
                    <>
                      <p>In Stock: {tag.inStock ? "Yes" : "No"}</p>
                      <p>
                        Price:{" "}
                        <span className={tag.disPrice ? "offer" : ""}>
                          ${tag.mrkPrice}
                        </span>
                        {tag.disPrice && <span> ${tag.disPrice}</span>}
                      </p>
                    </>
                  )}
                </Link>
                {type === "ingredientTag" && (
                  <div>
                    <input
                      type="number"
                      value={quantities[tag._id] || 1}
                      min="1"
                      onChange={(e) =>
                        handleQuantityChange(tag._id, e.target.value)
                      }
                      className="w-16 p-2 border text-center"
                    />
                    <button
                      onClick={() => handleAddToCart(tag)}
                      className="mt-2 p-2 bg-green-600 text-white rounded-lg hover:opacity-90"
                    >
                      Add to Cart
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  };

  return (
    <main className="kh-tag-page">
      <section className="container">
        <div className="row">
          <div className="col-12">
            <h1>Tag List</h1>
            {renderTagsByType("cuisineTag", "Cuisine Tags")}
            {renderTagsByType("ingredientTag", "Ingredient Tags")}
            {renderTagsByType("flavourTag", "Flavour Tags")}
          </div>
        </div>
      </section>
    </main>
  );
};

export default TagList;

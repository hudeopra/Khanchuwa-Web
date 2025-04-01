import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // Import Link for navigation
import { useDispatch } from "react-redux"; // Import useDispatch
import { addToCart } from "../redux/user/userCart"; // Import addToCart action

const TagList = () => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for filters
  const [showCuisineTags, setShowCuisineTags] = useState(true);
  const [showIngredientTags, setShowIngredientTags] = useState(true);
  const [showFlavourTags, setShowFlavourTags] = useState(true);
  const [showEquipmentTags, setShowEquipmentTags] = useState(true);

  const dispatch = useDispatch(); // Initialize dispatch

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch("/api/tag"); // Fetch all tags from the API
        if (!response.ok) throw new Error("Failed to fetch tags");
        const data = await response.json();
        setTags(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  const handleAddToCart = (tag, quantity) => {
    dispatch(
      addToCart({
        _id: tag._id,
        productName: tag.name,
        quantity: quantity || 1, // Default quantity is 1
        price: tag.disPrice || tag.mrkPrice || 0, // Use discounted price if available
      })
    );
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  // Filter tags based on selected checkboxes
  const filteredTags = tags.filter((tag) => {
    if (tag.tagType === "cuisineTag" && !showCuisineTags) return false;
    if (tag.tagType === "ingredientTag" && !showIngredientTags) return false;
    if (tag.tagType === "flavourTag" && !showFlavourTags) return false;
    if (tag.tagType === "equipmentTag" && !showEquipmentTags) return false;
    return true;
  });

  return (
    <main className="kh-tag-page">
      <section className="container">
        <div className="row">
          <div className="col-12">
            <h1>Tag List</h1>
            <div className="kh-tag-list__filters">
              <label>
                <input
                  type="checkbox"
                  checked={showCuisineTags}
                  onChange={() => setShowCuisineTags(!showCuisineTags)}
                />
                Show Cuisine Tags
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={showIngredientTags}
                  onChange={() => setShowIngredientTags(!showIngredientTags)}
                />
                Show Ingredient Tags
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={showFlavourTags}
                  onChange={() => setShowFlavourTags(!showFlavourTags)}
                />
                Show Flavour Tags
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={showEquipmentTags}
                  onChange={() => setShowEquipmentTags(!showEquipmentTags)}
                />
                Show Equipment Tags
              </label>
            </div>
            {filteredTags.length === 0 ? (
              <p>No tags available.</p>
            ) : (
              <ul className="d-flex flex-wrap gap-3">
                {filteredTags.map((tag) => (
                  <li key={tag._id}>
                    <h2>
                      <Link
                        to={`/cookshop/${tag.tagType}/${tag._id}`} // Updated link to use tagType and _id
                      >
                        {tag.name}
                      </Link>
                    </h2>
                    <p>Type: {tag.tagType}</p>
                    <p>Used in Recipes: {tag.usedIn.recipe}</p>
                    <p>Used in Blogs: {tag.usedIn.blog}</p>
                    {tag.equipmentRefs && (
                      <p>Equipment References: {tag.equipmentRefs.length}</p>
                    )}
                    {tag.favImg && (
                      <img
                        src={tag.favImg}
                        alt={`${tag.name} favorite`}
                        width="100"
                      />
                    )}
                    {tag.bannerImg && (
                      <img
                        src={tag.bannerImg}
                        alt={`${tag.name} banner`}
                        width="200"
                      />
                    )}
                    {tag.tagType === "ingredientTag" && ( // Add to Cart section only for ingredientTag
                      <div>
                        <input
                          type="number"
                          defaultValue={1}
                          min="1"
                          onChange={(e) =>
                            (tag.quantity = Math.max(1, Number(e.target.value)))
                          }
                          className="w-16 p-2 border text-center"
                        />
                        <button
                          onClick={() => handleAddToCart(tag, tag.quantity)}
                          className="mt-2 p-2 bg-green-600 text-white rounded-lg hover:opacity-90"
                        >
                          Add to Cart
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default TagList;

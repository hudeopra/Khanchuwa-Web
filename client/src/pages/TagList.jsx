import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/user/userCart";

const TagList = () => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch("/api/tag");
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
    if (!tag.objId) {
      console.warn(
        `Warning: objId is null or undefined for tag: ${tag.name}. Using fallback value.`
      );
    }
    dispatch(
      addToCart({
        _id: tag._id,
        productName: tag.name,
        quantity: quantity || 1,
        price: tag.disPrice || tag.mrkPrice || 0,
      })
    );
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const renderTagsByType = (type, title) => {
    const filteredTags = tags.filter((tag) => tag.tagType === type);
    if (filteredTags.length === 0) return null;

    return (
      <section>
        <h2>{title}</h2>
        <ul className="d-flex flex-wrap gap-3">
          {filteredTags.map((tag) => (
            <li key={tag._id}>
              <h3>
                <Link to={`/cookshop/${tag.tagType}/${tag._id}`}>
                  {tag.name}
                </Link>
              </h3>
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
              {tag.tagType === "ingredientTag" && (
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
            {renderTagsByType("equipmentTag", "Equipment Tags")}
          </div>
        </div>
      </section>
    </main>
  );
};

export default TagList;

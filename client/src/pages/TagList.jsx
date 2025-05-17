import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import { useDispatch, useSelector } from "react-redux"; // Update to include useSelector
import { useAlert } from "../components/AlertContext"; // Import the alert context

const TagList = ({ tagType }) => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantities, setQuantities] = useState({}); // State to track quantities for each tag
  const [currentUser, setCurrentUser] = useState(null); // State for current user

  const dispatch = useDispatch();
  const navigate = useNavigate(); // For navigation
  const { showAlert } = useAlert(); // Access the showAlert function
  const userData = useSelector((state) => state.user); // Get user data from Redux

  useEffect(() => {
    // If trying to access ingredient tags, check for admin role
    if (tagType === "ingredientTag") {
      const fetchCurrentUser = async () => {
        try {
          const res = await fetch("/api/user/current", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          });
          if (!res.ok) throw new Error("Failed to fetch current user");
          const data = await res.json();
          setCurrentUser(data);

          // Update Redux with the user data
          dispatch({
            type: "user/updateUserSuccess",
            payload: data,
          });

          // If user is not admin, redirect to home page
          if (data && data.role !== "admin") {
            showAlert(
              "Access denied: Admin privileges required",
              "Only Admin Access"
            );
            navigate("/"); // Redirect to home page
            return;
          }

          // If user is admin, proceed with fetching tags
          fetchTags();
        } catch (error) {
          console.error("Error fetching current user:", error.message);
          showAlert("Authentication error", "danger");
          navigate("/"); // Redirect on error
        }
      };

      fetchCurrentUser();
    } else {
      // For non-admin restricted pages, fetch tags directly
      fetchTags();
    }
  }, [tagType, dispatch, navigate, showAlert]);

  const fetchTags = async () => {
    try {
      const response = await fetch(`/api/tag?type=${tagType}`); // Fetch tags by type
      if (!response.ok) throw new Error("Failed to fetch tags");
      const data = await response.json();
      setTags(data);
      // Initialize quantities for each tag
      const initialQuantities = data.reduce((acc, tag) => {
        acc[tag._id] = 1;
        return acc;
      }, {});
      setQuantities(initialQuantities);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleQuantityChange = (tagId, value) => {
    setQuantities((prev) => ({
      ...prev,
      [tagId]: Math.max(1, Number(value)),
    }));
  };

  const handleAddToCart = (tag) => {
    // Removed Add to Cart functionality
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  // For ingredient tags, verify admin access
  if (tagType === "ingredientTag" && currentUser?.role !== "admin") {
    return null; // Extra protection, should not normally reach here due to redirect
  }

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
                <Link to={`/cookshop/${tag.tagType}/${tag._id}`}>
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
                      {tag.inStock !== undefined && (
                        <p>In Stock: {tag.inStock ? "Yes" : "No"}</p>
                      )}
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
            <h1>
              {tagType === "ingredientTag"
                ? "Ingredients"
                : tagType === "cuisineTag"
                ? "Cuisines"
                : "Flavours"}
            </h1>
            {renderTagsByType(
              tagType,
              `${
                tagType === "ingredientTag"
                  ? "Ingredient"
                  : tagType === "cuisineTag"
                  ? "Cuisine"
                  : "Flavour"
              } Tags`
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default TagList;

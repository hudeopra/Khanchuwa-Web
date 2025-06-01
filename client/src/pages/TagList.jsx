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
  const [activeTag, setActiveTag] = useState(null); // State for the active/selected tag

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

      // Set the first tag as active
      if (data.length > 0) {
        setActiveTag(data[0]);
      }

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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  // For ingredient tags, verify admin access
  if (tagType === "ingredientTag" && currentUser?.role !== "admin") {
    return null; // Extra protection, should not normally reach here due to redirect
  }

  const getTagTypeTitle = () => {
    switch (tagType) {
      case "ingredientTag":
        return "Ingredients";
      case "cuisineTag":
        return "Cuisines";
      case "flavorTag":
        return "Flavors";
      default:
        return "Tags";
    }
  };

  return (
    <main className="kh-cookshop-page kh-cookshop kh-tag-page">
      <section className="container">
        <div className="row">
          <div className="col-12 mb-4">
            <h1>{getTagTypeTitle()}</h1>
          </div>
          <div className="col-12 col-md-6 col-lg-8">
            <div className="kh-cookshop__list">
              <ul className="kh-cookshop__list--items">
                {tags.map((tag) => (
                  <li
                    key={tag._id}
                    className={`kh-cookshop__list--item ${
                      activeTag?._id === tag._id ? "active" : ""
                    }`}
                    onClick={() => setActiveTag(tag)}
                  >
                    <img
                      src={tag.favImg || "https://via.placeholder.com/50"}
                      alt={tag.name}
                      width="50"
                    />
                    <p>{tag.name}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="col-12 col-md-6 col-lg-4">
            {activeTag && (
              <div className="kh-cookshop__details">
                <div className="mb-4">
                  <img
                    src={
                      activeTag.favImg || "https://via.placeholder.com/400x300"
                    }
                    alt={activeTag.name}
                    className="w-full h-auto rounded-lg object-cover"
                  />
                </div>
                <h3>{activeTag.name}</h3>

                {activeTag.description && (
                  <p className="mb-3">{activeTag.description}</p>
                )}

                {activeTag.tagType === "ingredientTag" && (
                  <div className="mt-2 mb-3">
                    <p className="flex items-center gap-2">
                      Price:
                      {activeTag.disPrice &&
                      activeTag.disPrice < activeTag.mrkPrice ? (
                        <>
                          <span className="line-through text-gray-500">
                            ${activeTag.mrkPrice}
                          </span>
                          <span className="font-bold">
                            ${activeTag.disPrice}
                          </span>
                          <span className="bg-red-600 text-white px-2 py-1 rounded text-xs">
                            SALE
                          </span>
                        </>
                      ) : !activeTag.mrkPrice && activeTag.disPrice ? (
                        <span className="font-bold">${activeTag.disPrice}</span>
                      ) : (
                        <span className="font-bold">${activeTag.mrkPrice}</span>
                      )}
                    </p>

                    <p className="text-sm font-medium mt-2">
                      In Stock:{" "}
                      <span className="font-bold">
                        {activeTag.inStock ? "Yes" : "No"}
                      </span>
                    </p>

                    {activeTag.quantity !== undefined && (
                      <p className="text-sm font-medium">
                        Quantity Available:{" "}
                        <span className="font-bold">
                          {activeTag.quantity || "Out of stock"}
                        </span>
                      </p>
                    )}
                  </div>
                )}

                {activeTag.category && activeTag.category.length > 0 && (
                  <div className="mb-3">
                    <strong>Categories:</strong>{" "}
                    <span>{activeTag.category.join(", ")}</span>
                  </div>
                )}

                <div className="mt-4">
                  <Link
                    to={`/cookshop/${activeTag.tagType}/${activeTag._id}`}
                    className="btn btn-primary"
                  >
                    View Details
                  </Link>

                  {currentUser?.role === "admin" && (
                    <Link
                      to={`/admin/product/edit/${activeTag._id}`}
                      className="btn btn-secondary ms-2"
                    >
                      Edit Tag
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default TagList;

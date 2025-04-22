import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Add useNavigate import
import { useDispatch } from "react-redux"; // Import useDispatch
import { addToCart } from "../redux/user/userCart"; // Import addToCart action
import { useAlert } from "../components/AlertContext"; // Import the alert context

const TagDetail = () => {
  const { id, tagType } = useParams(); // Get the tag ID and tagType from the URL
  const [tag, setTag] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1); // State for quantity
  const dispatch = useDispatch(); // Initialize dispatch
  const navigate = useNavigate(); // Initialize navigate
  const { showAlert } = useAlert(); // Access the showAlert function
  const [currentUser, setCurrentUser] = useState(null); // State for current user

  useEffect(() => {
    const fetchTag = async () => {
      try {
        console.log("Fetching tag details for:", tagType, id); // Debugging log
        const response = await fetch(
          `http://localhost:3000/api/tag/${tagType}/${id}`,
          {
            headers: { "Content-Type": "application/json" }, // Add headers if needed
          }
        );
        console.log("API Response Status:", response.status); // Debugging log
        if (!response.ok) {
          console.error(
            "Failed to fetch tag details",
            response.status,
            response.statusText
          );
          setError(
            `Failed to fetch tag details. Status: ${response.status} ${response.statusText}`
          ); // Provide detailed error message
          return;
        }

        const data = await response.json(); // Parse the response JSON
        console.log("Fetched Tag Data:", data); // Debugging log
        setTag(data); // Set the tag state with the fetched data

        // Fetch recipes and blogs based on references
        const recipeFetches = data.recipeRefs.map((refId) => {
          console.log("Fetching recipe with ID:", refId); // Debugging log
          return fetch(`http://localhost:3000/api/recipe/${refId}`, {
            headers: { "Content-Type": "application/json" },
          })
            .then(async (res) => {
              const contentType = res.headers.get("content-type");
              let recipeData;
              if (contentType && contentType.includes("application/json")) {
                recipeData = await res.json();
              } else {
                const text = await res.text();
                throw new Error(text);
              }
              if (!res.ok) {
                console.error(
                  `Error fetching recipe ${refId}:`,
                  res.status,
                  res.statusText
                );
                return null;
              }
              return recipeData;
            })
            .catch((err) => {
              console.error(`Fetch error for recipe ${refId}:`, err.message); // Improved error message
              return null;
            });
        });

        const blogFetches = data.blogRefs.map((refId) => {
          console.log("Fetching blog with ID:", refId); // Debugging log
          return fetch(`http://localhost:3000/api/blog/${refId}`, {
            headers: { "Content-Type": "application/json" },
          })
            .then((res) => {
              if (!res.ok) {
                console.error(
                  `Error fetching blog ${refId}:`,
                  res.status,
                  res.statusText
                );
                return null;
              }
              return res.json();
            })
            .catch((err) => {
              console.error(`Fetch error for blog ${refId}:`, err.message); // Improved error message
              return null;
            });
        });

        const [fetchedRecipes, fetchedBlogs] = await Promise.all([
          Promise.all(recipeFetches),
          Promise.all(blogFetches),
        ]);

        setRecipes(fetchedRecipes.filter((recipe) => recipe)); // Filter out null values
        if (fetchedRecipes.filter((recipe) => !recipe).length > 0) {
          console.warn("Some recipes could not be fetched.");
        }

        setBlogs(fetchedBlogs.filter((blog) => blog)); // Filter out null values
        if (fetchedBlogs.filter((blog) => !blog).length > 0) {
          console.warn("Some blogs could not be fetched.");
        }
      } catch (err) {
        console.error("Error fetching tag details:", err.message); // Improved error message
        setError(
          "An unexpected error occurred while fetching tag details. Please check your network connection and try again."
        ); // Provide user-friendly error message
      } finally {
        setLoading(false);
      }
    };

    fetchTag();
  }, [id, tagType]); // Removed navigate from dependency array as it's not directly used

  useEffect(() => {
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
      } catch (error) {
        console.error("Error fetching current user:", error.message);
      }
    };

    fetchCurrentUser();
  }, []);

  const handleAddToCart = () => {
    if (tag) {
      const unitPrice = tag.disPrice || tag.mrkPrice || 0; // Calculate unit price
      const cartItem = {
        _id: tag._id,
        productName: tag.name,
        quantity,
        price: unitPrice * quantity, // Calculate total price
        favImg: tag.favImg, // Include favImg
        disPrice: tag.disPrice || null, // Add disPrice if available
        mrkPrice: tag.mrkPrice || null, // Add mrkPrice if available
      };
      console.log("Dispatching addToCart with:", cartItem); // Debugging log
      dispatch(addToCart(cartItem));
      showAlert("success", `${tag.name} added to cart!`); // Show success alert
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!tag) return <div>No tag found.</div>;

  return (
    <main className="kh-tag-detail-page">
      <section className="container">
        <div className="row">
          <div className="col-12">
            <div className="kh-tag-detail__wrapper">
              <div className=" d-flex justify-content-between align-items-end mb-2">
                <h1>{tag.name}</h1>
                <p class="kh-tag-detail__tag-name">{tag.tagType}</p>
              </div>
              <div className="kh-tag-detail__banner">
                {tag.bannerImg && (
                  <img
                    src={tag.bannerImg}
                    alt={`${tag.name} banner`}
                    width="400"
                  />
                )}
                {currentUser?.role === "admin" &&
                  ["ingredientTag", "cuisineTag", "flavourTag"].includes(
                    tag.tagType
                  ) && ( // Show only for admin and specific tag types
                    <div className="kh-tag-detail__admin-actions">
                      <a
                        href={`/product/edit/${tag._id}`}
                        className="mt-2 ml-4 p-3 bg-blue-600 text-white rounded-lg hover:opacity-90"
                      >
                        Edit Product
                      </a>
                    </div>
                  )}
              </div>
            </div>
            {/* {tag.favImg && (
              <div>
                <strong>Favorite Image:</strong>
                <img
                  src={tag.favImg}
                  alt={`${tag.name} favorite`}
                  width="200"
                />
              </div>
            )} */}
            {tag.description && (
              <p>
                <strong>Description:</strong> {tag.description}
              </p>
            )}
            {tag.inStock !== undefined && (
              <p>
                <strong>In Stock:</strong> {tag.inStock ? "Yes" : "No"}
              </p>
            )}
            {tag.quantity !== undefined && (
              <p>
                <strong>Quantity:</strong> {tag.quantity}
              </p>
            )}
            {tag.mrkPrice !== undefined && (
              <p>
                <strong>Market Price:</strong> ${tag.mrkPrice}
              </p>
            )}
            {tag.disPrice !== undefined && (
              <p>
                <strong>Discounted Price:</strong> ${tag.disPrice}
              </p>
            )}
            {/* Add to Cart Section */}
            {tag.tagType === "ingredientTag" && ( // Show only for ingredientTag
              <div className="my-4">
                <h2>Purchase</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    className="p-2 border"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    min="1"
                    className="w-16 p-2 border text-center"
                  />
                  <button
                    onClick={() => setQuantity((prev) => prev + 1)} // Removed extra closing parenthesis
                    className="p-2 border"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  className="mt-2 p-3 bg-green-600 text-white rounded-lg hover:opacity-90"
                >
                  Add to Cart
                </button>
                {/* New Edit Product Link */}
              </div>
            )}
            {tag.category && tag.category.length > 0 && (
              <p>
                <strong>Categories:</strong> {tag.category.join(", ")}
              </p>
            )}
          </div>
        </div>
        <div className="row">
          <div className="col-12 py-5">
            <h2>Recipes list</h2>
            <div className="row">
              {recipes.length > 0 ? (
                recipes.map((recipe) => (
                  <div className="col-md-4 mb-4" key={`recipe-${recipe._id}`}>
                    <div className="card">
                      <img
                        src={recipe.favImgUrl || ""}
                        alt={recipe.recipeName || "Recipe"}
                        className="card-img-top"
                      />
                      <div className="card-body">
                        <h5 className="card-title">
                          {recipe.recipeName || "N/A"}
                        </h5>
                        <p className="card-text mb-2">
                          <p>
                            {recipe.description.length > 150
                              ? `${recipe.description.slice(0, 110)}...`
                              : recipe.description}
                          </p>{" "}
                        </p>
                        <a
                          href={`/recipes/${recipe._id}`}
                          className="btn btn-primary"
                        >
                          View Recipe
                        </a>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>No recipes found.</p>
              )}
            </div>
          </div>
          <div className="col-12 py-5">
            <h2>Blogs list</h2>
            <div className="row">
              {blogs.length > 0 ? (
                blogs.map((blog) => (
                  <div className="col-md-4" key={`blog-${blog._id}`}>
                    <div className="card">
                      <img
                        src={blog.bannerImgUrl || ""}
                        alt={blog.blogtitle || "Blog"}
                        className="card-img-top"
                      />
                      <div className="card-body">
                        <h5 className="card-title">
                          {blog.blogtitle || "N/A"}
                        </h5>
                        <p className="card-text">
                          {blog.blogBody
                            ? blog.blogBody.slice(0, 100)
                            : "No content available."}
                          ...
                        </p>
                        <a
                          href={`/blogs/${blog._id}`}
                          className="btn btn-primary"
                        >
                          View Blog
                        </a>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>No blogs found.</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default TagDetail;

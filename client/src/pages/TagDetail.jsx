import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom"; // Add Link and useNavigate imports
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
  const [pendingRecipes, setPendingRecipes] = useState(0); // Track number of pending recipes

  // Helper function to silently check if a recipe is published
  const checkRecipePublished = async (recipeId) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/recipe/published/${recipeId}`,
        {
          headers: { "Content-Type": "application/json" },
          // Adding this option helps prevent the browser from showing failed requests in the console
          mode: "cors",
        }
      );

      if (!response.ok) {
        return null; // Return null for unpublished recipes instead of throwing
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      } else {
        return null;
      }
    } catch (error) {
      // Silent handling - don't log to console
      return null;
    }
  };

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

        // Initialize missing recipes counter
        let missingRecipesCount = 0;

        // Fetch recipes based on references - using our improved silent check
        const recipePromises = data.recipeRefs.map(checkRecipePublished);
        const fetchedRecipes = await Promise.all(recipePromises);

        // Count missing recipes and filter out nulls
        const validRecipes = fetchedRecipes.filter((recipe) => {
          if (!recipe) {
            missingRecipesCount++;
            return false;
          }
          return true;
        });

        // Log summary of missing recipes if there are any
        if (missingRecipesCount > 0) {
          console.log(`${missingRecipesCount} recipes are coming soon!`);
          setPendingRecipes(missingRecipesCount);
        }

        setRecipes(validRecipes);

        // Fetch blogs based on references
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

        const fetchedBlogs = await Promise.all(blogFetches);
        setBlogs(fetchedBlogs.filter((blog) => blog)); // Filter out null values
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
    // First check if user is logged in
    if (!currentUser) {
      showAlert("error", "Please sign in to use cart");
      return;
    }

    // Check if item is in stock
    if (!tag.inStock || tag.quantity === 0) {
      showAlert("error", "This product is out of stock");
      return;
    }

    // Check if requested quantity exceeds available stock
    if (quantity > tag.quantity) {
      showAlert("error", `Only ${tag.quantity} units available in stock`);
      return;
    }
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
        maxQuantity: tag.quantity, // Add maxQuantity to respect stock limits
      };
      console.log("Dispatching addToCart with:", cartItem); // Debugging log
      dispatch(addToCart(cartItem));
      showAlert("success", `${tag.name} (${quantity}) added to cart!`); // Show success alert with quantity
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!tag) return <div>No tag found.</div>;

  return (
    <main className="kh-tag-detail-page">
      <section className="container pb-5">
        <div className="row">
          <div className="col-12">
            <div className="kh-tag-detail__wrapper">
              <div className=" d-flex justify-content-between align-items-end mb-2">
                <h1>{tag.name}</h1>
                <p className="kh-tag-detail__tag-name">{tag.tagType}</p>
              </div>
              <div className="kh-tag-detail__banner">
                {tag.bannerImg && (
                  <img
                    src={tag.bannerImg}
                    alt={`${tag.name} banner`}
                    width="400"
                  />
                )}
                {currentUser?.role === "admin" && (
                  <div className="kh-tag-detail__admin-actions">
                    <a
                      href={`/admin/product/edit/${tag._id}`}
                      className="mt-2 ml-4 p-3 bg-blue-600 text-white rounded-lg hover:opacity-90 me-2"
                    >
                      Edit Tag
                    </a>
                    <a
                      href={`/admin/tag/${tagType}/${tag._id}`}
                      className="mt-2 ml-4 p-3 bg-purple-600 text-white rounded-lg hover:opacity-90"
                    >
                      Admin View
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
                  disabled={
                    !currentUser ||
                    !tag.inStock ||
                    tag.quantity === 0 ||
                    quantity > tag.quantity
                  }
                  className={`mt-2 p-3 text-white rounded-lg hover:opacity-90 ${
                    !currentUser ||
                    !tag.inStock ||
                    tag.quantity === 0 ||
                    quantity > tag.quantity
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600"
                  }`}
                >
                  {!currentUser
                    ? "Sign in to purchase"
                    : !tag.inStock || tag.quantity === 0
                    ? "Out of stock"
                    : quantity > tag.quantity
                    ? `Limited stock (${tag.quantity})`
                    : "Add to Cart"}
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
        </div>{" "}
        <div className="row">
          <div className="col-12 py-5">
            <h4 className="text-3xl font-semibold my-4">
              Recipes with this Tag
            </h4>
            {pendingRecipes > 0 && (
              <div className="alert alert-info">
                {pendingRecipes} more recipe
                {pendingRecipes > 1 ? "s" : ""} coming soon!
              </div>
            )}
            <div className="row">
              {recipes.length > 0 ? (
                recipes.map((recipe) => (
                  <div
                    key={recipe._id}
                    className="col-12 col-lg-3 col-md-4 col-sm-6 mb-3"
                  >
                    <div className="kh-recipe-block__item mb-3">
                      <Link to={`/recipes/${recipe._id}`} className="">
                        <div className="kh-recipe-block__content">
                          <h3 className="">{recipe.recipeName}</h3>
                          <p className="">
                            {recipe.shortDescription ||
                              recipe.description?.substring(0, 60) + "..."}
                          </p>
                          <span className="">By {recipe.chefName}</span>
                        </div>
                        <div className="kh-recipe-block__item--img">
                          <img
                            src={
                              recipe.imageUrls?.[0] || recipe.favImgUrl || ""
                            }
                            alt={recipe.recipeName || "Recipe"}
                            className=""
                          />
                        </div>
                        <div className="d-none">
                          <p>Cook Time: {recipe.cookTime}</p>
                          <p>Diet: {recipe.diet}</p>
                          <p>Difficulty: {recipe.difficulty}</p>
                          <p>
                            Ingredient Tags:{" "}
                            {Array.isArray(recipe.ingredientTag)
                              ? recipe.ingredientTag
                                  .map((tag) => tag.tagName)
                                  .join(", ")
                              : recipe.ingredientTag}
                          </p>
                          <p>Prep Time: {recipe.prepTime}</p>
                          <p>Portion: {recipe.portion}</p>
                          <p>
                            Flavour Tags:{" "}
                            {Array.isArray(recipe.flavourTag)
                              ? recipe.flavourTag
                                  .map((tag) => tag.tagName)
                                  .join(", ")
                              : recipe.flavourTag}
                          </p>
                          <p>
                            Cuisine Tags:{" "}
                            {Array.isArray(recipe.cuisineTag)
                              ? recipe.cuisineTag
                                  .map((tag) => tag.tagName)
                                  .join(", ")
                              : recipe.cuisineTag}
                          </p>
                        </div>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <p>No recipes found.</p>
              )}
            </div>
          </div>
          <div className="col-12 py-5">
            <h4 className="text-3xl font-semibold my-4">Blogs with this Tag</h4>
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

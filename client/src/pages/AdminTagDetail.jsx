import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/user/userCart";
import { useAlert } from "../components/AlertContext";
import { useSelector } from "react-redux";

const AdminTagDetail = () => {
  const { id, tagType } = useParams();
  const [tag, setTag] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const { currentUser } = useSelector((state) => state.user);

  // Check if user is admin
  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin") {
      navigate("/");
      showAlert("error", "Unauthorized access");
    }
  }, [currentUser, navigate, showAlert]);

  useEffect(() => {
    const fetchTag = async () => {
      try {
        console.log("Admin: Fetching tag details for:", tagType, id);
        const response = await fetch(
          `http://localhost:3000/api/tag/${tagType}/${id}`,
          {
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!response.ok) {
          console.error(
            "Failed to fetch tag details",
            response.status,
            response.statusText
          );
          setError(
            `Failed to fetch tag details. Status: ${response.status} ${response.statusText}`
          );
          return;
        }

        const data = await response.json();
        console.log("Admin: Fetched Tag Data:", data);
        setTag(data);

        // Fetch all recipes regardless of status (admin view)
        const recipeFetches = data.recipeRefs.map((refId) => {
          console.log("Admin: Fetching recipe with ID:", refId);
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
              console.error(`Fetch error for recipe ${refId}:`, err.message);
              return null;
            });
        });

        const blogFetches = data.blogRefs.map((refId) => {
          console.log("Admin: Fetching blog with ID:", refId);
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
              console.error(`Fetch error for blog ${refId}:`, err.message);
              return null;
            });
        });

        const [fetchedRecipes, fetchedBlogs] = await Promise.all([
          Promise.all(recipeFetches),
          Promise.all(blogFetches),
        ]);

        setRecipes(fetchedRecipes.filter((recipe) => recipe));
        if (fetchedRecipes.filter((recipe) => !recipe).length > 0) {
          console.warn("Some recipes could not be fetched.");
        }

        setBlogs(fetchedBlogs.filter((blog) => blog));
        if (fetchedBlogs.filter((blog) => !blog).length > 0) {
          console.warn("Some blogs could not be fetched.");
        }
      } catch (err) {
        console.error("Error fetching tag details:", err.message);
        setError(
          "An unexpected error occurred while fetching tag details. Please check your network connection and try again."
        );
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.role === "admin") {
      fetchTag();
    }
  }, [id, tagType, currentUser]);

  // Function to handle status change
  const handleStatusChange = async (recipeId, newStatus) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("Authentication token missing");
        return;
      }

      const response = await fetch(`/api/recipe/update/${recipeId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update recipe status");
      }

      // Update the local recipe list with the new status
      setRecipes((prevRecipes) =>
        prevRecipes.map((recipe) =>
          recipe._id === recipeId ? { ...recipe, status: newStatus } : recipe
        )
      );

      showAlert("success", `Recipe status updated to ${newStatus}`);
    } catch (err) {
      setError(err.message);
      showAlert("error", err.message);
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
              <div className="d-flex justify-content-between align-items-end mb-2">
                <h1>Admin: {tag.name}</h1>
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
                <div className="kh-tag-detail__admin-actions">
                  <a
                    href={`/product/edit/${tag._id}`}
                    className="mt-2 ml-4 p-3 bg-blue-600 text-white rounded-lg hover:opacity-90"
                  >
                    Edit Tag
                  </a>
                </div>
              </div>
            </div>

            {tag.description && (
              <p>
                <strong>Description:</strong> {tag.description}
              </p>
            )}

            {tag.category && tag.category.length > 0 && (
              <p>
                <strong>Categories:</strong> {tag.category.join(", ")}
              </p>
            )}

            {/* Product Details Section (for ingredientTag) */}
            {tag.tagType === "ingredientTag" && (
              <div className="border p-3 mb-4 bg-light">
                <h3>Product Details</h3>
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
              </div>
            )}
          </div>
        </div>
        <div className="row">
          <div className="col-12 py-5">
            <h2>All Recipes (Admin View)</h2>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Recipe Name</th>
                    <th>Chef</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recipes.length > 0 ? (
                    recipes.map((recipe) => (
                      <tr key={`recipe-${recipe._id}`}>
                        <td>{recipe._id.substring(0, 8)}...</td>
                        <td>{recipe.recipeName || "N/A"}</td>
                        <td>{recipe.chefName || "Unknown"}</td>
                        <td>
                          <select
                            className="form-select"
                            value={recipe.status || "DRAFT"}
                            onChange={(e) =>
                              handleStatusChange(recipe._id, e.target.value)
                            }
                          >
                            <option value="DRAFT">DRAFT</option>
                            <option value="PENDING">PENDING</option>
                            <option value="PUBLISHED">PUBLISHED</option>
                            <option value="REJECTED">REJECTED</option>
                          </select>
                        </td>
                        <td>
                          <a
                            href={`/recipes/${recipe._id}`}
                            className="btn btn-primary btn-sm me-2"
                          >
                            View
                          </a>
                          <a
                            href={`/edit-recipe/${recipe._id}`}
                            className="btn btn-info btn-sm"
                          >
                            Edit
                          </a>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5">No recipes found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
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

export default AdminTagDetail;

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function AdminAllRecipe() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusChanging, setStatusChanging] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [activeRecipe, setActiveRecipe] = useState(null);
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);

  // Fetch all recipes on component mount
  useEffect(() => {
    // Check if user is admin first
    if (!currentUser || currentUser.role !== "admin") {
      navigate("/");
      return;
    }

    const fetchAllRecipes = async () => {
      try {
        const res = await fetch("/api/recipe/all");
        const data = await res.json();
        setRecipes(data);
        setLoading(false);
        if (data.length > 0) {
          setActiveRecipe(data[0]);
        }
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchAllRecipes();
  }, [currentUser, navigate]);

  // Function to handle status change
  const handleStatusChange = async (recipeId, newStatus) => {
    try {
      // Set the changing status for this specific recipe
      setStatusChanging((prev) => ({ ...prev, [recipeId]: true }));
      setError(null);

      // Try to get token from various storage locations
      const token =
        localStorage.getItem("access_token") ||
        sessionStorage.getItem("access_token") ||
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("access_token="))
          ?.split("=")[1];

      // If no token is found, try to use user credentials from Redux state
      if (!token && currentUser) {
        if (currentUser._id) {
          // Attempt to update recipe without token, using current session
          const response = await fetch(`/api/recipe/update/${recipeId}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include", // Include cookies in the request
            body: JSON.stringify({ status: newStatus }),
          });

          if (response.ok) {
            // Update the local recipe list with the new status
            setRecipes((prevRecipes) =>
              prevRecipes.map((recipe) =>
                recipe._id === recipeId
                  ? { ...recipe, status: newStatus }
                  : recipe
              )
            );
            setSuccessMessage(
              `Recipe status updated to ${newStatus} successfully!`
            );

            // Also update the active recipe if it's the one being changed
            if (activeRecipe && activeRecipe._id === recipeId) {
              setActiveRecipe({ ...activeRecipe, status: newStatus });
            }

            setTimeout(() => setSuccessMessage(""), 3000); // Clear after 3 seconds
            return;
          }
        }
      }

      // If we have a token, use it
      if (token) {
        const response = await fetch(`/api/recipe/update/${recipeId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Failed to update recipe status"
          );
        }

        // Update the local recipe list with the new status
        setRecipes((prevRecipes) =>
          prevRecipes.map((recipe) =>
            recipe._id === recipeId ? { ...recipe, status: newStatus } : recipe
          )
        );

        // Also update the active recipe if it's the one being changed
        if (activeRecipe && activeRecipe._id === recipeId) {
          setActiveRecipe({ ...activeRecipe, status: newStatus });
        }

        setSuccessMessage(
          `Recipe status updated to ${newStatus} successfully!`
        );
        setTimeout(() => setSuccessMessage(""), 3000); // Clear after 3 seconds
      } else {
        // If we get here, no valid authentication was found
        setError("Session expired. Please log in again.");
        setTimeout(() => {
          navigate("/signin");
        }, 2000);
      }
    } catch (err) {
      setError(err.message);
      console.error("Error updating recipe status:", err);
    } finally {
      // Clear the changing status for this recipe
      setStatusChanging((prev) => ({ ...prev, [recipeId]: false }));
    }
  };

  if (loading)
    return (
      <div className="container mt-5 text-center">
        <h3>Loading...</h3>
      </div>
    );
  if (error)
    return (
      <div className="container mt-5 text-center">
        <h3>Error: {error}</h3>
      </div>
    );

  return (
    <main className="kh-cookshop-page kh-cookshop my-5">
      <section className="container">
        <div className="row">
          <div className="col-12 mb-4">
            <h1 className="text-center">Recipe Administration</h1>
            {successMessage && (
              <div className="alert alert-success text-center">
                {successMessage}
              </div>
            )}
          </div>
          <div className="col-12 col-md-6 col-lg-8">
            <div className="kh-cookshop__list">
              <ul className="kh-cookshop__list--items">
                {recipes.map((recipe) => (
                  <li
                    key={recipe._id}
                    className={`kh-cookshop__list--item ${
                      activeRecipe?._id === recipe._id ? "active" : ""
                    }`}
                    onClick={() => setActiveRecipe(recipe)}
                  >
                    <img
                      src={recipe.favImgUrl || "https://via.placeholder.com/50"}
                      alt={recipe.recipeName}
                      width="50"
                    />
                    <p>{recipe.recipeName}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="col-12 col-md-6 col-lg-4">
            {activeRecipe && (
              <div className="kh-cookshop__details">
                <div className="mb-4">
                  <img
                    src={
                      activeRecipe.favImgUrl ||
                      "https://via.placeholder.com/400x300"
                    }
                    alt={activeRecipe.recipeName}
                    className="w-full h-auto rounded-lg object-cover"
                  />
                </div>
                <h3>{activeRecipe.recipeName}</h3>

                <div className="mt-3 mb-3">
                  <p>
                    <strong>Chef:</strong> {activeRecipe.chefName || "Unknown"}
                  </p>
                  <p>
                    <strong>Created:</strong>{" "}
                    {new Date(activeRecipe.createdAt).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>ID:</strong> {activeRecipe._id}
                  </p>

                  <div className="mt-3">
                    <label className="mb-1">
                      <strong>Status:</strong>
                    </label>
                    <div className="position-relative">
                      <select
                        className="form-select mb-3"
                        value={activeRecipe.status || "PENDING"}
                        onChange={(e) =>
                          handleStatusChange(activeRecipe._id, e.target.value)
                        }
                        disabled={statusChanging[activeRecipe._id]}
                      >
                        <option value="DRAFT">DRAFT</option>
                        <option value="PENDING">PENDING</option>
                        <option value="PUBLISHED">PUBLISHED</option>
                        <option value="REJECTED">REJECTED</option>
                      </select>
                      {statusChanging[activeRecipe._id] && (
                        <div className="position-absolute top-0 end-0 bottom-0 start-0 d-flex align-items-center justify-content-center bg-light bg-opacity-75">
                          <div
                            className="spinner-border spinner-border-sm text-primary"
                            role="status"
                          >
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="mb-2">
                      {activeRecipe.description
                        ? activeRecipe.description.substring(0, 100) +
                          (activeRecipe.description.length > 100 ? "..." : "")
                        : "No description"}
                    </p>
                  </div>

                  <div className="d-flex gap-2 mt-4">
                    <a
                      href={`/recipes/${activeRecipe._id}`}
                      className="btn btn-primary"
                    >
                      View Recipe
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

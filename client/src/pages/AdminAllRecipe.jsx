import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function AdminAllRecipe() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusChanging, setStatusChanging] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
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
    <main className="container mt-4">
      <h1 className="text-center mb-4">Recipe Administration</h1>
      {successMessage && (
        <div className="alert alert-success text-center">{successMessage}</div>
      )}
      <div className="table-responsive">
        <table className="table table-hover">
          <thead className="thead-dark">
            <tr>
              <th>ID</th>
              <th>Recipe Name</th>
              <th>Chef</th>
              <th>Created Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {recipes.map((recipe) => (
              <tr key={recipe._id}>
                <td>{recipe._id.substring(0, 8)}...</td>
                <td>{recipe.recipeName}</td>
                <td>{recipe.chefName || "Unknown"}</td>
                <td>{new Date(recipe.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="position-relative">
                    <select
                      className="form-select"
                      value={recipe.status || "PENDING"}
                      onChange={(e) =>
                        handleStatusChange(recipe._id, e.target.value)
                      }
                      disabled={statusChanging[recipe._id]}
                    >
                      <option value="DRAFT">DRAFT</option>
                      <option value="PENDING">PENDING</option>
                      <option value="PUBLISHED">PUBLISHED</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                    {statusChanging[recipe._id] && (
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
                </td>
                <td>
                  <button
                    className="btn btn-primary btn-sm me-2"
                    onClick={() => navigate(`/recipes/${recipe._id}`)}
                  >
                    View
                  </button>
                  <button
                    className="btn btn-info btn-sm"
                    onClick={() => navigate(`/edit-recipe/${recipe._id}`)}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

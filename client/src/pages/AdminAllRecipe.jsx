import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function AdminAllRecipe() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
    } catch (err) {
      setError(err.message);
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
    <div className="container mt-4">
      <h1 className="text-center mb-4">Recipe Administration</h1>
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
    </div>
  );
}

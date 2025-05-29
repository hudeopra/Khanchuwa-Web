import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function UserRecipeFive({ recentRecipes, currentUser }) {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");
  const [deleteError, setDeleteError] = useState(null);
  const [recipeToDelete, setRecipeToDelete] = useState(null);

  const handleDeleteRecipe = async (recipeId) => {
    if (deleteConfirmInput !== "DELETE") {
      setDeleteError('Please type "DELETE" to confirm.');
      return;
    }
    try {
      const res = await fetch(`/api/recipe/delete/${recipeId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) {
        setDeleteError(data.message || "Deletion failed");
      } else {
        // Optionally, refresh the recipe list or update state
        window.location.reload();
      }
    } catch (err) {
      setDeleteError(err.message);
    }
  };

  return (
    <div className="kh-profile__posts row">
      <div className="col-12 ">
        <h3>My Recipes</h3>
        <Link to={`/user-recipe`} className="btn btn-edit">
          View All recipes
        </Link>
      </div>
      {recentRecipes.length > 0 ? (
        recentRecipes.map((recipe) => (
          <div className="col-6">
            <div key={recipe._id} className="kh-profile__post">
              <Link to={`/recipes/${recipe._id}`} className="">
                <div className="kh-profile__post-img">
                  <img
                    src={
                      Array.isArray(recipe.imageUrls) &&
                      recipe.imageUrls.length > 0
                        ? recipe.imageUrls[0]
                        : ""
                    }
                    alt={recipe.recipeName}
                    className="recipe-fav-image"
                  />
                </div>
                <div className="kh-profile__item--content">
                  <div className="kh-profile__item--details">
                    <h4>
                      {recipe.recipeName} <span>({recipe.recipeFav})</span>
                    </h4>
                  </div>
                </div>
                <span className="kh-profile__post--uptime">
                  {(() => {
                    const updatedAt = new Date(recipe.updatedAt);
                    const now = new Date();
                    const diffInSeconds = Math.floor((now - updatedAt) / 1000);

                    if (diffInSeconds < 60)
                      return `${diffInSeconds} second${
                        diffInSeconds !== 1 ? "s" : ""
                      } ago`;
                    const diffInMinutes = Math.floor(diffInSeconds / 60);
                    if (diffInMinutes < 60)
                      return `${diffInMinutes} minute${
                        diffInMinutes !== 1 ? "s" : ""
                      } ago`;
                    const diffInHours = Math.floor(diffInMinutes / 60);
                    if (diffInHours < 24)
                      return `${diffInHours} hour${
                        diffInHours !== 1 ? "s" : ""
                      } ago`;
                    const diffInDays = Math.floor(diffInHours / 24);
                    if (diffInDays < 7)
                      return `${diffInDays} day${
                        diffInDays !== 1 ? "s" : ""
                      } ago`;
                    const diffInWeeks = Math.floor(diffInDays / 7);
                    if (diffInWeeks < 4)
                      return `${diffInWeeks} week${
                        diffInWeeks !== 1 ? "s" : ""
                      } ago`;
                    const diffInMonths = Math.floor(diffInDays / 30);
                    if (diffInMonths < 12)
                      return `${diffInMonths} month${
                        diffInMonths !== 1 ? "s" : ""
                      } ago`;
                    const diffInYears = Math.floor(diffInMonths / 12);
                    return `${diffInYears} year${
                      diffInYears !== 1 ? "s" : ""
                    } ago`;
                  })()}
                </span>
              </Link>
              <Link
                to={`/recipes/edit/${recipe._id}`}
                className="kh-btn kh-btn--edit"
              >
                Edit
              </Link>
            </div>
          </div>
        ))
      ) : (
        <p>No recent recipes.</p>
      )}
    </div>
  );
}

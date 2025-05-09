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
    <div className="kh-profile__items">
      <Link to={`/user-recipe`} className="btn btn-edit">
        View All recipes
      </Link>
      {recentRecipes.length > 0 ? (
        recentRecipes.map((recipe) => (
          <div key={recipe._id} className="kh-profile__item-wrapper">
            <div className="kh-profile__item">
              <div className="kh-profile__item--img">
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
                <div className="kh-profile__item--content">
                  <div className="kh-profile__item--details">
                    <h3>{recipe.recipeName}</h3>

                    <div className="kh-profile__item--tags">
                      <div className="kh-profile__item--tag">
                        <ul>
                          {recipe.mealType.map((meal, index) => (
                            <li
                              className={`kh-bubble kh-bubble__mealtype ${
                                typeof meal === "string"
                                  ? meal.replace(/\s+/g, "-").toLowerCase()
                                  : meal.name
                                  ? meal.name.replace(/\s+/g, "-").toLowerCase()
                                  : "unknown"
                              }`}
                              key={index}
                            >
                              {typeof meal === "string"
                                ? meal
                                : meal.name || "Unknown"}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="kh-profile__item--tag">
                        <ul>
                          {recipe.mealCourse.map((course, index) => (
                            <li
                              className={`kh-bubble kh-bubble__mealcourse ${course
                                .replace(/\s+/g, "-")
                                .toLowerCase()}`}
                              key={index}
                            >
                              {course}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="kh-profile__item--tag">
                        <ul>
                          {recipe.cuisineTag.map((cuisine, index) => (
                            <li
                              className={`kh-bubble kh-bubble__cuisine ${cuisine.tagName
                                .replace(/\s+/g, "-")
                                .toLowerCase()}`}
                              key={index}
                            >
                              {cuisine.tagName}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="kh-profile__item--tag">
                        <ul>
                          {recipe.flavourTag.map((flavour, index) => (
                            <li
                              className={`kh-bubble kh-bubble__flavour ${flavour.tagName
                                .replace(/\s+/g, "-")
                                .toLowerCase()}`}
                              key={index}
                            >
                              {flavour.tagName}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="kh-profile__item--tag">
                        <ul>
                          {recipe.ingredients.map((ingredient) => (
                            <li
                              className={`kh-bubble kh-bubble__mealtype ${
                                ingredient.name
                                  ? ingredient.name
                                      .replace(/\s+/g, "-")
                                      .toLowerCase()
                                  : "unknown"
                              }`}
                              key={ingredient._id}
                            >
                              {ingredient.name || "Unknown"}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="kh-profile__item--btns">
                    <Link
                      to={`/recipe/edit/${recipe._id}`}
                      className="kh-btn kh-btn__x"
                    >
                      e
                    </Link>
                    <button
                      onClick={() => {
                        setShowDeleteConfirmation(true);
                        setRecipeToDelete(recipe._id);
                      }}
                      className="kh-btn kh-btn__x"
                    >
                      x
                    </button>
                  </div>
                </div>
              </div>
              {/* Delete confirmation modal */}
              {showDeleteConfirmation && recipeToDelete === recipe._id && (
                <div className="delete-confirmation-modal">
                  <h3>Confirm Deletion</h3>
                  <p>Type "DELETE" to permanently remove this recipe.</p>
                  <input
                    type="text"
                    value={deleteConfirmInput}
                    onChange={(e) => setDeleteConfirmInput(e.target.value)}
                    className="delete-confirmation-input"
                  />
                  {deleteError && (
                    <p className="delete-error-message">{deleteError}</p>
                  )}
                  <div className="delete-confirmation-actions">
                    <button
                      onClick={() => handleDeleteRecipe(recipe._id)}
                      className="btn btn-confirm"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => {
                        setShowDeleteConfirmation(false);
                        setDeleteError(null);
                        setDeleteConfirmInput("");
                        setRecipeToDelete(null);
                      }}
                      className="btn btn-cancel"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              <span className="kh-profile__item--uptime">
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
            </div>
          </div>
        ))
      ) : (
        <p>No recent recipes.</p>
      )}
    </div>
  );
}

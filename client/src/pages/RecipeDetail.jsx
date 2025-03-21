import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

// Helper to format minutes into hr and min string
const formatTime = (minutes) => {
  const hr = Math.floor(minutes / 60);
  const min = minutes % 60;
  return hr > 0 ? `${hr}hr ${min}min` : `${min}min`;
};

// Define backup URLs at the top (or inline):
const backupBannerUrl =
  "https://www.gstatic.com/mobilesdk/240923_mobilesdk/CloudFirestore-Discovery.png";
const backupFavUrl =
  "https://www.gstatic.com/mobilesdk/230503_mobilesdk/app_check_-_darkmode.png";

export default function RecipeDetail() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userData = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [commentRating, setCommentRating] = useState("");
  const [commentText, setCommentText] = useState("");
  const [commentError, setCommentError] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");
  const [deleteError, setDeleteError] = useState(null);

  // NEW: state for favorite checkbox
  const [isFav, setIsFav] = useState(false);

  const dispatch = useDispatch();

  console.log("User data:", userData);
  if (userData.currentUser) {
    console.log(
      "Current user details:",
      userData.currentUser.user.userFavRecipe
    );
  }

  useEffect(() => {
    console.log("Fetching recipe with ID:", id);
    const fetchRecipe = async () => {
      try {
        const res = await fetch(`/api/recipe/${id}`);
        const contentType = res.headers.get("content-type");
        let data;
        if (contentType && contentType.includes("application/json")) {
          data = await res.json();
        } else {
          const text = await res.text();
          throw new Error(text);
        }
        console.log("API response:", data);
        if (res.ok) {
          setRecipe(data);
          if (userData.currentUser && userData.currentUser.userFavRecipe) {
            setIsFav(
              userData.currentUser.userFavRecipe.some(
                (favId) => String(favId) === String(data._id)
              )
            );
          }
        } else {
          setError(data.message || "Unexpected error");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [id, userData]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/recipe/comment/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userData.currentUser._id,
          rating: commentRating,
          comment: commentText,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCommentError(data.message || "Failed to add comment");
      } else {
        // Update local recipe reviews with the new review
        setRecipe({ ...recipe, reviews: data.reviews });
        setCommentRating("");
        setCommentText("");
        setCommentError(null);
      }
    } catch (err) {
      setCommentError(err.message);
    }
  };

  const handleDeleteRecipe = async (e) => {
    e.preventDefault();
    if (deleteConfirmInput !== "DELETE") {
      setDeleteError('Please type "DELETE" to confirm.');
      return;
    }
    try {
      const res = await fetch(`/api/recipe/delete/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) {
        setDeleteError(data.message || "Deletion failed");
      } else {
        // Redirect after deletion
        navigate("/recipes");
      }
    } catch (err) {
      setDeleteError(err.message);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  // console.log("User state:", userData);

  // console.log(
  //   "Current User ID:",
  //   userData.currentUser.user._id,
  //   typeof userData.currentUser.user._id
  // );
  // console.log("Recipe User Ref:", recipe.userRef, typeof recipe.userRef);
  const currentUserId =
    userData.currentUser?._id || userData.currentUser?.user?._id;
  // Filter out null values and ensure recipeViews is an array of strings
  const viewedIds =
    recipe && Array.isArray(recipe.recipeViews)
      ? recipe.recipeViews.filter((v) => v) // remove null/undefined
      : [];
  const hasViewed = currentUserId ? viewedIds.includes(currentUserId) : false;
  const mainClass = hasViewed
    ? "kh-recipe-single"
    : "kh-recipe-single hasnot-viewed";
  return (
    <main className={mainClass}>
      <div className="container py-5">
        <div className="row">
          <div className="col-12">
            <div className="kh-recipe-single__head">
              <h1 className="mb-2">{recipe.recipeName || "N/A"}</h1>
              <div className="kh-recipe-single__head--banner">
                <img
                  src={recipe.bannerImgUrl || backupBannerUrl}
                  alt="Banner"
                  className=" kh-recipe-single__banner rounded-lg "
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = backupBannerUrl;
                  }}
                />
                <div className="kh-recipe-single__head--info-wrapper">
                  <div className="kh-recipe-single__head--info">
                    <span>Prep:</span>{" "}
                    {recipe.prepTime ? formatTime(recipe.prepTime) : "N/A"}
                  </div>
                  <div className="kh-recipe-single__head--info">
                    <span>Cook:</span>{" "}
                    {recipe.cookTime ? formatTime(recipe.cookTime) : "N/A"}
                  </div>
                  <div className="kh-recipe-single__head--info">
                    <span>Servings:</span> {recipe.servings || "N/A"}
                  </div>
                  <div className="kh-recipe-single__head--info">
                    <span>Difficulty:</span> {recipe.difficulty || "N/A"}
                  </div>
                  <div className="kh-recipe-single__head--info">
                    <span>Diet:</span> {recipe.diet || "N/A"}
                  </div>
                  <div className="kh-recipe-single__head--info">
                    <div className="my-4">
                      <label>
                        <input
                          type="checkbox" // Changed from "radio" to "checkbox"
                        />
                        Add to Wishlist
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="kh-recipe-single__head--title">
                <p>
                  <strong>By:</strong> {recipe.chefName || "N/A"}
                </p>
              </div>
            </div>
          </div>
          <div className="col-4">
            <div className="kh-recipe-single__ingredient-list">
              <strong>Ingredients:</strong>{" "}
              {recipe.ingredients && recipe.ingredients.length > 0 ? (
                <ul>
                  {recipe.ingredients.map((ing, idx) => (
                    <li key={idx}>
                      <input type="checkbox" id={`ingredient-${idx}`} />
                      <label htmlFor={`ingredient-${idx}`}>
                        <span>{ing.name}: </span> {ing.quantity}
                      </label>
                    </li>
                  ))}
                </ul>
              ) : (
                "N/A"
              )}
            </div>
            <div className="kh-recipe-single__tags">
              <h4>Cuisine:</h4>
              <ul className="kh-recipe-single__tags--list">
                {recipe.cuisineTag && recipe.cuisineTag.length > 0 ? (
                  recipe.cuisineTag.map((tag) => (
                    <li
                      className="kh-recipe-single__tags--item"
                      key={typeof tag === "object" ? tag._id : tag}
                    >
                      {typeof tag === "object" ? tag.name : tag}
                    </li>
                  ))
                ) : (
                  <li>N/A</li>
                )}
              </ul>
            </div>
            <div className="kh-recipe-single__tags">
              <h4>Flavour Tags:</h4>
              <ul className="kh-recipe-single__tags--list">
                {recipe.flavourTag && recipe.flavourTag.length > 0 ? (
                  recipe.flavourTag.map((tag) => (
                    <li
                      className="kh-recipe-single__tags--item"
                      key={typeof tag === "object" ? tag._id : tag}
                    >
                      {typeof tag === "object" ? tag.name : tag}
                    </li>
                  ))
                ) : (
                  <li>N/A</li>
                )}
              </ul>
            </div>
            <div className="kh-recipe-single__tags">
              <h4>Ingredient Tags:</h4>
              <ul className="kh-recipe-single__tags--list">
                {recipe.ingredientTag && recipe.ingredientTag.length > 0 ? (
                  recipe.ingredientTag.map((tag) => (
                    <li
                      className="kh-recipe-single__tags--item"
                      key={typeof tag === "object" ? tag._id : tag}
                    >
                      {typeof tag === "object" ? tag.name : tag}
                    </li>
                  ))
                ) : (
                  <li>N/A</li>
                )}
              </ul>
            </div>
          </div>
          <div className="col-8">
            <div className="kh-recipe-single__content">
              <p className="text-lg">{recipe.description || "N/A"}</p>
              <div className="kh-recipe-single__content--nutritional">
                <p>
                  <strong>Nutritional Info:</strong>
                </p>
                {recipe.nutritionalInfo &&
                Array.isArray(recipe.nutritionalInfo) &&
                recipe.nutritionalInfo.length > 0 ? (
                  <ul className="list-disc ml-6">
                    {recipe.nutritionalInfo.map((item, idx) => (
                      <li key={idx}>
                        <span className="font-semibold">{item.name}:</span>{" "}
                        {item.value}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>N/A</p>
                )}
              </div>
              <div>
                <strong>Prep Instructions:</strong>
                {Array.isArray(recipe.prepInstructions) ? (
                  <ul>
                    {recipe.prepInstructions.map((note, idx) => (
                      <li key={idx}>{note}</li>
                    ))}
                  </ul>
                ) : (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: recipe.prepInstructions,
                    }}
                  />
                )}
              </div>
              <div>
                <strong>Cook Instructions:</strong>
                {Array.isArray(recipe.cookInstructions) ? (
                  <ol>
                    {recipe.cookInstructions.map((instruction, idx) => (
                      <li key={idx}>{instruction}</li>
                    ))}
                  </ol>
                ) : (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: recipe.cookInstructions,
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <p>
        <strong>Short Description:</strong> {recipe.shortDescription || "N/A"}
      </p> */}

      <p></p>

      <p>
        <strong>Rating:</strong> {recipe.rating || "N/A"}
      </p>
      <p>
        <strong>User Reference:</strong> {recipe.userRef || "N/A"}
      </p>
      <div>
        <strong>Favourite Image:</strong>
        <img
          src={recipe.favImgUrl || backupFavUrl}
          alt="Favourite"
          className="w-64 h-auto rounded-lg my-2"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = backupFavUrl;
          }}
        />
      </div>
      <div>
        <strong>Images:</strong>{" "}
        {recipe.imageUrls && recipe.imageUrls.length > 0 ? (
          <div className="flex gap-4">
            {recipe.imageUrls.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`Recipe image ${index + 1}`}
                className="w-32 h-32 object-cover rounded-lg"
              />
            ))}
          </div>
        ) : (
          "N/A"
        )}
      </div>
      <div>
        <strong>Video:</strong>{" "}
        {recipe.videoUrl ? (
          <iframe
            width="640"
            height="360"
            src={recipe.videoUrl.replace("watch?v=", "embed/")}
            frameBorder="0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        ) : (
          "N/A"
        )}
      </div>
      {/* Reviews Section */}
      <div className="my-4">
        <h2 className="text-2xl font-semibold">Comments</h2>
        {recipe.reviews && recipe.reviews.length > 0 ? (
          recipe.reviews.map((rev, idx) => (
            <div key={idx} className="border p-2 my-2">
              <p>
                <strong>Rating:</strong> {rev.rating}
              </p>
              <p>{rev.comment}</p>
            </div>
          ))
        ) : (
          <p>No comments yet.</p>
        )}
      </div>
      {userData.currentUser && (
        <form onSubmit={handleCommentSubmit} className="border p-4 my-4">
          <h3 className="text-xl font-semibold">Add a Comment</h3>
          <label htmlFor="commentRating">Rating:</label>
          <input
            type="number"
            id="commentRating"
            value={commentRating}
            onChange={(e) => setCommentRating(e.target.value)}
            className="border p-2 my-2 block"
            required
          />
          <label htmlFor="commentText">Comment:</label>
          <textarea
            id="commentText"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="border p-2 my-2 block"
            required
          />
          {commentError && (
            <p className="text-red-700 text-sm">{commentError}</p>
          )}
          <button
            type="submit"
            className="p-3 bg-blue-600 text-white rounded-lg hover:opacity-90"
          >
            Submit Comment
          </button>
        </form>
      )}
      {currentUserId && recipe.userRef === currentUserId && (
        <div className="my-4">
          <button
            onClick={() => navigate(`/recipes/edit/${id}`)}
            className="p-3 bg-blue-600 text-white rounded-lg hover:opacity-90"
          >
            Edit Recipe
          </button>
        </div>
      )}
      {currentUserId && recipe.userRef === currentUserId && (
        <div className="my-4">
          <button
            onClick={() => setShowDeleteConfirmation(true)}
            className="p-3 bg-red-600 text-white rounded-lg hover:opacity-90"
          >
            Delete Recipe
          </button>
        </div>
      )}
      {showDeleteConfirmation && (
        <form onSubmit={handleDeleteRecipe} className="border p-4 my-4">
          <h3 className="text-xl font-semibold">Confirm Deletion</h3>
          <p>Type "DELETE" to permanently remove this recipe.</p>
          <input
            type="text"
            value={deleteConfirmInput}
            onChange={(e) => setDeleteConfirmInput(e.target.value)}
            className="border p-2 my-2 block"
            required
          />
          {deleteError && <p className="text-red-700 text-sm">{deleteError}</p>}
          <div className="flex gap-4">
            <button
              type="submit"
              className="p-3 bg-red-600 text-white rounded-lg hover:opacity-90"
            >
              Confirm Delete
            </button>
            <button
              type="button"
              onClick={() => {
                setShowDeleteConfirmation(false);
                setDeleteError(null);
                setDeleteConfirmInput("");
              }}
              className="p-3 bg-gray-400 text-white rounded-lg hover:opacity-90"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </main>
  );
}

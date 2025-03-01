import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

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
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [commentRating, setCommentRating] = useState("");
  const [commentText, setCommentText] = useState("");
  const [commentError, setCommentError] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    console.log("Fetching recipe with ID:", id); // Log the ID

    const fetchRecipe = async () => {
      try {
        const res = await fetch(`/api/recipe/${id}`);
        const data = await res.json();
        console.log("API response:", data); // Log the API response

        if (res.ok) {
          setRecipe(data);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/recipe/comment/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser._id,
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

  return (
    <main className="p-3 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">
        {recipe.recipeName || "N/A"}
      </h1>
      <p className="text-lg">{recipe.description || "N/A"}</p>
      <p>
        <strong>Short Description:</strong> {recipe.shortDescription || "N/A"}
      </p>
      <p>
        <strong>Nutritional Info:</strong>
        {recipe.nutritionalInfo &&
        Array.isArray(recipe.nutritionalInfo) &&
        recipe.nutritionalInfo.length > 0 ? (
          <ul className="list-disc ml-6">
            {recipe.nutritionalInfo.map((item, idx) => (
              <li key={idx}>
                <span className="font-semibold">{item.name}:</span> {item.value}
              </li>
            ))}
          </ul>
        ) : (
          "N/A"
        )}
      </p>
      <div>
        <strong>Cook Instructions:</strong>
        <ol>
          {recipe.cookInstructions &&
            recipe.cookInstructions.map((instruction, idx) => (
              <li key={idx}>{instruction}</li>
            ))}
        </ol>
      </div>
      <div>
        <strong>Prep Instructions:</strong>
        <ul>
          {recipe.prepInstructions &&
            recipe.prepInstructions.map((note, idx) => (
              <li key={idx}>{note}</li>
            ))}
        </ul>
      </div>
      <p>
        <strong>Diet:</strong> {recipe.diet || "N/A"}
      </p>
      <p>
        <strong>Ingredients:</strong>{" "}
        {recipe.ingredients && recipe.ingredients.length > 0
          ? recipe.ingredients.map((ing, idx) => (
              <span key={idx}>
                {ing.quantity} {ing.name}
                {idx !== recipe.ingredients.length - 1 ? ", " : ""}
              </span>
            ))
          : "N/A"}
      </p>
      <p>
        <strong>Prep Time:</strong>{" "}
        {recipe.prepTime ? formatTime(recipe.prepTime) : "N/A"}
      </p>
      <p>
        <strong>Cook Time:</strong>{" "}
        {recipe.cookTime ? formatTime(recipe.cookTime) : "N/A"}
      </p>
      <p>
        <strong>Servings:</strong> {recipe.servings || "N/A"}
      </p>
      <p>
        <strong>Difficulty:</strong> {recipe.difficulty || "N/A"}
      </p>
      <p>
        <strong>Chef:</strong> {recipe.chefName || "N/A"}
      </p>
      <p>
        <strong>Cuisine:</strong>{" "}
        {recipe.cuisines && recipe.cuisines.length > 0
          ? recipe.cuisines.join(", ")
          : "N/A"}
      </p>
      <p>
        <strong>Flavour Tags:</strong>{" "}
        {recipe.flavourTags && recipe.flavourTags.length > 0
          ? recipe.flavourTags.join(", ")
          : "N/A"}
      </p>
      <p>
        <strong>Tags:</strong>{" "}
        {recipe.tags && recipe.tags.length > 0 ? recipe.tags.join(", ") : "N/A"}
      </p>
      <p>
        <strong>Rating:</strong> {recipe.rating || "N/A"}
      </p>
      <p>
        <strong>User Reference:</strong> {recipe.userRef || "N/A"}
      </p>
      <div>
        <strong>Banner Image:</strong>
        <img
          src={recipe.bannerImgUrl || backupBannerUrl}
          alt="Banner"
          className="w-64 h-auto rounded-lg my-2"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = backupBannerUrl;
          }}
        />
      </div>
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
          <video controls className="w-64 h-64">
            <source src={recipe.videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
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
      {currentUser && (
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
      {currentUser && recipe.userRef === currentUser._id && (
        <div className="my-4">
          <button
            onClick={() => navigate(`/recipes/edit/${id}`)}
            className="p-3 bg-blue-600 text-white rounded-lg hover:opacity-90"
          >
            Edit Recipe
          </button>
        </div>
      )}
      {currentUser && recipe.userRef === currentUser._id && (
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

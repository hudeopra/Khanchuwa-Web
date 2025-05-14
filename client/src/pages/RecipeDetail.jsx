import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useAlert } from "../components/AlertContext"; // Import AlertContext
import SliderSyncing from "../components/SliderSyncing";
import ToggleFavorite from "../components/ToggleFavorite";
import TagList from "../components/RecipeTags";
import ConfirmDelete from "../components/ConfirmDelete";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

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
  const [currentUser, setCurrentUser] = useState(null); // State for current user
  const [isFavorite, setIsFavorite] = useState(false); // State for favorite toggle

  const dispatch = useDispatch();
  const { showAlert } = useAlert(); // Use AlertContext

  const sliderForRef = useRef(null);
  const sliderNavRef = useRef(null);

  console.log("User data:", userData);
  if (userData.currentUser) {
  }

  const sliderForSettings = {
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    fade: true,
    asNavFor: sliderNavRef.current,
  };

  const sliderNavSettings = {
    slidesToShow: 3,
    slidesToScroll: 1,
    asNavFor: sliderForRef.current,
    dots: true,
    centerMode: true,
    focusOnSelect: true,
  };

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
        console.log("Current user data:", data); // Debugging log
        setCurrentUser(data);
        dispatch({
          type: "user/updateUserSuccess",
          payload: data, // Update Redux with the new user data
        });
      } catch (error) {
        console.error("Error fetching current user:", error.message);
      }
    };

    fetchCurrentUser(); // Fetch current user on reload
  }, [dispatch]);

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
        console.log("API response:", data); // Debugging log
        if (res.ok) {
          setRecipe(data);
        } else if (res.status === 404) {
          navigate("/recipes"); // Redirect to /recipes if not found
        } else {
          setError(data.message || "Unexpected error");
        }
      } catch (err) {
        console.error("Error fetching recipe:", err); // Debugging log
        if (err.message.includes("404")) {
          navigate("/recipes"); // Redirect to /recipes if not found
        } else {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [id, userData]);

  useEffect(() => {
    // Check if the current recipe is in the user's favorite list
    const isFav = userData.currentUser?.userFavRecipe?.includes(id);
    setIsFavorite(isFav || false);
  }, [userData, id]);

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

  return (
    <main>
      <div className="container py-5">
        <div className="row">
          <div className="col-12">
            <div className="kh-recipe-single__head">
              <div className="kh-recipe-single__head--title">
                <h1>{recipe.recipeName || "N/A"}</h1>
                <div className="kh-recipe-single__head--actions">
                  {currentUserId && recipe.userRef === currentUserId && (
                    <div className="py-4">
                      <button
                        onClick={() => navigate(`/recipes/edit/${id}`)}
                        className="p-3 bg-blue-600 text-white rounded-lg hover:opacity-90"
                      >
                        Edit Recipe
                      </button>
                    </div>
                  )}
                  {currentUserId && recipe.userRef === currentUserId && (
                    <div className="py-4">
                      <button
                        onClick={() => setShowDeleteConfirmation(true)}
                        className="p-3 bg-red-600 text-white rounded-lg hover:opacity-90"
                      >
                        Delete Recipe
                      </button>
                    </div>
                  )}
                  <div className="kh-video py-4">
                    <div className="kh-video__item">
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
                      <button
                        onClick={() => {
                          const videoWrapper =
                            document.querySelector(".kh-video");
                          const overlay = document.querySelector(
                            ".kh-header__overlay"
                          );
                          if (videoWrapper) {
                            videoWrapper.classList.remove("active");
                          }
                          if (overlay) {
                            overlay.classList.remove("active");
                          }
                        }}
                        className="kh-video__close"
                        aria-label="Close Video"
                      >
                        Close Video
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        const videoWrapper =
                          document.querySelector(".kh-video");
                        const overlay = document.querySelector(
                          ".kh-header__overlay"
                        );
                        if (videoWrapper) {
                          videoWrapper.classList.toggle("active");
                        }
                        if (overlay) {
                          overlay.classList.add("active");
                        }
                      }}
                      className="kh-video__toggle p-3 bg-red-600 text-white rounded-lg hover:opacity-90"
                      aria-label="Toggle Video"
                    >
                      Toggle Video
                    </button>
                  </div>
                </div>
              </div>
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

                <div className="kh-recipe-single__head--fav-img d-none">
                  <img
                    src={recipe.favImgUrl || backupFavUrl}
                    alt="Favourite"
                    className=" "
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = backupFavUrl;
                    }}
                  />
                </div>
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
                    <span>fav count:</span> {recipe.recipeFav ?? "N/A"}
                  </div>
                  <ToggleFavorite recipeId={id} />
                </div>
              </div>
              <div className="kh-recipe-single__head--author">
                <p>@{recipe.chefName || "N/A"}</p>
              </div>
            </div>
          </div>
          <div className="col-4">
            <div className="kh-recipe-single__ingredient-list">
              <h5>Ingredients:</h5>{" "}
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
            <TagList
              tags={recipe.cuisineTag}
              tagType="cuisineTag"
              title="Cuisine"
            />
            <TagList
              tags={recipe.flavourTag}
              tagType="flavourTag"
              title="Flavour Tags"
            />
            <TagList
              tags={recipe.ingredientTag}
              tagType="ingredientTag"
              title="Ingredient Tags"
            />
            {recipe.imageUrls && recipe.imageUrls.length > 0 ? (
              <SliderSyncing imageUrls={recipe.imageUrls} />
            ) : (
              "N/A"
            )}
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
                    className="kh-recipe-single__content--steps"
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
                    className="kh-recipe-single__content--steps"
                    dangerouslySetInnerHTML={{
                      __html: recipe.cookInstructions,
                    }}
                  />
                )}
              </div>

              <p className="text-lg">{recipe.mealType || "N/A"}</p>
              <p className="text-lg">{recipe.mealCourse || "N/A"}</p>
              <p className="text-lg">{recipe.cookingMethod || "N/A"}</p>
              <p className="text-lg">{recipe.allergies || "N/A"}</p>
              <p className="text-lg">{recipe.dietaryRestrictions || "N/A"}</p>
            </div>
          </div>
        </div>
      </div>
      {/* <p>
        <strong>Short Description:</strong> {recipe.shortDescription || "N/A"}
      </p> 
      <p>
        <strong>Rating:</strong> {recipe.rating || "N/A"}
      </p>
      <p>
        <strong>User Reference:</strong> {recipe.userRef || "N/A"}
      </p>*/}
      <div className="container"></div>
      {/* Reviews Section */}
      <div className="py-4">
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
        <form onSubmit={handleCommentSubmit} className="border p-4 py-4">
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
            className="p-3 text-white rounded-lg hover:opacity-90"
          >
            Submit Comment
          </button>
        </form>
      )}
      {showDeleteConfirmation && (
        <ConfirmDelete
          deleteType="recipe"
          deleteId={id}
          deleteApi="/api/recipe/delete"
          redirectPath="/recipes"
        />
      )}
    </main>
  );
}

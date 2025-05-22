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
  const [isCreator, setIsCreator] = useState(false); // State for creator check
  const [isAdmin, setIsAdmin] = useState(false); // State for admin check

  const dispatch = useDispatch();
  const { showAlert } = useAlert(); // Use AlertContext

  const sliderForRef = useRef(null);
  const sliderNavRef = useRef(null);

  // console.log("User data:", userData);
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

  // Fetch recipe data when component mounts or ID changes
  useEffect(() => {
    const fetchRecipeData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Step 1: Check if this is the recipe creator or an admin
        // First, try to get the current user
        let userData = null;
        try {
          const userRes = await fetch("/api/user/current", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
            credentials: "include",
            // Add timeout to prevent hanging requests
            signal: AbortSignal.timeout(5000),
          });

          if (userRes.ok) {
            userData = await userRes.json();
          }
        } catch (userError) {
          // Silently handle user fetch errors without showing in console
          console.log("Not logged in or session expired");
        }

        const isAdmin = userData?.role === "admin";
        let isCreator = false;

        // If no user is logged in or there was an error, use the public endpoint
        let recipeEndpoint = `/api/recipe/published/${id}`;

        // If admin or trying to check if user is creator, we need the recipe ID first
        if (isAdmin || userData) {
          try {
            // Get basic recipe info first to check ownership
            const basicRecipeRes = await fetch(`/api/recipe/${id}`, {
              credentials: "include",
              // Add timeout to prevent hanging requests
              signal: AbortSignal.timeout(5000),
            });

            if (basicRecipeRes.ok) {
              const basicRecipeData = await basicRecipeRes.json();
              // Check if current user is the creator
              isCreator =
                userData &&
                (basicRecipeData.userRef === userData._id ||
                  basicRecipeData.userRef === userData?.user?._id);

              // If admin or creator, they can access the recipe directly
              if (isAdmin || isCreator) {
                recipeEndpoint = `/api/recipe/${id}`;
              }
            }
          } catch (recipeError) {
            // Silently handle basic recipe fetch errors
            if (recipeError.name !== "AbortError") {
              console.log("Couldn't verify recipe ownership");
            }
          }
        }

        // Fetch the recipe data from the appropriate endpoint
        try {
          const res = await fetch(recipeEndpoint, {
            credentials: "include",
            mode: "cors", // Add CORS mode to help suppress browser errors
            // Add timeout to prevent hanging requests
            signal: AbortSignal.timeout(8000),
          });

          if (!res.ok) {
            if (res.status === 404) {
              setError("Recipe not found or not yet published");
              console.log("Recipe not found or not yet published");
            } else {
              const errorText = await res.text();
              let errorMessage;
              try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.message || "Failed to fetch recipe";
              } catch (e) {
                errorMessage = "Failed to fetch recipe";
              }
              setError(errorMessage);
            }
            setLoading(false);
            return;
          }

          const data = await res.json();
          setRecipe(data);

          // Store the permission flags for UI display
          setIsCreator(isCreator);
          setIsAdmin(isAdmin);
        } catch (fetchError) {
          if (fetchError.name !== "AbortError") {
            setError("Error loading recipe details. Please try again later.");
            console.log("Error fetching recipe details:", fetchError.message);
          } else {
            setError("Request timed out. Please try again.");
          }
        }
      } catch (error) {
        setError("Something went wrong. Please try again later.");
        console.log("General error in recipe fetch process");
      } finally {
        setLoading(false);
      }
    };

    fetchRecipeData();
  }, [id]);

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
                {/* Add status banner for unpublished recipes */}
                {recipe.status !== "PUBLISHED" && (
                  <div
                    className={`alert alert-${
                      recipe.status === "PENDING" ? "warning" : "secondary"
                    } mt-2`}
                  >
                    <strong>Notice:</strong> This recipe is currently in{" "}
                    <strong>{recipe.status.toLowerCase()}</strong> status
                    {(isCreator || isAdmin) && " and is only visible to you."}
                    {isAdmin && (
                      <div className="mt-2">
                        <select
                          className="form-select form-select-sm d-inline-block w-auto me-2"
                          value={recipe.status}
                          onChange={async (e) => {
                            try {
                              const newStatus = e.target.value;
                              const token =
                                localStorage.getItem("access_token");
                              const res = await fetch(
                                `/api/recipe/update/${id}`,
                                {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${token}`,
                                  },
                                  credentials: "include",
                                  body: JSON.stringify({ status: newStatus }),
                                }
                              );

                              if (res.ok) {
                                setRecipe({ ...recipe, status: newStatus });
                                showAlert(
                                  "success",
                                  `Recipe status changed to ${newStatus}`
                                );
                              } else {
                                showAlert(
                                  "error",
                                  "Failed to update recipe status"
                                );
                              }
                            } catch (err) {
                              console.error(err);
                              showAlert(
                                "error",
                                "Error updating recipe status"
                              );
                            }
                          }}
                        >
                          <option value="DRAFT">DRAFT</option>
                          <option value="PENDING">PENDING</option>
                          <option value="PUBLISHED">PUBLISHED</option>
                          <option value="REJECTED">REJECTED</option>
                        </select>
                        <span className="text-muted">Admin: Change status</span>
                      </div>
                    )}
                  </div>
                )}
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
      </p>*/}      <div className="container">
        <div className="py-6">
          <h2 className="text-2xl font-semibold mb-4">Comments ({recipe.reviews ? recipe.reviews.length : 0})</h2>
          {recipe.reviews && recipe.reviews.length > 0 ? (
            recipe.reviews.map((rev, idx) => (
              <div key={idx} className="border rounded-lg p-4 my-3 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center mb-2">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < rev.rating ? "text-yellow-400" : "text-gray-300"}>★</span>
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">({rev.rating}/5)</span>
                </div>
                <p className="text-gray-800">{rev.comment}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 italic">No comments yet. Be the first to share your thoughts!</p>
          )}
        </div>        {userData.currentUser && (
          <form onSubmit={handleCommentSubmit} className="border rounded-lg p-6 my-6 shadow-sm bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">Share Your Thoughts</h3>
            <div className="mb-4">
              <label htmlFor="commentRating" className="block text-sm font-medium text-gray-700 mb-1">Your Rating:</label>
              <select
                id="commentRating"
                value={commentRating}
                onChange={(e) => setCommentRating(e.target.value)}
                required
                className="border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Rating</option>
                <option value="1">1 - Poor</option>
                <option value="2">2 - Fair</option>
                <option value="3">3 - Good</option>
                <option value="4">4 - Very Good</option>
                <option value="5">5 - Excellent</option>
              </select>
            </div>
            <div className="mb-4">
              <label htmlFor="commentText" className="block text-sm font-medium text-gray-700 mb-1">Your Comment:</label>
              <textarea
                id="commentText"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                required
                placeholder="Share your thoughts about this recipe..."
                className="border rounded-md p-3 w-full h-28 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {commentError && (
              <p className="text-red-700 text-sm mb-3">{commentError}</p>
            )}
            <button
              type="submit"
              className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
            >
              <span>Submit Comment</span>
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
      </div>
      {/* Reviews Section */}
    </main>
  );
}

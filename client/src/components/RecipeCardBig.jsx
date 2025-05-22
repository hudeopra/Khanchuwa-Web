import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as images from "../assets/js/images.js";
import { sortByPropertyDesc } from "../utilities/SortItems";
import ToggleFavorite from "./ToggleFavorite";

const RecipeCardBig = () => {
  const [recipes, setRecipes] = useState([]);
  const [sortedRecipes, setSortedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch recipes from DB - now using published endpoint with improved error handling
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const res = await fetch("/api/recipe/published", {
          mode: "cors",
          signal: AbortSignal.timeout(8000), // 8-second timeout to prevent hanging requests
        });

        if (!res.ok) {
          console.log("No published recipes available. Status:", res.status);
          setRecipes([]);
          setSortedRecipes([]);
          setLoading(false);
          return;
        }
        const data = await res.json();
        // Handle the API response structure which contains a 'recipes' property
        const dataArr = data.recipes ? data.recipes : [];
        console.log("Recipes fetched:", dataArr.length);
        setRecipes(dataArr);
        setSortedRecipes(sortByPropertyDesc(dataArr, "recipeFav"));
      } catch (error) {
        // Only log actual errors, not aborted requests
        if (error.name !== "AbortError") {
          console.log("Couldn't load recipes, will try again later");
        }

        // Don't show errors to the user, just set empty arrays
        setRecipes([]);
        setSortedRecipes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  if (loading) return <p>Loading...</p>; // Debug information and show a more user-friendly message instead of an error
  if (sortedRecipes.length === 0) {
    console.log("No recipes to display, sortedRecipes array is empty");
    return <p>No recipes available yet. Check back soon!</p>;
  }

  // Get top 11 recipes
  const displayedCards = sortedRecipes.slice(0, 7);
  // Split data into horizontal and vertical cards
  const horizontalCards = displayedCards.slice(0, 3);
  const verticalCards = displayedCards.slice(3);

  return (
    <div className="kh-recipe-block__wrapper">
      {/* Render horizontal cards */}
      {horizontalCards.map((item, index) => (
        <div key={item._id || index} className="kh-recipe-block__item">
          <ToggleFavorite recipeId={item._id} />
          <Link
            to={`/recipes/${item._id}`}
            className=" kh-recipe__item--horizontal"
          >
            <div className="kh-recipe-block__item--img">
              <img
                // Use favImgUrl from DB if available, otherwise fallback to images asset
                src={
                  item.favImgUrl
                    ? item.favImgUrl
                    : images[`recipe${item.recipeName.replace(/ /g, "")}Thumb`]
                }
                alt={item.recipeName}
              />
            </div>
            <div className="kh-recipe-block__content">
              <h3>{item.recipeName}</h3>
              <p>
                {item.description.length > 150
                  ? `${item.description.slice(0, 60)}...`
                  : item.description}
              </p>{" "}
            </div>
            <div className="kh-recipe-block__info">
              <span>{item.cookTime} </span>
              <span>{item.servings} </span>
              <span>{item.difficulty} </span>
              <span>{item.recipeFav} </span>
            </div>
          </Link>
        </div>
      ))}

      {/* Render vertical cards */}

      {verticalCards.map((item, index) => (
        <div key={item._id || index} className="kh-recipe-block__item">
          <ToggleFavorite recipeId={item._id} />
          <Link to={`/recipes/${item._id}`} className="">
            <div className="kh-recipe-block__item--img">
              <img
                src={
                  item.imageUrls && item.imageUrls.length > 0
                    ? item.imageUrls[0]
                    : images[`recipe${item.recipeName.replace(/ /g, "")}Thumb`]
                }
                alt={item.recipeName}
              />
            </div>
            <div className="kh-recipe-block__content">
              <h3>{item.recipeName}</h3>
              <p>
                {item.description.length > 200
                  ? `${item.description.slice(0, 120)}...`
                  : item.description}
              </p>
            </div>
            <div className="kh-recipe-block__info">
              <span>{item.cookTime} </span>
              <span>{item.servings} </span>
              <span>{item.difficulty} </span>
              <span>{item.recipeFav} </span>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default RecipeCardBig;

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

  // Fetch recipes from DB - now using published endpoint
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const res = await fetch("/api/recipe/published");
        const data = await res.json();
        const dataArr = Array.isArray(data) ? data : [];
        setRecipes(dataArr);
        setSortedRecipes(sortByPropertyDesc(dataArr, "recipeFav"));
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

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

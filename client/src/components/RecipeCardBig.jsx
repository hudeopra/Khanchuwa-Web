import React, { useEffect, useState } from "react";
import * as images from "../assets/js/images.js";

const RecipeCardBig = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch recipes from DB
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const res = await fetch("/api/recipe/all");
        const data = await res.json();
        const dataArr = Array.isArray(data) ? data : [];
        setRecipes(dataArr);
        setLoading(false);
        console.log(data);
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
  const displayedCards = recipes.slice(0, 7);
  // Split data into horizontal and vertical cards
  const horizontalCards = displayedCards.slice(0, 3);
  const verticalCards = displayedCards.slice(3);

  return (
    <div className="kh-recipe-block__wrapper">
      {/* Render horizontal cards */}
      {horizontalCards.map((item, index) => (
        <div
          key={index}
          className="kh-recipe-block__item kh-recipe__item--horizontal"
        >
          <div className="kh-recipe-block__item--img">
            <img
              // Use image from DB if available, otherwise fallback to images asset
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
            <span>{item.description} Recipes</span>
          </div>
          <div className="kh-recipe-block__info">
            <span>{item.cookTime} </span>
            <span>{item.portion} </span>
            <span>{item.difficulty} </span>
          </div>
        </div>
      ))}

      {/* Render vertical cards */}
      {verticalCards.map((item, index) => (
        <div key={index} className="kh-recipe-block__item">
          <div className="kh-recipe-block__content">
            <h3>{item.recipeName}</h3>
            <span>{item.description} Recipes</span>
          </div>
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
          <div className="kh-recipe-block__info">
            <span>{item.cookTime} </span>
            <span>{item.portion} </span>
            <span>{item.difficulty} </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecipeCardBig;

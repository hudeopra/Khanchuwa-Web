import React from "react";
import { recipeCardBig } from "../assets/js/dummyContent.js";
import * as images from "../assets/js/images.js";

const RecipeCardBig = () => {
  // Get the first 7 items from the recipeCardBig array
  const displayedCards = recipeCardBig.slice(0, 11);

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
              src={images[`recipe${item.name.replace(/ /g, "")}Thumb`]}
              alt={item.name}
            />
          </div>
          <div className="kh-recipe-block__content">
            <h3>{item.name}</h3>
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
            <h3>{item.name}</h3>
            <span>{item.description} Recipes</span>
          </div>
          <div className="kh-recipe-block__item--img">
            <img
              src={images[`recipe${item.name.replace(/ /g, "")}Thumb`]}
              alt={item.name}
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

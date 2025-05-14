import React, { useEffect, useState } from "react";
import { fetchRandomRecipeId } from "./Header"; // Import the fetch function

export const FavRecipeBlock = ({ variant }) => {
  const [recipe, setRecipe] = useState(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      const randomRecipe = await fetchRandomRecipeId();
      setRecipe(randomRecipe);
    };
    fetchRecipe();
  }, []);

  const wrapperClass =
    variant === "inverted"
      ? "kh-recipe-fav__wrapper inverted"
      : "kh-recipe-fav__wrapper";

  return (
    <div className="">
      <div className={wrapperClass}>
        <div className="kh-recipe-fav__content">
          <div className="kh-recipe-fav__img">
            <img
              src={recipe?.favImgUrl || ""}
              alt={recipe?.title || "Recipe image"}
            />
          </div>
          <div className="kh-recipe-fav__content-detail">
            <h3 className="kh-recipe-fav__title">
              {recipe ? recipe.title : "CAN’T DECIDE?"}
            </h3>
            <p className="kh-recipe-fav__description">
              {recipe
                ? recipe.description
                : "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ullam ratione est nesciunt quibusdam autem consequuntur aperiam quisquam? Aspernatur, molestias incidunt?"}
            </p>
            <div className="kh-recipe-fav__process">
              {/* Example process items */}
              <div className="kh-recipe-fav__process-item">
                <img
                  className="kh-recipe-fav__process-item-icon"
                  src=""
                  alt="Process icon 1"
                />
                <span className="kh-recipe-fav__process-item-text">
                  {recipe?.processStep1 || "Text Content"}
                </span>
              </div>
              {/* Add more process items dynamically if needed */}
            </div>
          </div>
        </div>
        <div className="kh-recipe-fav__product">
          <div className="kh-recipe-fav__product--head">
            <div className="kh-recipe-fav__product---head-img">
              <img src={recipe?.productImage || ""} alt="Product image" />
            </div>
            <p>{recipe?.productDescription || "Product description here"}</p>
          </div>
          <div className="kh-recipe-fav__product--body">
            <div className="kh-recipe-fav__product--content">
              <div className="kh-product-fav__product--detail">
                <span className="kh-recipe-fav__product--price">
                  {recipe?.price ? `$${recipe.price}` : "$123"}
                </span>
                <h4 className="kh-recipe-fav__product--title">
                  {recipe?.productTitle || "Product Title"}
                </h4>
              </div>
              <button className="kh-recipe-fav__action-button">
                {recipe?.actionText || "Action Button"}
              </button>
            </div>
            <p className="kh-recipe-fav__product--description">
              {recipe?.productLongDescription ||
                "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ullam ratione est nesciunt quibusdam autem consequuntur aperiam quisquam? Aspernatur, molestias incidunt?"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FavRecipeBlock;

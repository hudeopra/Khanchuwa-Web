import React from "react";
import { cuisineCategoryData } from "../assets/js/dummyContent.js";
import * as images from "../assets/js/images.js";

const CategoryList = () => {
  // Get the first 5 items from the cuisineCategoryData array
  const displayedCategories = cuisineCategoryData.slice(0, 11);
  return (
    <div className="kh-category__wrapper py-2">
      {displayedCategories.map((item, index) => (
        <div key={index} className="kh-category__item">
          <div className="kh-category__item--img">
            <img
              src={images[`cuisine${item.name.replace(" ", "")}`]}
              alt={item.name}
            />
          </div>
          <h3>{item.name}</h3>
          <p>{item.recipeCount} Recipes</p>
        </div>
      ))}
    </div>
  );
};

export default CategoryList;

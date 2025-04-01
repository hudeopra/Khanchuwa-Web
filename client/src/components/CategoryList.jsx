import React from "react";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import { cuisineCategoryData } from "../assets/js/dummyContent.js";
import * as images from "../assets/js/images.js";

const CategoryList = () => {
  // Get the first 11 items from the cuisineCategoryData array
  const displayedCategories = cuisineCategoryData.slice(0, 11);
  return (
    <div className="kh-category__wrapper py-2">
      {displayedCategories.map((item, index) => (
        <div key={index} className="kh-category__item">
          <Link
            to={`/category/${item.name.replace(/\s+/g, "-").toLowerCase()}`}
          >
            <div className="kh-category__item--img">
              <img
                src={images[`cuisine${item.name.replace(/\s+/g, "")}`]}
                alt={item.name}
              />
            </div>
            <h3>{item.name}</h3>
            <p>{item.recipeCount} Recipes</p>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default CategoryList;

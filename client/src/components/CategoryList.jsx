import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // Import Link from react-router-dom

const CategoryList = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // Fetch data from the API
    fetch("http://localhost:3000/api/tag/cuisineTag")
      .then((response) => response.json())
      .then((data) => setCategories(data))
      .catch((error) => console.error("Error fetching categories:", error));
  }, []);

  return (
    <div className="kh-category__wrapper py-2">
      {categories.map((item, index) => (
        <div key={index} className="kh-category__item">
          <div className="kh-category__item--img">
            {/* Add Link to navigate to /cookshop/cuisineTag/{objid} */}
            <Link to={`/cookshop/cuisineTag/${item._id}`}>
              <img src={item.favImg} alt={item.name} />
            </Link>
          </div>
          <h3>{item.name}</h3>
          <p>{item.recipeRefs.length} Recipes</p>
        </div>
      ))}
    </div>
  );
};

export default CategoryList;

import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom"; // Import Link

const Category = () => {
  const { value } = useParams(); // Extract the dynamic value from the URL
  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState(null); // State to handle errors

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/recipe/cuisineTag/${value.toLowerCase()}`
        );
        const data = await response.json();
        console.log("Fetched recipes:", data); // Log the fetched data
        console.log("value", value);
        if (Array.isArray(data) && data.length > 0) {
          setRecipes(data);
        } else {
          setError("No recipes found");
        }
      } catch (error) {
        console.error("Error fetching recipes:", error);
        setError("Failed to fetch recipes");
      }
    };

    fetchRecipes();
  }, [value]); // Re-fetch recipes when the URL parameter changes

  return (
    <main className="category-page">
      <h1>Recipes for {value}</h1>
      {error ? (
        <p className="error-message">{error}</p>
      ) : (
        <div className="recipe-cards">
          {recipes.map((recipe) => (
            <Link
              to={`/recipes/${recipe._id}`}
              key={recipe._id}
              className="recipe-card-link"
            >
              <div className="recipe-card">
                <img
                  src={recipe.imageUrls?.[0] || "default-image.jpg"}
                  alt={recipe.recipeName}
                />
                <h2>{recipe.recipeName}</h2>
                <p>{recipe.shortDescription}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
};

export default Category;

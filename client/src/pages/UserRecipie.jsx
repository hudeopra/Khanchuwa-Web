import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import ProfileNav from "../components/ProfileNav";

export default function UserRecipie() {
  const { currentUser } = useSelector((state) => state.user);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (currentUser) {
      const user = currentUser.user || currentUser;
      const userId = user._id;
      fetch(`http://localhost:3000/api/recipe/user/${userId}`)
        .then((res) => {
          if (!res.ok) {
            return res.text().then((text) => {
              throw new Error(`Fetch error: ${res.status} ${text}`);
            });
          }
          return res.json();
        })
        .then((data) => {
          if (data.success) {
            setRecipes(data.recipes);
            console.log("User Recipes: ", data.recipes);
          }
        })
        .catch((error) => setError(error.message))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  if (loading) return <p>Loading recipes...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <main className="kh-profile">
      <div className="container">
        <div className="row">
          <div className="col-3">
            <ProfileNav active="My Recipes" subActive={true} />
          </div>
          <div className="col-8">
            <h1 className="text-3xl font-semibold text-center my-7">
              My Recipes
            </h1>
            {recipes.length === 0 ? (
              <p>No recipes found.</p>
            ) : (
              <div className="kh-recipe-post">
                {recipes.map((recipe) => (
                  <div key={recipe._id} className="recipe-block">
                    <div className="recipe-block-wrapper">
                      <h3>{recipe.recipeName}</h3>
                      <img
                        src={
                          Array.isArray(recipe.imageUrls) &&
                          recipe.imageUrls.length > 0
                            ? recipe.imageUrls[0]
                            : ""
                        }
                        alt={recipe.recipeName}
                        className="recipe-fav-image"
                      />
                      <h3>{recipe.shortDescription}</h3>
                      <h3>{recipe.diet}</h3>
                      <h3>{recipe.updatedAt}</h3>
                      <p>Meal Type:</p>
                      <ul>
                        {recipe.mealType.map((meal, index) => (
                          <li key={index}>{meal}</li>
                        ))}
                      </ul>
                      <h3>Ingredients:</h3>
                      <ul>
                        {recipe.ingredients.map((ingredient) => (
                          <li key={ingredient._id}>{ingredient.name}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Link
                        to={`/recipes/${recipe._id}`}
                        className="btn btn-view text-blue-500"
                      >
                        View Recipe
                      </Link>
                      <Link
                        to={`/recipes/edit/${recipe._id}`}
                        className="btn btn-edit"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

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
      fetch(`http://localhost:3000/api/recipe/user/${userId}?limit=5`)
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
            setRecipes(data.recipes); // Updated to setRecipes
            console.log("Recent Recipes: ", data.recipes);
          }
        })
        .catch((error) => {
          console.error(error);
          setError(error.message); // Set error state
        })
        .finally(() => {
          setLoading(false); // Ensure loading is set to false
        });
    } else {
      setLoading(false); // Handle case where currentUser is not defined
    }
  }, [currentUser]);

  useEffect(() => {
    console.log("Recipes state updated:", recipes); // Log whenever recipes state changes
  }, [recipes]);

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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recipes.map((recipe) => (
                  <div key={recipe._id} className="border p-4 rounded-lg">
                    <img
                      src={
                        recipe.imageUrls?.[0] ||
                        "https://via.placeholder.com/150"
                      }
                      alt={recipe.recipeName || "Recipe image"}
                      className="w-full h-40 object-cover rounded"
                    />
                    <h2 className="mt-2 font-semibold">{recipe.recipeName}</h2>
                    <p className="text-sm">{recipe.description}</p>
                    <div className="flex gap-2">
                      <Link
                        className="text-blue-500"
                        to={`/recipes/${recipe._id}`}
                      >
                        View Recipe
                      </Link>
                      <Link
                        className="text-green-500"
                        to={`/recipes/edit/${recipe._id}`}
                      >
                        Edit Recipe
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

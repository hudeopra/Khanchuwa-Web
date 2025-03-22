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
    async function fetchRecipes() {
      try {
        const res = await fetch("/api/recipe/all");
        const data = await res.json();
        // Assuming each recipe's userRef is stored as a string
        const userRecipes = data.filter(
          (recipe) => recipe.userRef === currentUser.user._id
        );
        setRecipes(userRecipes);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (currentUser) fetchRecipes();
  }, [currentUser]);

  if (loading) return <p>Loading recipes...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <main className="" kh-profile>
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
                      src={recipe.imageUrls[0]}
                      alt={recipe.recipeName}
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

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function RecipeDetail() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("Fetching recipe with ID:", id); // Log the ID

    const fetchRecipe = async () => {
      try {
        const res = await fetch(`/api/recipe/${id}`);
        const data = await res.json();
        console.log("API response:", data); // Log the API response

        if (res.ok) {
          setRecipe(data);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <main className="p-3 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">
        {recipe.recipeName}
      </h1>
      <p className="text-lg">{recipe.description}</p>
      <p>
        <strong>Diet:</strong> {recipe.diet}
      </p>
      <p>
        <strong>Ingredients:</strong> {recipe.ingredients}
      </p>
      <p>
        <strong>Prep Time:</strong> {recipe.prepTime}
      </p>
      <p>
        <strong>Cook Time:</strong> {recipe.cookTime}
      </p>
      <p>
        <strong>Servings:</strong> {recipe.servings}
      </p>
      <p>
        <strong>Difficulty:</strong> {recipe.difficulty}
      </p>
      <p>
        <strong>Chef:</strong> {recipe.chefName}
      </p>
      <p>
        <strong>Recipe Tester:</strong> {recipe.recipeTester}
      </p>
      <p>
        <strong>Cuisine:</strong> {recipe.cuisine}
      </p>
      <p>
        <strong>Tags:</strong> {recipe.recipeTags.join(", ")}
      </p>
      {recipe.imageUrls.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold my-4">Images</h2>
          <div className="flex gap-4">
            {recipe.imageUrls.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`Recipe image ${index + 1}`}
                className="w-32 h-32 object-cover rounded-lg"
              />
            ))}
          </div>
        </div>
      )}
      {recipe.videoUrls.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold my-4">Videos</h2>
          <div className="flex gap-4">
            {recipe.videoUrls.map((url, index) => (
              <video key={index} controls className="w-64 h-64">
                <source src={url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

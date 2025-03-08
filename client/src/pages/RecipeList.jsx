import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function RecipeList() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const res = await fetch("/api/recipe/all");
        const data = await res.json();
        setRecipes(data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <main className="kh-recipe-list">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <h1 className="text-3xl font-semibold text-center my-7">
              All Recipes
            </h1>
          </div>
          {recipes.map((recipe) => (
            <div
              key={recipe._id}
              className="col-12 col-lg-3 col-md-4 col-sm-6 mb-3"
            >
              <div className="kh-recipe-block__item mb-3">
                <Link to={`/recipes/${recipe._id}`} className="">
                  <div className="kh-recipe-block__content">
                    <h3 className="">{recipe.recipeName}</h3>
                    <p className="">{recipe.description}</p>
                    <span className="">By {recipe.chefName}</span>
                  </div>
                  <div className="kh-recipe-block__item--img">
                    <img
                      src={recipe.imageUrls[0]}
                      alt={recipe.recipeName}
                      className=""
                    />
                  </div>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

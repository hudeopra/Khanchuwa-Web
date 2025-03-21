import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

export default function RecipeList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = searchParams.get("searchTerm") || "";

  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cuisineTags, setCuisineTags] = useState([]);
  const [ingredientTags, setIngredientTags] = useState([]);
  const [flavourTags, setFlavourTags] = useState([]);

  const [selectedCuisine, setSelectedCuisine] = useState([]);
  const [selectedIngredient, setSelectedIngredient] = useState([]);
  const [selectedFlavour, setSelectedFlavour] = useState([]);

  useEffect(() => {
    const params = {};
    if (selectedCuisine.length) params.cuisineTag = selectedCuisine.join(",");
    if (selectedIngredient.length)
      params.ingredientTag = selectedIngredient.join(",");
    if (selectedFlavour.length) params.flavorTag = selectedFlavour.join(",");
    if (searchTerm) params.searchTerm = searchTerm;
    setSearchParams(params);
  }, [
    selectedCuisine,
    selectedIngredient,
    selectedFlavour,
    searchTerm,
    setSearchParams,
  ]);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const res = await fetch(
          `/api/recipe/filter?${searchParams.toString()}`
        );
        const data = await res.json();
        setRecipes(data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [searchParams]);

  useEffect(() => {
    const fetchAllTags = async () => {
      try {
        const [cuisineRes, ingredientRes, flavourRes] = await Promise.all([
          fetch("http://localhost:3000/api/tag/cuisineTag"),
          fetch("http://localhost:3000/api/tag/ingredientTag"),
          fetch("http://localhost:3000/api/tag/flavourTag"),
        ]);
        const cuisineData = await cuisineRes.json();
        const ingredientData = await ingredientRes.json();
        const flavourData = await flavourRes.json();
        setCuisineTags(cuisineData);
        setIngredientTags(ingredientData);
        setFlavourTags(flavourData);
      } catch (err) {
        console.error("Error fetching tags:", err);
      }
    };
    fetchAllTags();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  const filteredRecipes = recipes.filter((recipe) => {
    if (searchTerm) {
      const searchWords = searchTerm.toLowerCase().split(/\s+/).filter(Boolean);
      const text =
        `${recipe.recipeName} ${recipe.description} ${recipe.chefName}`.toLowerCase();
      if (!searchWords.every((word) => text.includes(word))) return false;
    }
    return true;
  });

  return (
    <main className="kh-recipe-list">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <h1 className="text-3xl font-semibold text-center my-7">
              All Recipes
            </h1>
            <div className="filter-checkboxes">
              <h2>Filter by Tags</h2>
              <div>
                <h3>Cuisine Tags</h3>
                {cuisineTags.map((tag) => (
                  <label key={tag._id || tag.name}>
                    <input
                      type="checkbox"
                      value={tag._id || tag.name}
                      checked={selectedCuisine.includes(tag._id || tag.name)}
                      onChange={(e) => {
                        e.target.checked
                          ? setSelectedCuisine([
                              ...selectedCuisine,
                              e.target.value,
                            ])
                          : setSelectedCuisine(
                              selectedCuisine.filter(
                                (t) => t !== e.target.value
                              )
                            );
                      }}
                    />
                    {tag.name}
                  </label>
                ))}
              </div>
              <div>
                <h3>Ingredient Tags</h3>
                {ingredientTags.map((tag) => (
                  <label key={tag._id || tag.name}>
                    <input
                      type="checkbox"
                      value={tag._id || tag.name}
                      checked={selectedIngredient.includes(tag._id || tag.name)}
                      onChange={(e) => {
                        e.target.checked
                          ? setSelectedIngredient([
                              ...selectedIngredient,
                              e.target.value,
                            ])
                          : setSelectedIngredient(
                              selectedIngredient.filter(
                                (t) => t !== e.target.value
                              )
                            );
                      }}
                    />
                    {tag.name}
                  </label>
                ))}
              </div>
              <div>
                <h3>Flavour Tags</h3>
                {flavourTags.map((tag) => (
                  <label key={tag._id || tag.name}>
                    <input
                      type="checkbox"
                      value={tag._id || tag.name}
                      checked={selectedFlavour.includes(tag._id || tag.name)}
                      onChange={(e) => {
                        e.target.checked
                          ? setSelectedFlavour([
                              ...selectedFlavour,
                              e.target.value,
                            ])
                          : setSelectedFlavour(
                              selectedFlavour.filter(
                                (t) => t !== e.target.value
                              )
                            );
                      }}
                    />
                    {tag.name}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <span>Cuisine Tags (Count: {cuisineTags.length})</span>
              {/* <ul>
                {cuisineTags.map((tag) => (
                  <li key={tag._id || tag.name}>{tag.name}</li>
                ))}
              </ul> */}
              <span>Ingredient Tags (Count: {ingredientTags.length})</span>
              {/* <ul>
                {ingredientTags.map((tag) => (
                  <li key={tag._id || tag.name}>{tag.name}</li>
                ))}
              </ul> */}
              <span>Flavour Tags (Count: {flavourTags.length})</span>
              {/* <ul>
                {flavourTags.map((tag) => (
                  <li key={tag._id || tag.name}>{tag.name}</li>
                ))}
              </ul> */}
            </div>
          </div>
          {filteredRecipes.map((recipe) => (
            <div
              key={recipe._id}
              className="col-12 col-lg-3 col-md-4 col-sm-6 mb-3"
            >
              <div className="kh-recipe-block__item mb-3">
                <Link to={`/recipes/${recipe._id}`} className="">
                  <div className="kh-recipe-block__content">
                    <h3 className="">{recipe.recipeName}</h3>
                    <p className="">{recipe.shortDescription}</p>
                    <span className="">By {recipe.chefName}</span>
                  </div>
                  <div className="kh-recipe-block__item--img">
                    <img
                      src={recipe.imageUrls[0]}
                      alt={recipe.recipeName}
                      className=""
                    />
                  </div>
                  <p>Cook Time: {recipe.cookTime}</p>
                  <p>Diet: {recipe.diet}</p>
                  <p>Difficulty: {recipe.difficulty}</p>
                  <p>
                    Ingredient Tags:{" "}
                    {Array.isArray(recipe.ingredientTag)
                      ? recipe.ingredientTag
                          .map((id) => {
                            const tag = ingredientTags.find(
                              (t) => t._id === id
                            );
                            return tag ? tag.name : id;
                          })
                          .join(", ")
                      : recipe.ingredientTag}
                  </p>
                  <p>Prep Time: {recipe.prepTime}</p>
                  <p>Portion: {recipe.portion}</p>
                  <p>
                    Flavour Tags:{" "}
                    {Array.isArray(recipe.flavourTag)
                      ? recipe.flavourTag
                          .map((id) => {
                            const tag = flavourTags.find((t) => t._id === id);
                            return tag ? tag.name : id;
                          })
                          .join(", ")
                      : recipe.flavourTag}
                  </p>
                  <p>
                    Cuisine Tags:{" "}
                    {Array.isArray(recipe.cuisineTag)
                      ? recipe.cuisineTag
                          .map((id) => {
                            const tag = cuisineTags.find((t) => t._id === id);
                            return tag ? tag.name : id;
                          })
                          .join(", ")
                      : recipe.cuisineTag}
                  </p>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

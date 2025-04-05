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

  // New state variables for toggle
  const [showCuisineFilter, setShowCuisineFilter] = useState(false);
  const [showIngredientFilter, setShowIngredientFilter] = useState(false);
  const [showFlavourFilter, setShowFlavourFilter] = useState(false);

  const [ingredientLogic, setIngredientLogic] = useState("OR"); // AND or OR
  const [cuisineLogic, setCuisineLogic] = useState("OR"); // AND or OR
  const [flavourLogic, setFlavourLogic] = useState("OR"); // AND or OR

  useEffect(() => {
    const params = {};
    if (selectedCuisine.length) {
      params.cuisineTag = selectedCuisine.join(",");
      params.cuisineLogic = cuisineLogic; // Add logic to query params
    }
    if (selectedIngredient.length) {
      params.ingredientTag = selectedIngredient.join(",");
      params.ingredientLogic = ingredientLogic; // Add logic to query params
    }
    if (selectedFlavour.length) {
      params.flavorTag = selectedFlavour.join(",");
      params.flavourLogic = flavourLogic; // Add logic to query params
    }
    if (searchTerm) params.searchTerm = searchTerm;

    // Update searchParams only if there are filters or search term
    if (Object.keys(params).length > 0) {
      setSearchParams(params);
    }
  }, [
    selectedCuisine,
    selectedIngredient,
    selectedFlavour,
    ingredientLogic,
    cuisineLogic,
    flavourLogic,
    searchTerm,
    setSearchParams,
  ]);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const query = searchParams.toString();
        const url = query ? `/api/recipe/filter?${query}` : `/api/recipe/all`; // Fetch all recipes if no query
        const res = await fetch(url);
        const data = await res.json();
        console.log("Fetched recipes:", data);
        const fetchedRecipes = Array.isArray(data.recipes) ? data.recipes : [];
        setRecipes(fetchedRecipes); // Ensure recipes are set correctly
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    // Ensure default behavior when no filters or search term
    if (!searchParams.toString() && !Object.keys(searchParams).length) {
      fetchRecipes(); // Fetch all recipes directly
    } else {
      fetchRecipes(); // Fetch recipes based on filters or search term
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchAllTags = async () => {
      try {
        const [cuisineRes, ingredientRes, flavourRes] = await Promise.all([
          fetch("http://localhost:3000/api/tag/cuisineTag"),
          fetch("http://localhost:3000/api/tag/ingredientTag"),
          fetch("http://localhost:3000/api/tag/flavourTag"),
        ]);
        setCuisineTags(await cuisineRes.json());
        setIngredientTags(await ingredientRes.json());
        setFlavourTags(await flavourRes.json());
      } catch (err) {
        console.error("Error fetching tags:", err);
      }
    };
    fetchAllTags();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  // Ensure recipes are correctly accessed if wrapped in an object
  const recipesToFilter = Array.isArray(recipes) ? recipes : [];
  const filteredRecipes = recipesToFilter.filter((recipe) => {
    if (searchTerm) {
      const searchWords = searchTerm.toLowerCase().split(/\s+/).filter(Boolean);
      const text =
        `${recipe.recipeName} ${recipe.description} ${recipe.chefName}`.toLowerCase();
      if (!searchWords.every((word) => text.includes(word))) return false;
    }
    return true;
  });

  // Debugging log to verify filteredRecipes
  console.log("Filtered Recipes:", filteredRecipes);

  return (
    <main className="kh-recipe-list">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <h1 className="text-3xl font-semibold text-center my-7">
              All Recipes
            </h1>
            <div className="kh-recipe-list__filter-wrapper">
              <h2>Filter by Tags</h2>
              <div className="kh-recipe-list__filter-wrapper--tags">
                {/* Toggle Cuisine Filter */}
                <h3
                  onClick={() => setShowCuisineFilter(!showCuisineFilter)}
                  style={{ cursor: "pointer" }}
                >
                  Cuisine Tags {cuisineTags.length}
                </h3>
                <div
                  className={`kh-recipe-list__filter ${
                    showCuisineFilter ? "filter-popup" : ""
                  }`}
                >
                  <button
                    className="close-button"
                    onClick={() => setShowCuisineFilter(false)}
                  >
                    x
                  </button>
                  <button
                    onClick={() =>
                      setCuisineLogic((prev) => (prev === "AND" ? "OR" : "AND"))
                    }
                  >
                    Toggle Logic: {cuisineLogic}
                  </button>
                  <div className="d-flex gap-2 flex-wrap">
                    {cuisineTags.map((tag) => (
                      <div
                        key={tag.name || tag._id}
                        className="kh-recipe-form__checkbox--item"
                      >
                        <input
                          type="checkbox"
                          value={tag.name || tag._id}
                          checked={selectedCuisine.includes(
                            tag.name || tag._id
                          )}
                          onChange={(e) => {
                            e.target.checked
                              ? setSelectedCuisine((prev) => {
                                  const updated = [...prev, e.target.value];
                                  console.log(
                                    "Selected Cuisine Tags:",
                                    updated
                                  );
                                  return updated;
                                })
                              : setSelectedCuisine((prev) => {
                                  const updated = prev.filter(
                                    (t) => t !== e.target.value
                                  );
                                  console.log(
                                    "Selected Cuisine Tags:",
                                    updated
                                  );
                                  return updated;
                                });
                          }}
                        />
                        <label>{tag.name}</label>
                      </div>
                    ))}
                  </div>
                </div>
                <span
                  className={`kh-recipe-list__filter-wrapper--overlay ${
                    showCuisineFilter ? "filter-popup" : ""
                  }`}
                ></span>
              </div>
              <div className="kh-recipe-list__filter-wrapper--tags">
                {/* Toggle Ingredient Filter */}
                <h3
                  onClick={() => setShowIngredientFilter(!showIngredientFilter)}
                  style={{ cursor: "pointer" }}
                >
                  Ingredient Tags {ingredientTags.length}
                </h3>

                <div
                  className={`kh-recipe-list__filter ${
                    showIngredientFilter ? "filter-popup" : ""
                  }`}
                >
                  <button
                    className="close-button"
                    onClick={() => setShowIngredientFilter(false)}
                  >
                    x
                  </button>
                  <button
                    onClick={() =>
                      setFlavourLogic((prev) => (prev === "AND" ? "OR" : "AND"))
                    }
                  >
                    Toggle Logic: {flavourLogic}
                  </button>
                  <div className="d-flex gap-2 flex-wrap">
                    {ingredientTags.map((tag) => (
                      <div
                        key={tag.name || tag._id}
                        className="kh-recipe-form__checkbox--item"
                      >
                        <input
                          type="checkbox"
                          value={tag.name || tag._id}
                          checked={selectedIngredient.includes(
                            tag.name || tag._id
                          )}
                          onChange={(e) => {
                            e.target.checked
                              ? setSelectedIngredient((prev) => {
                                  const updated = [...prev, e.target.value];
                                  console.log(
                                    "Selected Ingredient Tags:",
                                    updated
                                  );
                                  return updated;
                                })
                              : setSelectedIngredient((prev) => {
                                  const updated = prev.filter(
                                    (t) => t !== e.target.value
                                  );
                                  console.log(
                                    "Selected Ingredient Tags:",
                                    updated
                                  );
                                  return updated;
                                });
                          }}
                        />
                        <label>{tag.name}</label>
                      </div>
                    ))}
                  </div>
                </div>
                <span
                  className={`kh-recipe-list__filter-wrapper--overlay ${
                    showIngredientFilter ? "filter-popup" : ""
                  }`}
                ></span>
              </div>
              <div className="kh-recipe-list__filter-wrapper--tags">
                {/* Toggle Flavour Filter */}
                <h3
                  onClick={() => setShowFlavourFilter(!showFlavourFilter)}
                  style={{ cursor: "pointer" }}
                >
                  Flavour Tags {flavourTags.length}
                </h3>
                <div
                  className={`kh-recipe-list__filter ${
                    showFlavourFilter ? "filter-popup" : ""
                  }`}
                >
                  <button
                    className="close-button"
                    onClick={() => setShowFlavourFilter(false)}
                  >
                    x
                  </button>
                  <button
                    onClick={() =>
                      setFlavourLogic((prev) => (prev === "AND" ? "OR" : "AND"))
                    }
                  >
                    Toggle Logic: {flavourLogic}
                  </button>
                  <div className="d-flex gap-2 flex-wrap">
                    {flavourTags.map((tag) => (
                      <div
                        key={tag.name || tag._id}
                        className="kh-recipe-form__checkbox--item"
                      >
                        <input
                          type="checkbox"
                          value={tag.name || tag._id}
                          checked={selectedFlavour.includes(
                            tag.name || tag._id
                          )}
                          onChange={(e) => {
                            e.target.checked
                              ? setSelectedFlavour((prev) => {
                                  const updated = [...prev, e.target.value];
                                  console.log(
                                    "Selected Flavour Tags:",
                                    updated
                                  );
                                  return updated;
                                })
                              : setSelectedFlavour((prev) => {
                                  const updated = prev.filter(
                                    (t) => t !== e.target.value
                                  );
                                  console.log(
                                    "Selected Flavour Tags:",
                                    updated
                                  );
                                  return updated;
                                });
                          }}
                        />
                        <label>{tag.name}</label>
                      </div>
                    ))}
                  </div>
                </div>
                <span
                  className={`kh-recipe-list__filter-wrapper--overlay ${
                    showFlavourFilter ? "filter-popup" : ""
                  }`}
                ></span>
              </div>
            </div>
          </div>
          {filteredRecipes.length > 0 ? (
            filteredRecipes.map((recipe) => (
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
                            .map((tag) => tag.tagName)
                            .join(", ")
                        : recipe.ingredientTag}
                    </p>
                    <p>Prep Time: {recipe.prepTime}</p>
                    <p>Portion: {recipe.portion}</p>
                    <p>
                      Flavour Tags:{" "}
                      {Array.isArray(recipe.flavourTag)
                        ? recipe.flavourTag.map((tag) => tag.tagName).join(", ")
                        : recipe.flavourTag}
                    </p>
                    <p>
                      Cuisine Tags:{" "}
                      {Array.isArray(recipe.cuisineTag)
                        ? recipe.cuisineTag.map((tag) => tag.tagName).join(", ")
                        : recipe.cuisineTag}
                    </p>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p>No recipes found.</p>
          )}
        </div>
      </div>
    </main>
  );
}

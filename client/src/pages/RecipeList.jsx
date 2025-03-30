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
  const [equipmentTags, setEquipmentTags] = useState([]);

  const [selectedCuisine, setSelectedCuisine] = useState([]);
  const [selectedIngredient, setSelectedIngredient] = useState([]);
  const [selectedFlavour, setSelectedFlavour] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState([]);

  // New state variables for toggle
  const [showCuisineFilter, setShowCuisineFilter] = useState(false);
  const [showIngredientFilter, setShowIngredientFilter] = useState(false);
  const [showFlavourFilter, setShowFlavourFilter] = useState(false);
  const [showEquipmentFilter, setShowEquipmentFilter] = useState(false);

  useEffect(() => {
    const params = {};
    if (selectedCuisine.length) params.cuisineTag = selectedCuisine.join(",");
    if (selectedIngredient.length)
      params.ingredientTag = selectedIngredient.join(",");
    if (selectedFlavour.length) params.flavorTag = selectedFlavour.join(",");
    if (selectedEquipment.length)
      params.equipmentTag = selectedEquipment.join(",");
    if (searchTerm) params.searchTerm = searchTerm;
    setSearchParams(params);
  }, [
    selectedCuisine,
    selectedIngredient,
    selectedFlavour,
    selectedEquipment,
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
        console.log("Fetched recipes:", data);
        if (Array.isArray(data)) {
          setRecipes(data);
        } else {
          console.error("API did not return an array:", data);
          setRecipes([]);
        }
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
        const [cuisineRes, ingredientRes, flavourRes, equipmentRes] =
          await Promise.all([
            fetch("http://localhost:3000/api/tag/cuisineTag"),
            fetch("http://localhost:3000/api/tag/ingredientTag"),
            fetch("http://localhost:3000/api/tag/flavourTag"),
            fetch("http://localhost:3000/api/tag/equipmentTag"),
          ]);
        const cuisineData = await cuisineRes.json();
        const ingredientData = await ingredientRes.json();
        const flavourData = await flavourRes.json();
        const equipmentData = await equipmentRes.json();
        setCuisineTags(cuisineData);
        setIngredientTags(ingredientData);
        setFlavourTags(flavourData);
        setEquipmentTags(equipmentData);
        console.log("Fetched tags:", {
          cuisineData,
        });
        console.log("Fetched tags:", {
          ingredientData,
        });
        console.log("Fetched tags:", {
          flavourData,
        });
        console.log("Fetched tags:", {
          equipmentData,
        });
      } catch (err) {
        console.error("Error fetching tags:", err);
      }
    };
    fetchAllTags();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  const filteredRecipes = (Array.isArray(recipes) ? recipes : []).filter(
    (recipe) => {
      if (searchTerm) {
        const searchWords = searchTerm
          .toLowerCase()
          .split(/\s+/)
          .filter(Boolean);
        const text =
          `${recipe.recipeName} ${recipe.description} ${recipe.chefName}`.toLowerCase();
        if (!searchWords.every((word) => text.includes(word))) return false;
      }
      return true;
    }
  );

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

                  <div className="d-flex gap-2 flex-wrap">
                    {cuisineTags.map((tag) => (
                      <div
                        key={tag._id || tag.name}
                        className="kh-recipe-form__checkbox--item"
                      >
                        <input
                          type="checkbox"
                          value={tag._id || tag.name}
                          checked={selectedCuisine.includes(
                            tag._id || tag.name
                          )}
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
                  {ingredientTags.map((tag) => (
                    <div
                      key={tag._id || tag.name}
                      className="kh-recipe-form__checkbox--item"
                    >
                      <input
                        type="checkbox"
                        value={tag._id || tag.name}
                        checked={selectedIngredient.includes(
                          tag._id || tag.name
                        )}
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
                      <label>{tag.name}</label>
                    </div>
                  ))}
                </div>

                {/* <span className="kh-recipe-list__filter-wrapper--overlay"></span> */}
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
                  {flavourTags.map((tag) => (
                    <div
                      key={tag._id || tag.name}
                      className="kh-recipe-form__checkbox--item"
                    >
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
                      <label>{tag.name}</label>
                    </div>
                  ))}
                </div>

                {/* <span className="kh-recipe-list__filter-wrapper--overlay"></span> */}
              </div>
              <div className="kh-recipe-list__filter-wrapper--tags">
                {/* Toggle Equipment Filter */}
                <h3
                  onClick={() => setShowEquipmentFilter(!showEquipmentFilter)}
                  style={{ cursor: "pointer" }}
                >
                  Equipment Tags {equipmentTags.length}
                </h3>
                <div
                  className={`kh-recipe-list__filter ${
                    showEquipmentFilter ? "filter-popup" : ""
                  }`}
                >
                  <button
                    className="close-button"
                    onClick={() => setShowEquipmentFilter(false)}
                  >
                    x
                  </button>
                  {equipmentTags.map((tag) => (
                    <div
                      key={tag._id || tag.name}
                      className="kh-recipe-form__checkbox--item"
                    >
                      <input
                        type="checkbox"
                        value={tag._id || tag.name}
                        checked={selectedEquipment.includes(
                          tag._id || tag.name
                        )}
                        onChange={(e) => {
                          e.target.checked
                            ? setSelectedEquipment([
                                ...selectedEquipment,
                                e.target.value,
                              ])
                            : setSelectedEquipment(
                                selectedEquipment.filter(
                                  (t) => t !== e.target.value
                                )
                              );
                        }}
                      />
                      <label>{tag.name}</label>
                    </div>
                  ))}
                </div>

                {/* <span className="kh-recipe-list__filter-wrapper--overlay"></span> */}
              </div>
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
                          .map((tag) => tag.tagName) // Access the tagName directly from the object
                          .join(", ")
                      : recipe.ingredientTag}
                  </p>

                  <p>Prep Time: {recipe.prepTime}</p>
                  <p>Portion: {recipe.portion}</p>
                  <p>
                    Flavour Tags:{" "}
                    {Array.isArray(recipe.flavourTag)
                      ? recipe.flavourTag
                          .map((tag) => tag.tagName) // Access the tagName directly from the object
                          .join(", ")
                      : recipe.flavourTag}
                  </p>
                  <p>
                    Cuisine Tags:{" "}
                    {Array.isArray(recipe.cuisineTag)
                      ? recipe.cuisineTag
                          .map((tag) => tag.tagName) // Access the tagName directly from the object
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

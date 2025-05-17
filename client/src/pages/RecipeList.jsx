import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  Link,
  useSearchParams,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useSelector } from "react-redux";
import { signInSuccess } from "../redux/user/userSlice";
import RecipeTagFilters from "../components/RecipeTagFilters";

export default function RecipeList() {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.user.currentUser);

  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = searchParams.get("searchTerm") || "";
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cuisineTags, setCuisineTags] = useState([]);
  const [ingredientTags, setIngredientTags] = useState([]);
  const [flavourTags, setFlavourTags] = useState([]);

  const [selectedCuisine, setSelectedCuisine] = useState(
    currentUser?.preferences?.cuisineTags || []
  );
  const [selectedIngredient, setSelectedIngredient] = useState([]);
  const [selectedFlavour, setSelectedFlavour] = useState(
    currentUser?.preferences?.flavourTag || []
  );

  // New state variables for toggle
  const [showCuisineFilter, setShowCuisineFilter] = useState(false);
  const [showIngredientFilter, setShowIngredientFilter] = useState(false);
  const [showFlavourFilter, setShowFlavourFilter] = useState(false);

  const [ingredientLogic, setIngredientLogic] = useState("OR"); // AND or OR
  const [cuisineLogic, setCuisineLogic] = useState("OR"); // AND or OR
  const [flavourLogic, setFlavourLogic] = useState("OR"); // AND or OR

  useEffect(() => {
    const fetchCurrentUser = async () => {
      // Skip the API call if we already have user data in Redux
      if (currentUser && Object.keys(currentUser).length > 0) {
        console.log("Using existing user data from Redux");
        return;
      }

      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          console.log("No access token found, user may not be logged in");
          return;
        }

        const res = await fetch("http://localhost:3000/api/user/current", {
          method: "GET",
          credentials: "include", // Include cookies in the request
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          console.log(`User fetch failed with status: ${res.status}`);
          return; // Exit early without throwing error
        }
        const data = await res.json();
        dispatch(signInSuccess({ user: data }));
      } catch (error) {
        console.log("Error fetching user data:", error.message);
      }
    };

    fetchCurrentUser();
  }, [dispatch, currentUser]);

  useEffect(() => {
    if (currentUser?.preferences?.flavourTag) {
      setSelectedFlavour(currentUser.preferences.flavourTag);
    }
    if (currentUser?.preferences?.cuisineTags) {
      setSelectedCuisine(currentUser.preferences.cuisineTags);
    }
  }, [currentUser]);

  useEffect(() => {
    const params = {};

    if (selectedCuisine.length) {
      params.cuisineTag = selectedCuisine.join(",");
      params.cuisineLogic = cuisineLogic; // Add logic to query params
    } else {
      delete params.cuisineTag;
      delete params.cuisineLogic;
    }

    if (selectedIngredient.length) {
      params.ingredientTag = selectedIngredient.join(",");
      params.ingredientLogic = ingredientLogic; // Add logic to query params
    } else {
      delete params.ingredientTag;
      delete params.ingredientLogic;
    }

    if (selectedFlavour.length) {
      params.flavorTag = selectedFlavour.join(",");
      params.flavourLogic = flavourLogic; // Add logic to query params
    } else {
      delete params.flavorTag;
      delete params.flavourLogic;
    }

    if (searchTerm) {
      params.searchTerm = searchTerm;
    } else {
      delete params.searchTerm;
    }

    // Update searchParams to reflect the current state
    setSearchParams(params);
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
        const fetchedRecipes = Array.isArray(data) ? data : data.recipes || [];
        setRecipes(fetchedRecipes); // Ensure recipes are set correctly
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    if (!searchParams.toString() && !Object.keys(searchParams).length) {
      console.log("No filters applied. Fetching all recipes.");
      fetchRecipes(); // Fetch all recipes directly
    } else {
      console.log("Filter logic applied with:", {
        searchTerm,
        selectedCuisine,
        selectedIngredient,
        selectedFlavour,
      });
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

  useEffect(() => {
    if (searchTerm) {
      const urlParams = new URLSearchParams(window.location.search);
      urlParams.set("searchTerm", searchTerm);
      const searchQuery = urlParams.toString();
      navigate(`/search?${searchQuery}`);
    }
  }, [searchTerm, navigate]);

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

  // // Debugging log to verify filteredRecipes
  // console.log("Filtered Recipes:", filteredRecipes);

  return (
    <main className="kh-recipe-list">
      <div className="container">
        <div className="row">
          <div className="col-12 mb-5">
            <h1 className="text-3xl font-semibold text-center my-7">
              All Recipes
            </h1>
            <div className="kh-recipe-list__filter-wrapper">
              <h2>Filter by Tags</h2>
              <RecipeTagFilters
                tags={cuisineTags}
                selectedTags={selectedCuisine}
                setSelectedTags={setSelectedCuisine}
                logic={cuisineLogic}
                setLogic={setCuisineLogic}
                showFilter={showCuisineFilter}
                setShowFilter={setShowCuisineFilter}
                filterTitle="Cuisine Tags"
              />
              <RecipeTagFilters
                tags={ingredientTags}
                selectedTags={selectedIngredient}
                setSelectedTags={setSelectedIngredient}
                logic={ingredientLogic}
                setLogic={setIngredientLogic}
                showFilter={showIngredientFilter}
                setShowFilter={setShowIngredientFilter}
                filterTitle="Ingredient Tags"
              />
              <RecipeTagFilters
                tags={flavourTags}
                selectedTags={selectedFlavour}
                setSelectedTags={setSelectedFlavour}
                logic={flavourLogic}
                setLogic={setFlavourLogic}
                showFilter={showFlavourFilter}
                setShowFilter={setShowFlavourFilter}
                filterTitle="Flavour Tags"
              />
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
                      <span> fav: </span> {recipe.recipeFav ?? "N/A"}
                    </div>
                    <div className="kh-recipe-block__item--img">
                      <img
                        src={recipe.imageUrls[0]}
                        alt={recipe.recipeName}
                        className=""
                      />
                    </div>
                    <div className="d-none">
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
                          ? recipe.flavourTag
                              .map((tag) => tag.tagName)
                              .join(", ")
                          : recipe.flavourTag}
                      </p>
                      <p>
                        Cuisine Tags:{" "}
                        {Array.isArray(recipe.cuisineTag)
                          ? recipe.cuisineTag
                              .map((tag) => tag.tagName)
                              .join(", ")
                          : recipe.cuisineTag}
                      </p>
                    </div>
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

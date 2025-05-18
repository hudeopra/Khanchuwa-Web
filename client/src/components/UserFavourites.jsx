import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import ToggleFavorite from "./ToggleFavorite";

const UserFavouritesComponent = () => {
  const [favRecipes, setFavRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch("/api/user/current", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch user data");
        const currentUser = await res.json();

        dispatch({
          type: "user/updateUserSuccess",
          payload: currentUser,
        });

        if (currentUser.userFavRecipe && currentUser.userFavRecipe.length > 0) {
          const recipes = await Promise.all(
            currentUser.userFavRecipe.map((id) =>
              fetch(`/api/recipe/${id}`).then((res) => res.json())
            )
          );
          setFavRecipes(recipes);
        }
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [dispatch]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (favRecipes.length === 0) return <p>No favorite recipes found.</p>;

  return (
    <main className="container py-5">
      <h1>My Favorite Recipes</h1>
      <div className="row">
        {favRecipes.map((item, index) => (
          <div key={item._id || index} className="kcol-6 col-mg-3 col-lg-4">
            <div className="kh-recipe-block__item ">
              <ToggleFavorite recipeId={item._id} />
              <Link
                to={`/recipes/${item._id}`}
                className=" kh-recipe__item--horizontal"
              >
                <div className="kh-recipe-block__item--img">
                  <img
                    src={
                      item.favImgUrl
                        ? item.favImgUrl
                        : images[
                            `recipe${item.recipeName.replace(/ /g, "")}Thumb`
                          ]
                    }
                    alt={item.recipeName}
                  />
                </div>
                <div className="kh-recipe-block__content">
                  <h3>{item.recipeName}</h3>
                  <p>
                    {item.description.length > 150
                      ? `${item.description.slice(0, 60)}...`
                      : item.description}
                  </p>
                </div>
                <div className="kh-recipe-block__info">
                  <span>{item.cookTime} </span>
                  <span>{item.servings} </span>
                  <span>{item.difficulty} </span>
                  <span>{item.recipeFav} </span>
                </div>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default UserFavouritesComponent;

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
    <main className="kh-profile ">
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
              <div className="row">
                {recipes.map((item, index) => (
                  <div
                    key={item._id || index}
                    className="col-6 col-mg-3 col-lg-4"
                  >
                    <div className="kh-recipe-block__item">
                      <Link
                        to={`/recipes/${item._id}`}
                        className="kh-recipe__item--horizontal"
                      >
                        <div className="kh-recipe-block__item--img">
                          <img
                            src={
                              Array.isArray(item.imageUrls) &&
                              item.imageUrls.length > 0
                                ? item.imageUrls[0]
                                : ""
                            }
                            alt={item.recipeName}
                          />
                        </div>
                        <div className="kh-recipe-block__content">
                          <h3>{item.recipeName}</h3>
                          <p>
                            {item.shortDescription &&
                            item.shortDescription.length > 150
                              ? `${item.shortDescription.slice(0, 60)}...`
                              : item.shortDescription}
                          </p>
                        </div>
                        <div className="kh-recipe-block__info">
                          <span>{item.cookTime} </span>
                          <span>{item.servings} </span>
                          <span>{item.difficulty} </span>
                          <span>{item.recipeFav} </span>
                        </div>
                      </Link>
                      <div className="mt-2">
                        <Link
                          to={`/recipes/edit/${item._id}`}
                          className="btn btn-edit"
                        >
                          Edit
                        </Link>
                      </div>
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

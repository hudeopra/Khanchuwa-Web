import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export default function ProfileNav({ active, subActive }) {
  const [menuToggles, setMenuToggles] = useState({
    "user-recipe": false,
    "user-blog": false,
  });

  useEffect(() => {
    // Initialize menu toggles based on active and subActive props
    setMenuToggles({
      "user-recipe": active === "My Recipes" && subActive,
      "user-blog": active === "My Blogs" && subActive,
    });
  }, [active, subActive]);

  const handleToggle = (menuKey, e) => {
    e.stopPropagation();
    e.preventDefault();
    setMenuToggles((prev) => ({ ...prev, [menuKey]: !prev[menuKey] }));
  };

  return (
    <div className="kh-profile__menu mt-5">
      <nav className="kh-profile__menu--menu-wrapper">
        <div className="kh-profile__menu--menu-block">
          <ul>
            <li>
              <Link
                to={"/profile"}
                className={active === "Dashboard" ? "active" : ""}
              >
                <img
                  src="../src/assets/img/search/chefLogo.png"
                  alt="Khanchuwa Logo"
                />
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link
                to={"/profile-edit"}
                className={active === "Settings" ? "active" : ""}
              >
                <img
                  src="../src/assets/img/search/chefLogo.png"
                  alt="Khanchuwa Logo"
                />
                <span>Setting</span>
              </Link>
            </li>
            <li className="kh-profile__menu--has-sub-menu">
              <Link
                to={"/user-recipe"}
                className={active === "My Recipes" ? "active" : ""}
              >
                <img
                  src="../src/assets/img/search/chefLogo.png"
                  alt="Khanchuwa Logo"
                />
                <div className="d-flex align-items-center">
                  <span>My Recipes</span>
                  <button
                    type="button"
                    onClick={(e) => handleToggle("user-recipe", e)}
                    className="menu-toggle"
                  >
                    <img
                      src="../src/assets/img/search/down.png"
                      alt="Khanchuwa Logo"
                    />
                  </button>
                </div>
              </Link>
              <ul
                className={`kh-profile__menu--sub-menu-block ${
                  menuToggles["user-recipe"] ? "active" : ""
                }`}
              >
                <li>
                  <Link
                    to={"/create-recipe"}
                    className={active === "New Recipe" ? "active" : ""}
                  >
                    <img
                      src="../src/assets/img/search/chefLogo.png"
                      alt="Khanchuwa Logo"
                    />
                    <span>New Recipe</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to={"/user-recipe/favorites"}
                    className={active === "Favorite Recipes" ? "active" : ""}
                  >
                    <img
                      src="../src/assets/img/search/chefLogo.png"
                      alt="Khanchuwa Logo"
                    />
                    <span>Favorite Recipes</span>
                  </Link>
                </li>
              </ul>
            </li>
            <li className="kh-profile__menu--has-sub-menu">
              <Link
                to={"/user-blog"}
                className={active === "My Blogs" ? "active" : ""}
              >
                <img
                  src="../src/assets/img/search/chefLogo.png"
                  alt="Khanchuwa Logo"
                />
                <div className="d-flex  align-items-center">
                  <span>My Blogs</span>
                  <button
                    type="button"
                    onClick={(e) => handleToggle("user-blog", e)}
                    className="menu-toggle"
                  >
                    <img
                      src="../src/assets/img/search/down.png"
                      alt="Khanchuwa Logo"
                    />
                  </button>
                </div>
              </Link>
              <ul
                className={`kh-profile__menu--sub-menu-block ${
                  menuToggles["user-blog"] ? "active" : ""
                }`}
              >
                <li>
                  <Link
                    to={"/user-blog/new"}
                    className={active === "New Blog" ? "active" : ""}
                  >
                    <img
                      src="../src/assets/img/search/chefLogo.png"
                      alt="Khanchuwa Logo"
                    />
                    <span>New Blog</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to={"/user-blog/favorites"}
                    className={active === "Favorite Blogs" ? "active" : ""}
                  >
                    <img
                      src="../src/assets/img/search/chefLogo.png"
                      alt="Khanchuwa Logo"
                    />
                    <span>Favorite Blogs</span>
                  </Link>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
}

import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { SignOut } from "./SignOut"; // Import SignOut component
import {
  FaTachometerAlt,
  FaCog,
  FaUtensils,
  FaHeart,
  FaPlus,
  FaBlog,
  FaUser,
  FaChevronDown,
} from "react-icons/fa";

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
          <h1>User Information</h1>
          <ul>
            <li>
              <Link
                to={"/profile"}
                className={active === "Dashboard" ? "active" : ""}
              >
                <FaUser />
                <span>My Information</span>
              </Link>
            </li>
            <li>
              <Link
                to={"/user-favourites"}
                className={active === "favaaaa" ? "active" : ""}
              >
                <FaUser />
                <span>Fav</span>
              </Link>
            </li>
            <li>
              <Link
                to={"/profile-edit"}
                className={active === "Settings" ? "active" : ""}
              >
                <FaCog />
                <span>Setting</span>
              </Link>
            </li>
            <li className="kh-profile__menu--has-sub-menu">
              <Link
                to={"/user-recipe"}
                className={active === "My Recipes" ? "active" : ""}
              >
                <FaUtensils />
                <div className="d-flex align-items-center">
                  <span>My Recipes</span>
                  <button
                    type="button"
                    onClick={(e) => handleToggle("user-recipe", e)}
                    className="menu-toggle"
                  >
                    <FaChevronDown />
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
                    <FaPlus />
                    <span>New Recipe</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to={"/user-recipe/favorites"}
                    className={active === "Favorite Recipes" ? "active" : ""}
                  >
                    <FaHeart />
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
                <FaBlog />
                <div className="d-flex align-items-center">
                  <span>My Blogs</span>
                  <button
                    type="button"
                    onClick={(e) => handleToggle("user-blog", e)}
                    className="menu-toggle"
                  >
                    <FaChevronDown />
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
                    to={"/create-blog"}
                    className={active === "New Blog" ? "active" : ""}
                  >
                    <FaPlus />
                    <span>New Blog</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to={"/user-blog/favorites"}
                    className={active === "Favorite Blogs" ? "active" : ""}
                  >
                    <FaHeart />
                    <span>Favorite Blogs</span>
                  </Link>
                </li>
              </ul>
            </li>
            <li>
              <SignOut type="content" />
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
}

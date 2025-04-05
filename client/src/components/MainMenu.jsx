import React from "react";
import { Link } from "react-router-dom";
import { SignOut } from "./SignOut"; // Changed to named import

export default function MainMenu({
  isMenuActive,
  toggleMenu,
  handleLinkClick,
  randomRecipeId,
  handleRandomRecipeClick,
  currentUser,
}) {
  return (
    <div className="kh-header__head--nav">
      <div
        className={`trigger ${isMenuActive ? "active" : ""}`}
        onClick={toggleMenu}
      >
        <div className="kh-header__head--ham">
          <span className="kh-header__head--line"></span>
          <span className="kh-header__head--line"></span>
          <span className="kh-header__head--line"></span>
        </div>
      </div>
      <nav
        className={`kh-header__head--menu-wrapper ${
          isMenuActive ? "active" : ""
        }`}
      >
        <div className="kh-header__head--menu-block">
          <ul>
            <li onClick={handleLinkClick}>
              <Link to={"/"}>
                <img
                  src="../src/assets/img/search/chefLogo.png"
                  alt="Khanchuwa Logo"
                />
                <span>Home</span>
              </Link>
            </li>
            <li onClick={handleLinkClick}>
              <Link to={"/recipes"}>
                <img
                  src="../src/assets/img/search/chefLogo.png"
                  alt="Khanchuwa Logo"
                />
                <span>Recipes</span>
              </Link>
            </li>
            <li onClick={handleLinkClick}>
              <Link to={"/blogs"}>
                <img
                  src="../src/assets/img/search/chefLogo.png"
                  alt="Khanchuwa Logo"
                />
                <span>Blogs</span>
              </Link>
            </li>
            <li onClick={handleLinkClick}>
              <Link to={"/cookshop"}>
                <img
                  src="../src/assets/img/search/chefLogo.png"
                  alt="Khanchuwa Logo"
                />
                <span>Cookshop</span>
              </Link>
            </li>
            <li onClick={handleLinkClick}>
              {randomRecipeId && (
                <Link
                  to={`/recipes/${randomRecipeId}`}
                  onClick={handleRandomRecipeClick}
                >
                  <img
                    src="../src/assets/img/search/chefLogo.png"
                    alt="Khanchuwa Logo"
                  />
                  <span>Random Recipe</span>
                </Link>
              )}
            </li>
            <li onClick={handleLinkClick}>
              <Link to={"/search"}>
                <img
                  src="../src/assets/img/search/chefLogo.png"
                  alt="Khanchuwa Logo"
                />
                <span>Search</span>
              </Link>
            </li>
            <li onClick={handleLinkClick}>
              <Link to={"/about"}>
                <img
                  src="../src/assets/img/search/chefLogo.png"
                  alt="Khanchuwa Logo"
                />
                <span>About Khanchuwa</span>
              </Link>
            </li>
          </ul>
        </div>
        <div className="kh-header__head--menu-block">
          <p>Account</p>
          {currentUser ? (
            <ul>
              <li onClick={handleLinkClick}>
                <Link to="/profile">
                  <img
                    src="../src/assets/img/search/chefLogo.png"
                    alt="Khanchuwa Logo"
                  />
                  <span>My Profile</span>
                </Link>
              </li>
              <li onClick={handleLinkClick}>
                <Link to={"/create-recipe"}>
                  <img
                    src="../src/assets/img/search/chefLogo.png"
                    alt="Khanchuwa Logo"
                  />
                  <span>Create Recipe</span>
                </Link>
              </li>
              <SignOut type="list" />
            </ul>
          ) : (
            <ul>
              <li onClick={handleLinkClick}>
                <Link to={"/signup"}>
                  <img
                    src="../src/assets/img/search/chefLogo.png"
                    alt="Khanchuwa Logo"
                  />
                  <span>Create Account</span>
                </Link>
              </li>
              <li onClick={handleLinkClick}>
                <Link to={"/signin"}>
                  <img
                    src="../src/assets/img/search/chefLogo.png"
                    alt="Khanchuwa Logo"
                  />
                  <span>Sign In</span>
                </Link>
              </li>
            </ul>
          )}
        </div>
        <div className="kh-header__head--menu-block">
          <p>Connect</p>
          <ul>
            <li onClick={handleLinkClick}>
              <Link to={"/whats-new"}>
                <img
                  src="../src/assets/img/search/chefLogo.png"
                  alt="Khanchuwa Logo"
                />
                <span>What’s New</span>
              </Link>
            </li>
            <li onClick={handleLinkClick}>
              <Link to={"/contact"}>
                <img
                  src="../src/assets/img/search/chefLogo.png"
                  alt="Khanchuwa Logo"
                />
                <span>Contact Us</span>
              </Link>
            </li>
          </ul>
        </div>
        <div className="kh-header__head--menu-block">
          <p>Resources</p>
          <ul>
            <li onClick={handleLinkClick}>
              <Link to={"/faq"}>
                <img
                  src="../src/assets/img/search/chefLogo.png"
                  alt="Khanchuwa Logo"
                />
                <span>FAQ</span>
              </Link>
            </li>
            <li onClick={handleLinkClick}>
              <Link to={"/site-map"}>
                <img
                  src="../src/assets/img/search/chefLogo.png"
                  alt="Khanchuwa Logo"
                />
                <span>Site Map</span>
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
}

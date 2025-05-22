import React from "react";
import { Link } from "react-router-dom";
import { SignOut } from "./SignOut"; // Changed to named import
import {
  FaHome,
  FaInfoCircle,
  FaUtensils,
  FaRandom,
  FaShoppingCart,
  FaBlog,
  FaSearch,
  FaUser,
  FaPlus,
  FaPen,
  FaSignInAlt,
  FaUserPlus,
  FaNewspaper,
  FaPhone,
  FaQuestionCircle,
  FaSitemap,
} from "react-icons/fa";

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
                <FaHome />
                <span>Home</span>
              </Link>
            </li>
            {/* <li onClick={handleLinkClick}>
              <Link to={"/about"}>
                <FaInfoCircle />
                <span>About Khanchuwa</span>
              </Link>
            </li> */}
            <li onClick={handleLinkClick}>
              <Link to={"/recipes"}>
                <FaUtensils />
                <span>Recipes</span>
              </Link>
            </li>
            <li onClick={handleLinkClick}>
              {randomRecipeId && (
                <Link
                  to={`/recipes/${randomRecipeId}`}
                  onClick={handleRandomRecipeClick}
                >
                  <FaRandom />
                  <span>Random Recipe</span>
                </Link>
              )}
            </li>
            <li onClick={handleLinkClick}>
              <Link to={"/cookshop"}>
                <FaShoppingCart />
                <span>Cookshop</span>
              </Link>
            </li>
            <li onClick={handleLinkClick}>
              <Link to={"/blogs"}>
                <FaBlog />
                <span>Blogs</span>
              </Link>
            </li>
            <li onClick={handleLinkClick}>
              <Link to={"/search"}>
                <FaSearch />
                <span>Search</span>
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
                  <FaUser />
                  <span>My Profile</span>
                </Link>
              </li>
              <li onClick={handleLinkClick}>
                <Link to={"/create-recipe"}>
                  <FaPlus />
                  <span>Add Recipe</span>
                </Link>
              </li>
              <li onClick={handleLinkClick}>
                <Link to={"/create-blog"}>
                  <FaPen />
                  <span>Food Blog</span>
                </Link>
              </li>
              <SignOut type="list" />
            </ul>
          ) : (
            <ul>
              <li onClick={handleLinkClick}>
                <Link to={"/signup"}>
                  <FaUserPlus />
                  <span>Create Account</span>
                </Link>
              </li>
              <li onClick={handleLinkClick}>
                <Link to={"/signin"}>
                  <FaSignInAlt />
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
                <FaNewspaper />
                <span>What’s New</span>
              </Link>
            </li>
            <li onClick={handleLinkClick}>
              <Link to={"/contact"}>
                <FaPhone />
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
                <FaQuestionCircle />
                <span>FAQ</span>
              </Link>
            </li>
            <li onClick={handleLinkClick}>
              <Link to={"/sitemap"}>
                <FaSitemap />
                <span>Site Map</span>
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
}

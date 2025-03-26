import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux"; // added import
import { useEffect, useState } from "react";
import { SignOut } from "./SignOut"; // Changed to named import
import { clearCart } from "../redux/user/userCart"; // ensure correct relative path

export default function Header() {
  const { currentUser } = useSelector((state) => state.user);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [isMenuActive, setIsMenuActive] = useState(false);
  const [randomRecipeId, setRandomRecipeId] = useState(null);
  const dispatch = useDispatch(); // new dispatch hook

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("searchTerm", searchTerm);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchTermFromUrl = urlParams.get("searchTerm");
    if (searchTermFromUrl) {
      setSearchTerm(searchTermFromUrl);
    }
  }, [window.location.search]);

  const fetchRandomRecipeId = async () => {
    try {
      const response = await fetch("/api/recipe/all");
      const text = await response.text(); // get raw text
      if (!text) {
        console.error("No data received from /api/recipe/all");
        return;
      }
      const data = JSON.parse(text); // parse only if text exists
      const randomIndex = Math.floor(Math.random() * data.length);
      setRandomRecipeId(data[randomIndex]._id);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
  };

  useEffect(() => {
    fetchRandomRecipeId();
    setIsMenuActive(false);
  }, []);

  const handleRandomRecipeClick = () => {
    fetchRandomRecipeId();
  };

  const toggleMenu = () => {
    setIsMenuActive(!isMenuActive);
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  // const handleSignOut = async () => {
  //   try {
  //     dispatch(signOutUserStart());
  //     const res = await fetch("/api/auth/signout");
  //     const data = await res.json();
  //     if (data.success === false) {
  //       dispatch(signOutUserFailure(data.message));
  //       return;
  //     }
  //     dispatch(signOutUserSuccess(data));
  //     navigate("/signin");
  //   } catch (error) {
  //     dispatch(signOutUserFailure(error.message));
  //   }
  // };

  const handleLinkClick = () => {
    setIsMenuActive(false);
  };

  useEffect(() => {
    const navOffsetTop = $("header").height() + 120;

    function navbarFixed() {
      if ($(".header").length) {
        $(window).scroll(function () {
          const scroll = $(window).scrollTop();
          if (scroll >= navOffsetTop) {
            $(".header").addClass("header_fixed");
          } else {
            $(".header").removeClass("header_fixed");
          }
        });
      }
    }
    navbarFixed();
  }, []);

  return (
    <header className="kh-header header">
      <div className="container-fluid">
        <div className="kh-header__wrapper">
          <div className="kh-header__head">
            <div className="kh-header__head--nav">
              <div className="trigger" onClick={toggleMenu}>
                =
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
                      <Link to={"/trending"}>
                        <img
                          src="../src/assets/img/search/chefLogo.png"
                          alt="Khanchuwa Logo"
                        />
                        <span>Trending</span>
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
                          <span>Random</span>
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
                      {/* <li onClick={handleLinkClick}>
                        <span onClick={handleSignOut}>
                          <img
                            src="../src/assets/img/search/chefLogo.png"
                            alt="Khanchuwa Logo"
                          />
                          <span>Sign Out</span>
                        </span>
                      </li> */}
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
                <div
                  className={`kh-header__head--overlay  ${
                    isMenuActive ? "active" : ""
                  }`}
                  onClick={toggleMenu}
                ></div>
              </nav>
            </div>
            <div className="kh-header__head--main-logo">
              <Link to="/" onClick={handleLinkClick}>
                <img
                  src="../src/assets/img/logoKhanchuwa.png"
                  alt="Khanchuwa Logo"
                />
              </Link>
            </div>
            <div className="kh-header__head--page-title">Current Page</div>
          </div>
          <div className="kh-header__search">
            <form
              onSubmit={handleSubmit}
              className="bg-slate-100 p-3 rounded-lg flex items-center"
            >
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent focus:outline-none w-24 sm:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button></button>
            </form>
          </div>
          <div className="kh-header__account">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <Link to="/profile" onClick={handleLinkClick}>
                  <img
                    className="rounded-full h-7 w-7 object-cover"
                    src={currentUser.avatar}
                    alt="profile"
                  />
                </Link>
                <button
                  onClick={handleClearCart}
                  className="text-xs text-red-600 hover:underline"
                >
                  Clear Cart
                </button>
              </div>
            ) : (
              <>
                <Link to="/signin" className="" onClick={handleLinkClick}>
                  Sign In
                </Link>
                <Link to="/signup" className="ml-4 " onClick={handleLinkClick}>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

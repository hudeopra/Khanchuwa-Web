import { Link, useNavigate, useLocation } from "react-router-dom"; // Import useLocation
import { useSelector, useDispatch } from "react-redux"; // added import
import { useEffect, useState } from "react";
import { SignOut } from "./SignOut"; // Changed to named import
import {
  clearCart,
  removeFromCart,
  updateCartItem,
} from "../redux/user/userCart"; // ensure correct import
import Cart from "./Cart"; // Import the new Cart component
import MainMenu from "./MainMenu"; // Add import for MainMenu
import { useAlert } from "./AlertContext"; // Import the alert context
import { FaCog, FaHeart } from "react-icons/fa"; // Import FontAwesome icons for settings and favorites

export const fetchRandomRecipeId = async () => {
  try {
    // Using mode: 'cors' to help suppress browser console errors for network failures
    const response = await fetch("/api/recipe/published", {
      mode: "cors",
      // Adding a short timeout to prevent long-hanging requests
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      // Handle non-successful responses silently
      return null;
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      // Log a user-friendly message instead of error
      console.log("No published recipes available yet");
      return null;
    }

    const randomIndex = Math.floor(Math.random() * data.length);
    return data[randomIndex];
  } catch (error) {
    // Prevent showing AbortError in console as it's expected
    if (error.name !== "AbortError") {
      // Use a more user-friendly message without stack trace
      console.log("Couldn't fetch random recipe, will try again later");
    }
    return null;
  }
};

export default function Header({ pagename }) {
  const currentUser = useSelector((state) => state.user.currentUser);
  const userCart = useSelector((state) => state.userCart);
  // derive cartItems; if userCart is missing use an empty array
  const cartItems =
    (userCart && userCart.items ? userCart.items : userCart) || [];

  useEffect(() => {
    console.log("Redux data:", { currentUser, cart: userCart });
  }, [currentUser, userCart]);

  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const location = useLocation(); // Hook to detect route changes
  const [isMenuActive, setIsMenuActive] = useState(false);
  const [randomRecipeId, setRandomRecipeId] = useState(null);
  const dispatch = useDispatch(); // new dispatch hook
  const [isCartActive, setIsCartActive] = useState(false); // New state for cart toggle
  const [isOverlayActive, setIsOverlayActive] = useState(false); // New shared state for overlay
  const { alert } = useAlert(); // Access the global alert

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

  useEffect(() => {
    const fetchRecipe = async () => {
      const recipe = await fetchRandomRecipeId();
      if (recipe) {
        setRandomRecipeId(recipe._id);
      }
    };
    fetchRecipe();
    setIsMenuActive(false);
  }, []);

  const handleRandomRecipeClick = () => {
    const fetchRecipe = async () => {
      const recipe = await fetchRandomRecipeId();
      if (recipe) {
        setRandomRecipeId(recipe._id);
      }
    };
    fetchRecipe();
  };

  const toggleMenu = () => {
    setIsMenuActive(!isMenuActive);
    setIsCartActive(false); // Ensure cart is not active
    setIsOverlayActive(!isMenuActive); // Overlay active if menu is active
  };

  const toggleCart = () => {
    setIsCartActive(!isCartActive);
    setIsMenuActive(false); // Ensure menu is not active
    setIsOverlayActive(!isCartActive); // Overlay active if cart is active
  };

  const closeOverlay = () => {
    setIsMenuActive(false);
    setIsCartActive(false);
    setIsOverlayActive(false); // Remove overlay when both are inactive
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  // Added function to remove an item from the cart via Redux
  const handleRemoveFromCart = (itemId) => {
    dispatch(removeFromCart(itemId));
  };

  const handleLinkClick = () => {
    setIsMenuActive(false);
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) return; // Prevent quantity from being less than 1
    dispatch(updateCartItem({ id: itemId, quantity: newQuantity })); // Use updateCartItem action
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

  useEffect(() => {
    setIsOverlayActive(false); // Remove overlay when route changes
  }, [location]); // Dependency on route changes

  useEffect(() => {
    const handleRouteChange = () => {
      setIsOverlayActive(false);
      setIsCartActive(false);
    };

    window.addEventListener("popstate", handleRouteChange);
    return () => {
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, []);

  return (
    <header className="kh-header header">
      <div className="container-fluid">
        <div className="kh-header__wrapper row">
          <div className="kh-header__head">
            <MainMenu
              isMenuActive={isMenuActive}
              toggleMenu={toggleMenu}
              handleLinkClick={handleLinkClick}
              randomRecipeId={randomRecipeId}
              handleRandomRecipeClick={handleRandomRecipeClick}
              currentUser={currentUser}
            />
            <div className="kh-header__head--main-logo">
              <Link to="/" onClick={handleLinkClick}>
                <img
                  src="http://localhost:5173/src/assets/img/logoKhanchuwa.png"
                  alt="Khanchuwa Logo"
                />
              </Link>
            </div>
            <div className="kh-header__head--page-title">{pagename}</div>
          </div>
          <div className="kh-header__search">
            <form onSubmit={handleSubmit} className="">
              <input
                type="text"
                placeholder="Search..."
                className=""
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={() => navigate("/recipes")} // Redirect to RecipeList page on click
              />
            </form>
          </div>
          <div className="kh-header__user">
            {currentUser ? (
              <div className="kh-header__user--profile-wrapper">
                <div className="kh-header__user--profile">
                  <Link to="/profile" onClick={handleLinkClick}>
                    <img
                      className="kh-header__user--profile-img"
                      src={currentUser?.user?.avatar || currentUser?.avatar}
                      alt="User Avatar"
                    />
                  </Link>
                </div>

                <div className="kh-header__user--cart">
                  <Cart
                    cartItems={cartItems}
                    isCartActive={isCartActive}
                    toggleCart={toggleCart}
                    handleClearCart={handleClearCart}
                    handleQuantityChange={handleQuantityChange}
                    handleRemoveFromCart={handleRemoveFromCart}
                    userCart={userCart}
                    currentUser={currentUser}
                  />
                </div>
                <div className="kh-header__user--tab">
                  <div className="kh-header__user--signout">
                    <SignOut />
                  </div>
                  <div className="kh-header__user--settings">
                    <Link to="/profile-edit" onClick={handleLinkClick}>
                      <FaCog />
                      <span className="kh-header__user--label">Settings</span>
                    </Link>
                  </div>
                  <div className="kh-header__user--favorites">
                    <Link to="/user-favourites" onClick={handleLinkClick}>
                      <FaHeart />
                      <span className="kh-header__user--label">Favorites</span>
                    </Link>
                  </div>
                  {currentUser.role === "admin" && (
                    <>
                      <div className="kh-header__user--admin-recipes">
                        <Link to="/admin/recipes" onClick={handleLinkClick}>
                          Admin Recipes
                        </Link>
                      </div>
                      <div className="kh-header__user--admin-users">
                        <Link to="/admin/users" onClick={handleLinkClick}>
                          Admin Users
                        </Link>
                      </div>
                      <div className="kh-header__user--admin-users">
                        <Link to="/admin/cookshop" onClick={handleLinkClick}>
                          Admin Cookshop
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <>
                <Link to="/signin" className="" onClick={handleLinkClick}>
                  Sign In
                </Link>
                <Link to="/signup" className=" " onClick={handleLinkClick}>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <div
        className={`kh-header__overlay ${isOverlayActive ? "active" : ""}`}
        onClick={closeOverlay}
      ></div>
    </header>
  );
}

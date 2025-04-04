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

export default function Header() {
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
      if (data.length === 0) {
        console.error("No recipes available in the data");
        return;
      }
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

  return (
    <header className="kh-header header">
      <div className="container-fluid">
        <div className="kh-header__wrapper row">
          <div className="kh-header__head">
            <div className="kh-header__head--nav">
              <MainMenu
                isMenuActive={isMenuActive}
                toggleMenu={toggleMenu}
                handleLinkClick={handleLinkClick}
                randomRecipeId={randomRecipeId}
                handleRandomRecipeClick={handleRandomRecipeClick}
                currentUser={currentUser}
              />
            </div>
            <div className="kh-header__head--main-logo">
              <Link to="/" onClick={handleLinkClick}>
                <img
                  src="../src/assets/img/logoKhanchuwa.png"
                  alt="Khanchuwa Logo"
                />
              </Link>
            </div>
            {/* <div className="kh-header__head--page-title">Current Page</div> */}
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
                <div className="kh-header__user--tab">
                  <Link to="/profile" onClick={handleLinkClick}>
                    <img
                      className="rounded-full h-7 w-7 object-cover"
                      src={
                        currentUser?.user?.avatar ||
                        currentUser?.avatar ||
                        defaultAvatar
                      }
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
                  />
                </div>
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
      <div
        className={`kh-header__overlay ${isOverlayActive ? "active" : ""}`}
        onClick={closeOverlay}
      ></div>
    </header>
  );
}

import { Link, useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";

export default function Header() {
  const { currentUser } = useSelector((state) => state.user);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [isMenuActive, setIsMenuActive] = useState(false);

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

  const toggleMenu = () => {
    setIsMenuActive(!isMenuActive);
  };

  return (
    <header className="kh-header">
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
                  <p></p>
                  <ul>
                    <li>
                      <img
                        src="../src/assets/img/search/chefLogo.png"
                        alt="Khanchuwa Logo"
                      />
                      <span>Home</span>
                    </li>
                    <li>
                      <img
                        src="../src/assets/img/search/chefLogo.png"
                        alt="Khanchuwa Logo"
                      />
                      <span>Recipes</span>
                    </li>
                    <li>
                      <img
                        src="../src/assets/img/search/chefLogo.png"
                        alt="Khanchuwa Logo"
                      />
                      <span>Trending</span>
                    </li>
                    <li>
                      <img
                        src="../src/assets/img/search/chefLogo.png"
                        alt="Khanchuwa Logo"
                      />
                      <span>Random</span>
                    </li>
                    <li>
                      <img
                        src="../src/assets/img/search/chefLogo.png"
                        alt="Khanchuwa Logo"
                      />
                      <span>Search</span>
                    </li>
                    <li>
                      <img
                        src="../src/assets/img/search/chefLogo.png"
                        alt="Khanchuwa Logo"
                      />
                      <span>About Khanchuwa</span>
                    </li>
                  </ul>
                </div>
                <div className="kh-header__head--menu-block">
                  <p>Account</p>
                  {currentUser ? (
                    <ul>
                      <li>
                        <img
                          src="../src/assets/img/search/chefLogo.png"
                          alt="Khanchuwa Logo"
                        />
                        <span>My Profile</span>
                      </li>
                      <li>
                        <img
                          src="../src/assets/img/search/chefLogo.png"
                          alt="Khanchuwa Logo"
                        />
                        <span>My Recipe</span>
                      </li>
                      <li>
                        <img
                          src="../src/assets/img/search/chefLogo.png"
                          alt="Khanchuwa Logo"
                        />
                        <span>Sign Out</span>
                      </li>
                    </ul>
                  ) : (
                    <ul>
                      <li>
                        <img
                          src="../src/assets/img/search/chefLogo.png"
                          alt="Khanchuwa Logo"
                        />
                        <span>Create Account</span>
                      </li>
                      <li>
                        <img
                          src="../src/assets/img/search/chefLogo.png"
                          alt="Khanchuwa Logo"
                        />
                        <span>Sign In</span>
                      </li>
                    </ul>
                  )}
                </div>
                <div className="kh-header__head--menu-block">
                  <p>Connect</p>
                  <ul>
                    <li>
                      <img
                        src="../src/assets/img/search/chefLogo.png"
                        alt="Khanchuwa Logo"
                      />
                      <span>What’s New</span>
                    </li>
                    <li>
                      <img
                        src="../src/assets/img/search/chefLogo.png"
                        alt="Khanchuwa Logo"
                      />
                      <span>Contact Us</span>
                    </li>
                  </ul>
                </div>
                <div className="kh-header__head--menu-block">
                  <p>Resources</p>
                  <ul>
                    <li>
                      <img
                        src="../src/assets/img/search/chefLogo.png"
                        alt="Khanchuwa Logo"
                      />
                      <span>FAQ</span>
                    </li>
                    <li>
                      <img
                        src="../src/assets/img/search/chefLogo.png"
                        alt="Khanchuwa Logo"
                      />
                      <span>Site Map</span>
                    </li>
                  </ul>
                </div>
              </nav>
            </div>
            <div className="kh-header__head--main-logo">
              <Link to="/">
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
              <button>
                <FaSearch className="text-slate-600" />
              </button>
            </form>
          </div>
          <div className="kh-header__account">
            {currentUser ? (
              <Link to="/profile">
                <img
                  className="rounded-full h-7 w-7 object-cover"
                  src={currentUser.avatar}
                  alt="profile"
                />
              </Link>
            ) : (
              <>
                <Link to="/signin" className="text-slate-700 hover:underline">
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="text-slate-700 hover:underline ml-4"
                >
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

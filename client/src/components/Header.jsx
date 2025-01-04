import { Link } from "react-router-dom";
import { FaSearch, FaShoppingCart, FaClipboardList } from "react-icons/fa";
import { useSelector } from "react-redux";

export default function Header() {
  const { currentUser } = useSelector((state) => state.user);
  console.log(currentUser);
  return (
    <header className="kh-header bg-slate-200">
      <div className="container flex justify-between">
        <div className="kh-header__logo">
          <Link to="/">
            <img src="" alt="Main Logo" />
          </Link>
        </div>
        <div className="kh-header__hmenu">
          <nav>
            <ul className="flex justify-around">
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/about">About</Link>
              </li>
              <li>
                {currentUser ? (
                  <div className="kh-header__user__logged-in">
                    <Link to="/profile">
                      <img
                        src={currentUser.user.avatar}
                        alt="User Profile Pic"
                      />
                      <span>
                        {" "}
                        {currentUser.user.username
                          .split(" ")[0]
                          .charAt(0)
                          .toUpperCase() +
                          currentUser.user.username.split(" ")[0].slice(1)}
                      </span>
                    </Link>
                  </div>
                ) : (
                  <Link to="/signin">SignIn</Link>
                )}
              </li>
            </ul>
          </nav>
        </div>
        <div className="icon flex">
          <FaSearch />
          <FaShoppingCart className="ml-4" />
          <FaClipboardList className="ml-4" />
        </div>
      </div>
    </header>
  );
}

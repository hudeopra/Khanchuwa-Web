import { Link } from "react-router-dom";
import { FaSearch, FaShoppingCart, FaClipboardList } from "react-icons/fa";

export default function Header() {
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
                <Link to="/profile">Profile</Link>
              </li>
              <li>
                <Link to="/signin">Sign In</Link>
              </li>
              <li>
                <Link to="/signout">Sign Out</Link>
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

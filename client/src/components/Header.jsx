import { Link, useNavigate } from "react-router-dom";
import { FaSearch, FaShoppingCart, FaClipboardList } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";

export default function Header() {
  const { currentUser } = useSelector((state) => state.user);
  useEffect(() => {
    console.log("Current User Data:", currentUser);
  }, [currentUser]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("searchTerm", searchTerm);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get("searchTerm");
    if (searchTermFromUrl) {
      setSearchTerm(searchTermFromUrl);
    }
  }, [location.search]);

  const user = currentUser?.user || currentUser;
  const avatar = user?.avatar;
  const username = user?.username;

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
                <Link to="/profile">
                  {user ? (
                    <div>
                      <img
                        className="rounded-full h-7 w-7 object-cover"
                        src={avatar}
                        alt="profile"
                      />
                      <span>{username}</span>
                    </div>
                  ) : (
                    <span className="text-slate-700 hover:underline">
                      Sign in
                    </span>
                  )}
                </Link>
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

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa"; // Import FontAwesome icons

import OAuth from "../components/OAuth";

export default function SignUp() {
  const [userData, setUserData] = useState({
    // username: "",
    // email: "",
    // password: "",
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate("/");
    }
  }, [currentUser]);

  const handleChange = (e) => {
    setUserData({
      ...userData,
      [e.target.id]: e.target.value,
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Regex patterns
    const usernameRegex = /^[a-zA-Z0-9_]{3,15}$/; // Alphanumeric, 3-15 chars
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email format
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/; // Min 8 chars, 1 letter, 1 number

    // Validation
    if (!usernameRegex.test(userData.username)) {
      setError("Username must be 3-15 characters and alphanumeric.");
      return;
    }
    if (!emailRegex.test(userData.email)) {
      setError("Invalid email format. Please enter a valid email address.");
      return;
    }
    if (!passwordRegex.test(userData.password)) {
      let passwordError =
        "Password must be at least 8 characters long, include at least one letter and one number.";
      if (userData.password.length < 8) {
        passwordError =
          "Password is too short. It must be at least 8 characters long.";
      } else if (!/[A-Za-z]/.test(userData.password)) {
        passwordError = "Password must include at least one letter.";
      } else if (!/\d/.test(userData.password)) {
        passwordError = "Password must include at least one number.";
      }
      setError(passwordError);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      console.log("SignUp: ", data);
      if (data.success === false) {
        setLoading(false);
        setError(data.message);
        return;
      }
      setLoading(false);
      setError(null);
      navigate("/signin");
    } catch (error) {
      setLoading(false);
      setError(error.message);
    }
  };

  return (
    <main className="kh-signup">
      <div className="container">
        <div className="col-12 ">
          <h1>Sign Up</h1>
          <form
            onSubmit={handleSubmit}
            className="kh-signup__form kh-form flex gap-5 p-12 "
          >
            <div className="kh-signup__input-wrapper">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                onChange={handleChange}
              />
            </div>
            <div className="kh-signup__input-wrapper">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                onChange={handleChange}
              />
            </div>
            <div className="kh-signup__input-wrapper">
              <label htmlFor="password">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-3"
                >
                  {showPassword ? (
                    <FaRegEyeSlash className="w-6 h-6" />
                  ) : (
                    <FaRegEye className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>
            <button disabled={loading}>
              {loading ? "Loading..." : "Sign Up"}
            </button>
            {/* <OAuth /> */}
          </form>
          <div className="kh-signup__gotacc">
            <p>
              Already have an account?
              <Link to="/signin">Sign In</Link>
            </p>
          </div>
          {error && <p className="">{error}</p>}
        </div>
      </div>
    </main>
  );
}

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa"; // Import FontAwesome icons
import { useAlert } from "../components/AlertContext"; // Import useAlert hook

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
  const [invalidFields, setInvalidFields] = useState({
    username: false,
    email: false,
    password: false,
  });
  const navigate = useNavigate();
  const { showAlert } = useAlert(); // Initialize useAlert hook

  const handleChange = (e) => {
    setUserData({
      ...userData,
      [e.target.id]: e.target.value,
    });

    // Clear the invalid state for this field when user types
    if (invalidFields[e.target.id]) {
      setInvalidFields((prev) => ({
        ...prev,
        [e.target.id]: false,
      }));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset validation state
    setInvalidFields({
      username: false,
      email: false,
      password: false,
    });

    // Username validation with improved user-friendly messages with examples
    if (!userData.username || userData.username.trim() === "") {
      showAlert("warning", "Please enter a username");
      setInvalidFields((prev) => ({ ...prev, username: true }));
      return;
    } else {
      const usernameLength = userData.username.length;
      const containsNumbers = /[0-9]/.test(userData.username);
      const containsSpecialChars = /[^a-zA-Z0-9]/.test(userData.username);
      const containsUppercase = /[A-Z]/.test(userData.username);

      if (usernameLength < 3) {
        showAlert(
          "warning",
          "Username is too short (minimum 3 characters). Examples: tom, ana, sam"
        );
        setInvalidFields((prev) => ({ ...prev, username: true }));
        return;
      } else if (usernameLength > 15) {
        showAlert(
          "warning",
          "Username is too long (maximum 15 characters). Try something shorter like 'robert' instead of 'robertjohnsonsmith'"
        );
        setInvalidFields((prev) => ({ ...prev, username: true }));
        return;
      } else if (containsNumbers) {
        showAlert(
          "warning",
          "Username should not contain numbers. Use 'robert' instead of 'robert123'"
        );
        setInvalidFields((prev) => ({ ...prev, username: true }));
        return;
      } else if (containsSpecialChars) {
        showAlert(
          "warning",
          "Username should not contain special characters (@, #, $, %, &, *, etc). Use 'robert' instead of 'robert@smith'"
        );
        setInvalidFields((prev) => ({ ...prev, username: true }));
        return;
      } else if (containsUppercase) {
        showAlert(
          "warning",
          "Username should be all lowercase. Use 'robert' instead of 'Robert' or 'ROBERT'"
        );
        setInvalidFields((prev) => ({ ...prev, username: true }));
        return;
      }
    }

    // Email validation with improved user-friendly messages
    if (!userData.email || userData.email.trim() === "") {
      showAlert("warning", "Please enter an email address");
      setInvalidFields((prev) => ({ ...prev, email: true }));
      return;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        showAlert(
          "warning",
          "Please enter a valid email address (e.g., name@example.com)"
        );
        setInvalidFields((prev) => ({ ...prev, email: true }));
        return;
      }
    }

    // Password validation with improved user-friendly messages and examples
    if (!userData.password) {
      showAlert("warning", "Please enter a password");
      setInvalidFields((prev) => ({ ...prev, password: true }));
      return;
    } else {
      const passwordLength = userData.password.length;
      const containsLetter = /[A-Za-z]/.test(userData.password);
      const containsNumber = /\d/.test(userData.password);

      if (passwordLength < 8) {
        showAlert(
          "warning",
          "Password is too short (minimum 8 characters). Example: sunshine2023"
        );
        setInvalidFields((prev) => ({ ...prev, password: true }));
        return;
      } else if (!containsLetter) {
        showAlert(
          "warning",
          "Password must include at least one letter. Example: recipe123 instead of 12345678"
        );
        setInvalidFields((prev) => ({ ...prev, password: true }));
        return;
      } else if (!containsNumber) {
        showAlert(
          "warning",
          "Password must include at least one number. Example: khanchuwa2 instead of khanchuwa"
        );
        setInvalidFields((prev) => ({ ...prev, password: true }));
        return;
      }
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

        // Check for specific error patterns and provide user-friendly messages
        if (data.message && data.message.includes("duplicate key error")) {
          // Handle duplicate key errors
          if (data.message.includes("username_1 dup key")) {
            showAlert(
              "warning",
              "This username is already taken. Please choose a different username."
            );
            setInvalidFields((prev) => ({ ...prev, username: true }));
          } else if (data.message.includes("email_1 dup key")) {
            showAlert(
              "warning",
              "An account with this email already exists. Please use a different email or sign in."
            );
            setInvalidFields((prev) => ({ ...prev, email: true }));
          } else {
            // Generic duplicate key error
            showAlert(
              "warning",
              "This account already exists. Please try a different username or email."
            );
          }
        } else if (data.statusCode === 500) {
          showAlert(
            "error",
            "Something went wrong on our servers. Please try again later."
          );
        } else {
          // For other error messages
          showAlert(
            "error",
            data.message || "Failed to create account. Please try again."
          );
        }
        return;
      }
      setLoading(false);
      showAlert("success", "Sign up successful! Please sign in.");
      navigate("/signin");
    } catch (error) {
      setLoading(false);
      showAlert(
        "error",
        "Connection error. Please check your internet connection and try again."
      );
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
            <div
              className={`kh-signup__input-wrapper ${
                invalidFields.username ? "invalid" : ""
              }`}
            >
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                onChange={handleChange}
              />
            </div>
            <div
              className={`kh-signup__input-wrapper ${
                invalidFields.email ? "invalid" : ""
              }`}
            >
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                onChange={handleChange}
              />
            </div>
            <div
              className={`kh-signup__input-wrapper ${
                invalidFields.password ? "invalid" : ""
              }`}
            >
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
        </div>
      </div>
    </main>
  );
}

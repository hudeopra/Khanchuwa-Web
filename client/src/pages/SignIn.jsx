import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux"; //importing from usersSlice
import {
  signInStart,
  signInSuccess,
  signInFailure,
} from "../redux/user/userSlice.js";
import OAuth from "../components/OAuth.jsx";
import { useAlert } from "../components/AlertContext"; // Import the alert context
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa"; // Import FontAwesome icons

export default function SignIn() {
  const { showAlert } = useAlert(); // Access the showAlert function
  const [userData, setUserData] = useState({});
  const [showPassword, setShowPassword] = useState(false); // State for password visibility
  const [invalidFields, setInvalidFields] = useState({
    email: false,
    password: false,
  });
  // name of the userslice is user
  const { loading, error, currentUser } = useSelector((state) => state.user);

  // initialize useNavigate
  const navigate = useNavigate();

  // initialize userDispatch
  const dispatch = useDispatch();

  useEffect(() => {
    if (currentUser) {
      navigate("/");
    }
  }, [currentUser]);

  const handleChange = (e) => {
    setUserData({
      ...userData, // Spread Operator: Copies the existing form data (userData) into a new object
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
    e.preventDefault(); // prevents the default form submission

    // Reset validation state
    setInvalidFields({
      email: false,
      password: false,
    });

    // Email validation with improved user-friendly messages and examples
    if (!userData.email || userData.email.trim() === "") {
      dispatch(signInFailure("Please enter an email address"));
      showAlert("warning", "Please enter an email address");
      setInvalidFields((prev) => ({ ...prev, email: true }));
      return;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        dispatch(signInFailure("Invalid email format"));
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
      dispatch(signInFailure("Please enter a password"));
      showAlert("warning", "Please enter a password");
      setInvalidFields((prev) => ({ ...prev, password: true }));
      return;
    } else {
      const passwordLength = userData.password.length;
      const containsLetter = /[A-Za-z]/.test(userData.password);
      const containsNumber = /\d/.test(userData.password);

      if (passwordLength < 8) {
        const errorMsg =
          "Password is too short (minimum 8 characters). Example: sunshine2023";
        dispatch(signInFailure(errorMsg));
        showAlert("warning", errorMsg);
        setInvalidFields((prev) => ({ ...prev, password: true }));
        return;
      } else if (!containsLetter) {
        const errorMsg =
          "Password must include at least one letter. Example: recipe123 instead of 12345678";
        dispatch(signInFailure(errorMsg));
        showAlert("warning", errorMsg);
        setInvalidFields((prev) => ({ ...prev, password: true }));
        return;
      } else if (!containsNumber) {
        const errorMsg =
          "Password must include at least one number. Example: khanchuwa2 instead of khanchuwa";
        dispatch(signInFailure(errorMsg));
        showAlert("warning", errorMsg);
        setInvalidFields((prev) => ({ ...prev, password: true }));
        return;
      }
    }

    try {
      dispatch(signInStart()); // setLoading(true);
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
      const signinResData = await res.json();

      console.log("SignIn: ", signinResData);

      if (signinResData.success === false) {
        dispatch(signInFailure(signinResData.message));
        showAlert("error", signinResData.message); // Show error alert
        return;
      }
      dispatch(signInSuccess(signinResData));
      showAlert("success", "Signed in successfully!"); // Show success alert
      navigate("/");
    } catch (error) {
      dispatch(signInFailure(error.message));
      showAlert("error", error.message); // Show error alert
    }

    //   if (!res.ok) {
    //     const errorData = await res.json();
    //     dispatch(signInFailure(errorData.message)); // setLoading(false); // setError(data.message);
    //     console.error("SignIn.jsx: Error response", errorData); // Log error response
    //     return;
    //   }

    //   const data = await res.json();
    //   dispatch(signInSuccess(data.user)); // setLoading(false); // setError(null);
    //   navigate("/");
    // } catch (error) {
    //   dispatch(signInFailure(error.message)); // setLoading(false); setError(error.message);
    //   console.error("SignIn.jsx: Fetch error", error); // Log fetch error
    // }
  };
  console.log("SignIn: ", userData); // SignIn form data
  return (
    <main className="kh-signin">
      <div className="container">
        <div className="col-12 col-sm-10 col-md-8 col-lg-6 mx-auto ">
          <h1>Sign In</h1>
          <form
            onSubmit={handleSubmit} // Ensure the form is making a POST request
            className="kh-signin__form kh-form flex gap-5 p-12 "
          >
            <div
              className={`kh-signin__input-wrapper ${
                invalidFields.email ? "invalid" : ""
              }`}
            >
              <label htmlFor="email">Email</label>
              <input
                type="email"
                placeholder="Email"
                id="email"
                name="email" // Corrected name
                onChange={handleChange}
              />
            </div>
            <div
              className={`kh-signin__input-wrapper ${
                invalidFields.password ? "invalid" : ""
              }`}
            >
              <label htmlFor="password">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password" // Corrected name
                  placeholder="Password"
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
            <div className="kh-sigin__half">
              <button disabled={loading}>
                {loading ? "Loading..." : "SignIn"}
              </button>
              {/* <OAuth /> */}
            </div>
          </form>
          <div className="kh-signin__gotacc">
            <p>
              Dont have an account?
              <Link to="/SignUp">Sign Up</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

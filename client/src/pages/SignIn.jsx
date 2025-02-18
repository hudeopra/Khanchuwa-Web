import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux"; //importing from usersSlice
import {
  signInStart,
  signInSuccess,
  signInFailure,
} from "../redux/user/userSlice.js";
import OAuth from "../components/OAuth.jsx";

export default function SignIn() {
  const [userData, setUserData] = useState({});
  // name of the userslice is user
  const { loading, error } = useSelector((state) => state.user);

  // initialize useNavigate
  const navigate = useNavigate();

  // initialize userDispatch
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setUserData({
      ...userData, // Spread Operator: Copies the existing form data (userData) into a new object
      [e.target.id]: e.target.value,
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault(); // prevents the default form submission
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
        return;
      }
      dispatch(signInSuccess(signinResData));
      navigate("/");
    } catch (error) {
      dispatch(signInFailure(error.message));
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
    <section className="kh-signin">
      <h1>Sign In</h1>
      <form
        onSubmit={handleSubmit} // Ensure the form is making a POST request
        className="kh-signin__form kh-form flex gap-5 p-12 border"
      >
        <div className="kh-signin__input-wrapper">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            placeholder="Email"
            id="email"
            name="email" // Corrected name
            onChange={handleChange}
          />
        </div>
        <div className="kh-signin__input-wrapper">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password" // Corrected name
            placeholder="Password"
            onChange={handleChange}
          />
        </div>
        <button disabled={loading}>{loading ? "Loading..." : "SignIn"}</button>
        <OAuth />
      </form>
      <div className="kh-signin__gotacc">
        <p>
          Dont have an account?
          <Link to="/SignUp">Sign Up</Link>
        </p>
      </div>
      {error && <p className="">{error}</p>}
    </section>
  );
}

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  signUpStart,
  signUpSuccess,
  signUpFailure,
} from "../redux/user/userSlice.js";

export default function SignUp() {
  const [signUpData, setSignUpData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const { loading, error } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setSignUpData({
      ...signUpData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(signUpStart());
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signUpData),
      });
      const data = await res.json();

      if (!res.ok) {
        dispatch(signUpFailure(data.message));
        console.error("SignUp.jsx: Error response", data);
        return;
      }

      dispatch(signUpSuccess(data.user));
      navigate("/signin");
    } catch (error) {
      dispatch(signUpFailure(error.message));
      console.error("SignUp.jsx: Fetch error", error);
    }
  };

  return (
    <section className="kh-signup">
      <h1>Sign Up</h1>
      <form
        onSubmit={handleSubmit}
        className="kh-signup__form kh-form flex gap-5 p-12 border"
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
          <input type="email" id="email" name="email" onChange={handleChange} />
        </div>
        <div className="kh-signup__input-wrapper">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            onChange={handleChange}
          />
        </div>
        <button disabled={loading}>{loading ? "Loading..." : "Sign Up"}</button>
      </form>
      <div className="kh-signup__gotacc">
        <p>
          Already have an account?
          <Link to="/signin">Sign In</Link>
        </p>
      </div>
      {error && <p className="">{error}</p>}
    </section>
  );
}

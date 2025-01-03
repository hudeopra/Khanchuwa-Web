import { set } from "mongoose";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import OAuth from "../components/OAuth.jsx";

export default function SignUp() {
  const [signUpData, setSignUpData] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleChange = (e) => {
    setSignUpData({
      ...signUpData, // Spread Operator: Copies the existing form data (signUpData) into a new object
      [e.target.id]: e.target.value,
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault(); // prevents the default form submission
    try {
      setLoading(true);
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signUpData),
      });
      const data = await res.json();

      if (data.success === false) {
        setLoading(false);
        setError(data.message);
        return;
      }
      setLoading(false);
      setError(null);
      navigate("/signIn");
    } catch (error) {
      setLoading(false);
      setError(error.message);
    }
  };
  console.log(signUpData);
  return (
    <section className="kh-signup">
      <form
        onSubmit={handleSubmit} // Ensure the form is making a POST request
        className="kh-signup__form kh-form flex gap-5 p-12 border"
      >
        <div className="kh-signup__input-wrapper">
          <label htmlFor="username">UserName</label>
          <input
            type="text"
            id="username"
            name="username" // Corrected name
            onChange={handleChange}
          />
        </div>
        <div className="kh-signup__input-wrapper">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email" // Corrected name
            placeholder="example@email.com"
            onChange={handleChange}
          />
        </div>
        <div className="kh-signup__input-wrapper">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password" // Corrected name
            placeholder="Password"
            onChange={handleChange}
          />
        </div>
        <button disabled={loading}>{loading ? "Loading..." : "SignUp"}</button>
      </form>
      <div className="kh-signup__gotacc">
        <p>
          Already have an account?
          <Link to="/SignIn">Sign In</Link>
        </p>
        <OAuth />
      </div>
      {error && <p className="">{error}</p>}
    </section>
  );
}

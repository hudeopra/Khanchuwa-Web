import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import OAuth from "../components/OAuth";

export default function SignUp() {
  const [userData, setUserData] = useState({
    // username: "",
    // email: "",
    // password: "",
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setUserData({
      ...userData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    //   if (!res.ok) {
    //     dispatch(signUpFailure(data.message));
    //     console.error("SignUp.jsx: Error response", data);
    //     return;
    //   }

    //   dispatch(signUpSuccess(data.user));
    //   navigate("/signin");
    // } catch (error) {
    //   dispatch(signUpFailure(error.message));
    //   console.error("SignUp.jsx: Fetch error", error);
    // }
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
              <input
                type="password"
                id="password"
                name="password"
                onChange={handleChange}
              />
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

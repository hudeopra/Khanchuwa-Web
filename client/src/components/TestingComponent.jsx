import React from "react";
import { useSelector } from "react-redux";

const TestingComponent = () => {
  const username = useSelector(
    (state) => state.user.currentUser?.fullname.split(" ")[0] || "Guest"
  ); // Extract first word or fallback to "Guest"
  console.log("Redux username:", username); // Log updated username

  return (
    <div className="container py-5 my-5">
      <div className="row justify-content-center">
        <div className="col-10">
          <div className="hero py-5 my-5">
            <div className="hero py-5">
              <h1>Hungry? {username}</h1>
              <p>what are you in mood of... wanna take a chance? </p>
              <p>
                why cook? <span></span>
              </p>
              <ul>
                <li>healthy</li>
                <li>cheap</li>
                <li>made with love</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestingComponent;

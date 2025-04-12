import React from "react";
import {
  signOutUserStart,
  signOutUserSuccess,
  signOutUserFailure,
} from "../redux/user/userSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useAlert } from "./AlertContext"; // Import the alert context

export const SignOut = ({ handleLinkClick, type = "list", txt = true }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showAlert } = useAlert(); // Access the showAlert function

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      const res = await fetch("/api/auth/signout");
      const data = await res.json();
      if (data.success === false) {
        dispatch(signOutUserFailure(data.message));
        showAlert("error", data.message); // Pass error to Header
        return;
      }
      dispatch(signOutUserSuccess(data));
      showAlert("success", "Signed out successfully!"); // Pass success to Header
      navigate("/signin");
    } catch (error) {
      dispatch(signOutUserFailure(error.message));
      showAlert("error", error.message); // Pass error to Header
    }
  };

  const content = (
    <span className="d-flex" onClick={handleSignOut}>
      <img src="../src/assets/img/search/logout.png" alt="Khanchuwa Logo" />
      {txt !== false && <span>Sign Out</span>} {/* Conditionally render text */}
    </span>
  );

  if (type === "list") {
    return <li>{content}</li>;
  } else if (type === "content") {
    return content; // Render content directly
  } else {
    return (
      <button
        onClick={() => {
          handleSignOut();
        }}
      >
        {content}
      </button>
    );
  }
};

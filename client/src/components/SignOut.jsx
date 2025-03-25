import React from "react";
import {
  signOutUserStart,
  signOutUserSuccess,
  signOutUserFailure,
} from "../redux/user/userSlice";
import { useDispatch } from "react-redux";

export const SignOut = ({ handleLinkClick, type = "list" }) => {
  const dispatch = useDispatch(); // Use useDispatch

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      const res = await fetch("/api/auth/signout");
      const data = await res.json();
      if (data.success === false) {
        dispatch(signOutUserFailure(data.message));
        return;
      }
      dispatch(signOutUserSuccess(data));
      navigate("/signin");
    } catch (error) {
      dispatch(signOutUserFailure(error.message));
    }
  };

  const content = (
    <span onClick={handleSignOut}>
      <img src="../src/assets/img/search/chefLogo.png" alt="Khanchuwa Logo" />
      <span>Sign Out</span>
    </span>
  );

  if (type === "list") {
    return <li>{content}</li>;
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

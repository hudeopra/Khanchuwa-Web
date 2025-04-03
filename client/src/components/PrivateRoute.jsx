import React from 'react'
import { useSelector } from "react-redux";
import { Outlet, Navigate } from "react-router-dom";

export default function PrivateRoute() {

  // getting current user
  const { currentUser } = useSelector((state) => state.user);
  // console.log(currentUser);
  return currentUser ? <Outlet /> : <Navigate to="/signin"/>;
}

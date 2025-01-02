import React from "react";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { app } from "../firebase";
import { useDispatch } from "react-redux";
import { signInSuccess } from "../redux/user/userSlice";
import { useNavigate } from "react-router-dom";

// Google User Authentication
export default function OAuth() {

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleGoogleClick = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const auth = getAuth(app);

      const authResult = await signInWithPopup(auth, provider);
      const authGres = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: authResult.user.displayName, 
          email: authResult.user.email, 
          photo: authResult.user.photoURL }),
      })
      const authGData = await authGres.json();
      dispatch(signInSuccess(authGData))
      // console.log(authResult); // authResult for verfifcation

      navigate("/");
    } catch (error) {
      console.log("OAuth: Could not sign in with Google", error);
      console.error("Error details:", error.message); // Added detailed error logging
    }
  };

  return (
    <button
      onClick={handleGoogleClick}
      type="button"
      className="bg-red-700 text-white p-3 rounded-lg uppercase hover:opacity-90"
    >
      Continue With Google
    </button>
  );
}

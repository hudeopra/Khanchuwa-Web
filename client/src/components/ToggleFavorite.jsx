import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAlert } from "./AlertContext";

const ToggleFavorite = ({ recipeId }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const dispatch = useDispatch();
  const { showAlert } = useAlert();
  const userData = useSelector((state) => state.user);

  useEffect(() => {
    // Check if the recipeId exists in the user's favorite recipes
    const isFav = userData.currentUser?.userFavRecipe?.includes(recipeId);
    setIsFavorite(isFav || false);
  }, [userData, recipeId]);

  const handleToggleFavorite = async () => {
    try {
      const res = await fetch(`/api/user/favorite/${recipeId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      console.log("Toggle favorite response:", data);

      if (res.ok) {
        const updatedUserRes = await fetch("/api/user/current", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        const updatedUserData = await updatedUserRes.json();
        if (updatedUserRes.ok) {
          dispatch({
            type: "user/updateUserSuccess",
            payload: updatedUserData,
          });
          setIsFavorite((prev) => !prev);
          showAlert("success", data.message || "Favorite status updated!");
        } else {
          console.error(
            "Failed to fetch updated user data:",
            updatedUserData.message
          );
          showAlert("error", "Failed to update favorite status.");
        }
      } else {
        console.error("Failed to toggle favorite:", data.message);
        showAlert("error", data.message || "Failed to toggle favorite.");
      }
    } catch (error) {
      console.error("Error toggling favorite:", error.message);
      showAlert("error", "An error occurred while toggling favorite.");
    }
  };

  return (
    <div className="kh-togglefav">
      <svg
        onClick={handleToggleFavorite}
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        width="512"
        height="512"
        x="0"
        y="0"
        viewBox="0 0 682.667 682.667"
        style={{ enableBackground: "new 0 0 512 512" }}
        xmlSpace="preserve"
        className="w-6 h-6 cursor-pointer"
      >
        <g>
          <defs>
            <clipPath id="a" clipPathUnits="userSpaceOnUse">
              <path
                d="M0 512h512V0H0Z"
                fill="#fffffff"
                opacity="1"
                data-original="#fffffff"
              ></path>
            </clipPath>
          </defs>
          <g
            clipPath="url(#a)"
            transform="matrix(1.33333 0 0 -1.33333 0 682.667)"
          >
            <path
              d="M0 0a32.144 32.144 0 0 1-22.734-9.415 32.111 32.111 0 0 1-9.4-22.718v-427.904c0-12.13 9.801-21.963 21.931-21.963h.081a24.334 24.334 0 0 1 17.271 7.182c21.288 21.272 84.109 84.093 110.057 109.992 7.23 7.27 17.11 11.359 27.394 11.359 10.283 0 20.164-4.089 27.393-11.359 26.028-25.98 89.17-89.106 110.218-110.185 4.498-4.475 10.522-6.989 16.869-6.989 12.292 0 22.253 9.954 22.253 22.236v427.631A32.114 32.114 0 0 1 289.199 0Z"
              style={{
                strokeWidth: 30,
                strokeLinecap: "round",
                strokeLinejoin: "round",
                strokeMiterlimit: 10,
                strokeDasharray: "none",
                strokeOpacity: 1,
              }}
              transform="translate(111.4 497)"
              fill={isFavorite ? "#e66120" : "none"}
              stroke={isFavorite ? "white" : "#e66120"}
              strokeWidth="30"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeMiterlimit="10"
              strokeDasharray="none"
              strokeOpacity=""
              data-original="#fffffff"
              className=""
            ></path>
          </g>
        </g>
      </svg>
    </div>
  );
};

export default ToggleFavorite;

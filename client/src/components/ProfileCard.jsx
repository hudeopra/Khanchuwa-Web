import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { FaInstagramSquare, FaYoutube, FaTiktok } from "react-icons/fa";

export default function ProfileCard() {
  const [user, setUser] = useState(null);
  const location = useLocation(); // Track route changes

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/user/current", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch user data");
        const data = await res.json();
        setUser(data);
      } catch (error) {
        console.error(error.message);
      }
    };

    fetchUser();
  }, [location]); // Re-fetch data on route change

  if (!user) return <p>Loading...</p>;

  // Helper function to check if array is empty or undefined
  const isEmpty = (array) => {
    return !array || array.length === 0;
  };

  // Helper function to format array data for display
  const formatArrayData = (array) => {
    if (isEmpty(array)) return "None";
    return array.join(", ");
  };

  // Get role background color based on user role
  const getRoleBackgroundColor = (role) => {
    switch (role) {
      case "admin":
        return "#999";
      case "creator":
        return "#666";
      case "user":
      default:
        return "#333";
    }
  };

  // Check if the preferences section should be displayed
  const hasPreferences =
    user.preferences &&
    (!isEmpty(user.preferences.dietaryRestrictions) ||
      !isEmpty(user.preferences.allergies) ||
      !isEmpty(user.preferences.cuisineTags) ||
      !isEmpty(user.preferences.flavourTag));

  return (
    <div className="kh-profile-card ">
      <div className="kh-profile-card__head">
        <div className="kh-profile-card__head--content">
          <div className="kh-profile-card__head--content--item">
            {user.socialMedia && user.socialMedia.length > 0 && (
              <div className="kh-profile-card__content--item kh-profile-card__content--social">
                <div className="kh-profile-card__social-icons">
                  {user.socialMedia.map((social, index) => {
                    // Filter to only show YouTube, TikTok, and Instagram
                    if (
                      !["youtube", "tiktok", "instagram"].includes(
                        social.platform.toLowerCase()
                      )
                    ) {
                      return null;
                    }

                    // Determine the appropriate icon component based on platform
                    let IconComponent = null;
                    switch (social.platform.toLowerCase()) {
                      case "instagram":
                        IconComponent = FaInstagramSquare;
                        break;
                      case "youtube":
                        IconComponent = FaYoutube;
                        break;
                      case "tiktok":
                        IconComponent = FaTiktok;
                        break;
                      default:
                        return null; // Skip any other platforms
                    }

                    return (
                      <a
                        key={index}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="kh-profile-card__social-link"
                        title={social.platform}
                      >
                        <IconComponent />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <div className="kh-profile-card__head--content--item">
            {user.role && (
              <div className="kh-profile-card__tab--item">
                <p>
                  <strong></strong>
                  <span
                    className="user-role-badge"
                    style={{
                      backgroundColor: getRoleBackgroundColor(user.role),
                      padding: "3px 10px",
                      borderRadius: "4px",
                      color: "#fff",
                      display: "inline-block",
                      marginLeft: "5px",
                    }}
                  >
                    {user.role}
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="kh-profile-card__user">
        <div className="kh-profile-card__user--img">
          {user.avatar && (
            <img src={user.avatar} alt="Avatar" className="profile-avatar" />
          )}
        </div>
        <div className="kh-profile-card__user--info">
          <div className="kh-profile-card__user--data"></div>

          {user.userStatus && (
            <span
              className="user-status-badge"
              style={{
                backgroundColor:
                  user.userStatus === "ACTIVE"
                    ? "#28a745" // green
                    : user.userStatus === "INACTIVE"
                    ? "#f8f9fa" // white
                    : user.userStatus === "BANNED"
                    ? "#ffc107" // yellow
                    : user.userStatus === "WARNED"
                    ? "#dc3545" // red
                    : "#6c757d", // default gray
                color: user.userStatus === "INACTIVE" ? "#212529" : "#fff",
                padding: "3px 10px",
                borderRadius: "4px",
                display: "inline-block",
                marginRight: "10px",
                fontSize: "0.8rem",
              }}
            >
              {/* {user.userStatus} */}
            </span>
          )}
          {user.fullname && <h2>{user.fullname}</h2>}
          <span>@{user.username}</span>
          <div className="kh-profile-card__user--bio">
            {user.bio && (
              <div className="kh-profile-card__tab--item">
                <h6>Bio:</h6>
                <p>{user.bio}</p>

                {user.email && <p>{user.email}</p>}
                {user.address && <p>{user.address}</p>}
                {user.phoneNumber && (
                  <div className="kh-profile__tab--item">
                    <p>{user.phoneNumber}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="kh-profile-card__content">
        <div className="kh-profile-card__content--item kh-profile-card__content--preferences ">
          {hasPreferences && (
            <div className="kh-profile-card__tab--item ">
              <h4>
                <strong>User Preferences:</strong>
              </h4>
              <div className="kh-profile-card__content--preferences-item">
                {!isEmpty(user.preferences.dietaryRestrictions) && (
                  <div>
                    <strong>Dietary Restrictions:</strong>
                    <ul>
                      {user.preferences.dietaryRestrictions.map(
                        (restriction, index) => (
                          <li key={`restriction-${index}`}>{restriction}</li>
                        )
                      )}
                    </ul>
                  </div>
                )}
                {!isEmpty(user.preferences.allergies) && (
                  <div>
                    <strong>Allergies:</strong>
                    <ul>
                      {user.preferences.allergies.map((allergy, index) => (
                        <li key={`allergy-${index}`}>{allergy}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {!isEmpty(user.preferences.cuisineTags) && (
                  <div>
                    <strong>Cuisines:</strong>
                    <ul>
                      {user.preferences.cuisineTags.map((cuisine, index) => (
                        <li key={`cuisine-${index}`}>{cuisine}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {!isEmpty(user.preferences.flavourTag) && (
                  <div>
                    <strong>Flavors:</strong>
                    <ul>
                      {user.preferences.flavourTag.map((flavor, index) => (
                        <li key={`flavor-${index}`}>{flavor}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="kh-profile-card__content--item  kh-profile-card__content--details">
          <div>
            {user.recipelimit !== undefined && user.role !== "user" && (
              <div className="kh-profile-card__tab--item">
                <p>
                  <strong>New Recipe:</strong> {user.recipelimit} Left
                </p>
              </div>
            )}
            {user.userFavRecipe && user.userFavRecipe.length > 0 && (
              <div className="kh-profile-card__tab--item">
                <p>
                  <strong>Favorite Recipes:</strong>{" "}
                  <Link to="/user-favourites">{user.userFavRecipe.length}</Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

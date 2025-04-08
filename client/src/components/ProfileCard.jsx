import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";

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

  return (
    <div className="kh-profile__tab--card-wrapper">
      {/* <div className="kh-profile__tab--setting">
        <Link to={"/profile-edit"}>
          <span>
            <img
              src="../src/assets/img/search/signout.png"
              alt="Khanchuwa Logo"
            />
          </span>
        </Link>
      </div> */}
      <div className="kh-profile__tab--wrapper kh-profile__tab--id-card">
        <div className="kh-profile__tab--item">
          <img src={user.avatar} alt="Avatar" className="profile-avatar" />
        </div>
        <div className="kh-profile__tab--user-info">
          {user.fullname && <h2>{user.fullname}</h2>}
          <span>@{user.username}</span>

          {user.bio && (
            <div className="kh-profile__tab--item">
              <p> {user.bio}</p>
            </div>
          )}
          <div className="kh-profile__tab--wrapper kh-profile__tab--user-details">
            {/*{user.email && (
              <div className="kh-profile__tab--item">
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
              </div>
            )}
             {user.dateOfBirth && (
              <div className="kh-profile__tab--item">
                <p>
                  <strong>Date Of Birth:</strong>{" "}
                  {new Date(user.dateOfBirth).toLocaleDateString("en-US", {
                    month: "short",
                    day: "2-digit",
                  })}
                </p>
              </div>
            )} */}
            <div className="kh-profile__tab--item">
              {user.gender && (
                <p>
                  <strong>Gender:</strong> {user.gender}
                </p>
              )}
            </div>
            {/* <div className="kh-profile__tab--item">
              {user.updatedAt && (
                <p>
                  <strong>Last Updated:</strong>{" "}
                  <span className="">
                    {(() => {
                      const updatedAt = new Date(user.updatedAt);
                      const now = new Date();
                      const diffInSeconds = Math.floor(
                        (now - updatedAt) / 1000
                      );

                      if (diffInSeconds < 60)
                        return `${diffInSeconds} second${
                          diffInSeconds !== 1 ? "s" : ""
                        } ago`;
                      const diffInMinutes = Math.floor(diffInSeconds / 60);
                      if (diffInMinutes < 60)
                        return `${diffInMinutes} minute${
                          diffInMinutes !== 1 ? "s" : ""
                        } ago`;
                      const diffInHours = Math.floor(diffInMinutes / 60);
                      if (diffInHours < 24)
                        return `${diffInHours} hour${
                          diffInHours !== 1 ? "s" : ""
                        } ago`;
                      const diffInDays = Math.floor(diffInHours / 24);
                      if (diffInDays < 7)
                        return `${diffInDays} day${
                          diffInDays !== 1 ? "s" : ""
                        } ago`;
                      const diffInWeeks = Math.floor(diffInDays / 7);
                      if (diffInWeeks < 4)
                        return `${diffInWeeks} week${
                          diffInWeeks !== 1 ? "s" : ""
                        } ago`;
                      const diffInMonths = Math.floor(diffInDays / 30);
                      if (diffInMonths < 12)
                        return `${diffInMonths} month${
                          diffInMonths !== 1 ? "s" : ""
                        } ago`;
                      const diffInYears = Math.floor(diffInMonths / 12);
                      return `${diffInYears} year${
                        diffInYears !== 1 ? "s" : ""
                      } ago`;
                    })()}
                  </span>
                </p>
              )}
            </div> */}
          </div>
        </div>
        <div className="kh-profile__tab--item">
          {user.role && (
            <p>
              <strong>Role:</strong> {user.role}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

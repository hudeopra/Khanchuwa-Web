import React from "react";
import { Link } from "react-router-dom";

export default function UserBlogFive({ recentBlogs }) {
  return (
    <div className="kh-profile__posts row">
      <div className="col-12 ">
        <h2>My Blogs</h2>
        <Link to={`/user-blog`} className="btn btn-edit">
          View All Blogs
        </Link>
      </div>
      {recentBlogs.length > 0 ? (
        recentBlogs.map((blog) => (
          <div className="col-6">
            <div key={blog._id} className="kh-profile__post">
              <Link to={`/blogs/${blog._id}`}>
                <div className="kh-profile__item--content">
                  <div className="kh-profile__item--details">
                    <h4>{blog.blogtitle}</h4>
                  </div>
                </div>
                <span className="kh-profile__post--uptime">
                  {(() => {
                    const updatedAt = new Date(blog.updatedAt);
                    const now = new Date();
                    const diffInSeconds = Math.floor((now - updatedAt) / 1000);

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
              </Link>
              <Link to={`/blog/edit/${blog._id}`} className="btn btn-edit">
                Edit
              </Link>
            </div>
          </div>
        ))
      ) : (
        <p>No recent blogs.</p>
      )}
    </div>
  );
}

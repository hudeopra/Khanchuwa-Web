import React from "react";
import { Link } from "react-router-dom";

export default function UserBlogFive({ recentBlogs }) {
  return (
    <div className="kh-blog-post">
      <h2>Recent Blogs</h2>
      <Link to={`/user-blog`} className="btn btn-edit">
        View All Blogs
      </Link>
      {recentBlogs.length > 0 ? (
        recentBlogs.map((blog) => (
          <div key={blog._id} className="blog-block">
            <div className="blog-block-wrapper">
              <h3>{blog.blogtitle}</h3>
              <p>{blog.blogtype}</p>
            </div>
            <Link to={`/blog/edit/${blog._id}`} className="btn btn-edit">
              Edit
            </Link>
          </div>
        ))
      ) : (
        <p>No recent blogs.</p>
      )}
    </div>
  );
}

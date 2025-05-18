import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import ProfileNav from "../components/ProfileNav";

export default function UserBlog() {
  const { currentUser } = useSelector((state) => state.user);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (currentUser) {
      const user = currentUser.user || currentUser;
      const userId = user._id;
      fetch(`http://localhost:3000/api/blog/user/${userId}`)
        .then((res) => {
          if (!res.ok) {
            return res.text().then((text) => {
              throw new Error(`Fetch error: ${res.status} ${text}`);
            });
          }
          return res.json();
        })
        .then((data) => {
          if (data.success) {
            setBlogs(data.blogs);
            console.log("User Blogs: ", data.blogs);
          }
        })
        .catch((error) => setError(error.message))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  if (loading) return <p>Loading blogs...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <main className="kh-profile">
      <div className="container">
        <div className="row">
          <div className="col-3">
            <ProfileNav active="My Blogs" subActive={true} />
          </div>
          <div className="col-8">
            <h1 className="text-3xl font-semibold text-center my-7">
              My Blogs
            </h1>
            {blogs.length === 0 ? (
              <p>No blogs found.</p>
            ) : (
              <div className="row">
                {blogs.map((blog) => (
                  <div key={blog._id} className="col-6 col-mg-3 col-lg-4">
                    <div className="blog-block-wrapper">
                      <h4 className="font-semibold text-lg">
                        {blog.blogtitle}
                      </h4>
                      <p className="text-sm text-gray-600">
                        <strong>Author:</strong> {blog.author}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Type:</strong> {blog.blogtype}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Quote:</strong> {blog.blogquote}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Short Description:</strong>{" "}
                        {blog.shortDescription}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Created At:</strong>{" "}
                        {new Date(blog.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Updated At:</strong>{" "}
                        {new Date(blog.updatedAt).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Body:</strong> {blog.blogBody}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Recipe Favorites:</strong> {blog.recipeFav}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Tags:</strong>
                      </p>
                      <ul className="list-disc ml-5">
                        <li>
                          <strong>Cuisine:</strong>{" "}
                          {blog.cuisineTag.map((tag) => tag.$oid).join(", ")}
                        </li>
                        <li>
                          <strong>Flavour:</strong>{" "}
                          {blog.flavourTag.map((tag) => tag.$oid).join(", ")}
                        </li>
                        <li>
                          <strong>Ingredients:</strong>{" "}
                          {blog.ingredientTag.map((tag) => tag.$oid).join(", ")}
                        </li>
                      </ul>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Link
                        to={`/blogs/${blog._id}`}
                        className="btn btn-view text-blue-500"
                      >
                        View Blog
                      </Link>
                      <Link
                        to={`/blog/edit/${blog._id}`}
                        className="btn btn-edit text-green-500"
                      >
                        Edit Blog
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

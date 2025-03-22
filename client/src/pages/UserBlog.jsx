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
    async function fetchBlogs() {
      try {
        const res = await fetch("/api/blog/all");
        const data = await res.json();
        // Filter blogs created by the current user
        const userBlogs = data.filter(
          (blog) => blog.userRef === currentUser.user._id
        );
        setBlogs(userBlogs);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (currentUser) fetchBlogs();
  }, [currentUser]);

  if (loading) return <p>Loading blogs...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <main className="">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {blogs.map((blog) => (
                  <div key={blog._id} className="border p-4 rounded-lg">
                    <img
                      src={blog.imageUrl}
                      alt={blog.blogtitle}
                      className="w-full h-40 object-cover rounded"
                    />
                    <h2 className="mt-2 font-semibold">{blog.blogtitle}</h2>
                    <p className="text-sm">{blog.shortDescription}</p>
                    <div className="flex gap-2">
                      <Link className="text-blue-500" to={`/blogs/${blog._id}`}>
                        View Blog
                      </Link>
                      <Link
                        className="text-green-500"
                        to={`/blog/edit/${blog._id}`}
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

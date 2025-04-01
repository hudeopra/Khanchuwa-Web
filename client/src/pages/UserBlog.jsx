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
      fetch(`http://localhost:3000/api/blog/user/${userId}?limit=5`)
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
            setBlogs(data.blogs || []);
            console.log("User Blogs: ", data.blogs);
          }
        })
        .catch((error) => {
          console.error(error);
          setError(error.message); // Set error state
        })
        .finally(() => {
          setLoading(false); // Ensure loading is set to false
        });
    } else {
      setLoading(false); // Handle case where currentUser is not defined
    }
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

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import ConfirmDelete from "../components/ConfirmDelete";

const backupBannerUrl =
  "https://www.gstatic.com/mobilesdk/240923_mobilesdk/CloudFirestore-Discovery.png";

export default function BlogDetail() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentRating, setCommentRating] = useState("");
  const [commentText, setCommentText] = useState("");
  const [commentError, setCommentError] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // State for current user
  const navigate = useNavigate();
  const userData = useSelector((state) => state.user);
  console.log("BlogDetail - current user data:", userData);
  const currentUserId =
    userData.currentUser?._id || userData.currentUser?.user?._id;

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch("/api/user/current", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch current user");
        const data = await res.json();
        setCurrentUser(data);
      } catch (error) {
        console.error("Error fetching current user:", error.message);
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await fetch(`/api/blog/${id}`);
        const contentType = res.headers.get("content-type");
        let data;
        if (contentType && contentType.includes("application/json")) {
          data = await res.json();
        } else {
          const text = await res.text();
          throw new Error(text);
        }
        if (res.ok) {
          console.log("Fetched blog data:", data);
          setBlog(data.blog); // Ensure we are setting the correct property from the response
        } else if (res.status === 404) {
          navigate("/blogs"); // Redirect to /blogs if not found
        } else {
          setError(data.message || "Unexpected error");
        }
      } catch (err) {
        console.error("Error fetching blog:", err.message);
        if (err.message.includes("404")) {
          navigate("/blogs"); // Redirect to /blogs if not found
        } else {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/blog/comment/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userData.currentUser._id,
          rating: commentRating,
          comment: commentText,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCommentError(data.message || "Failed to add comment");
      } else {
        setBlog({ ...blog, reviews: data.reviews });
        setCommentRating("");
        setCommentText("");
        setCommentError(null);
      }
    } catch (err) {
      setCommentError(err.message);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <main className="kh-blog-detail">
      <div className="container">
        {/* Blog Header */}
        <h1>{blog.blogtitle || "N/A"}</h1>
        <img
          src={blog.bannerImgUrl || backupBannerUrl}
          alt="Blog Banner"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = backupBannerUrl;
          }}
          className="rounded-lg"
        />
        <p>By: {blog.author || "N/A"}</p>

        {/* Blog Content */}
        <section className="my-4">
          <div>{blog.content || "No content available."}</div>
        </section>

        {/* Blog Details */}
        <section className="my-4">
          <h2>Blog Details</h2>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
            {JSON.stringify(blog, null, 2)}
          </pre>
        </section>

        {/* Comments Section */}
        <section className="my-4">
          <h2>Comments</h2>
          {blog.reviews && blog.reviews.length > 0 ? (
            blog.reviews.map((rev, idx) => (
              <div key={idx} className="border p-2 my-2">
                <p>
                  <strong>Rating:</strong> {rev.rating}
                </p>
                <p>{rev.comment}</p>
              </div>
            ))
          ) : (
            <p>No comments yet.</p>
          )}
        </section>

        {/* Add Comment */}
        {userData.currentUser && (
          <form onSubmit={handleCommentSubmit} className="border p-4 my-4">
            <h3>Add a Comment</h3>
            <label htmlFor="commentRating">Rating:</label>
            <input
              type="number"
              id="commentRating"
              value={commentRating}
              onChange={(e) => setCommentRating(e.target.value)}
              required
              className="border p-2 my-2 block"
            />
            <label htmlFor="commentText">Comment:</label>
            <textarea
              id="commentText"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              required
              className="border p-2 my-2 block"
            />
            {commentError && (
              <p className="text-red-700 text-sm">{commentError}</p>
            )}
            <button
              type="submit"
              className="p-3 bg-blue-600 text-white rounded-lg hover:opacity-90"
            >
              Submit Comment
            </button>
          </form>
        )}

        {/* Edit and Delete Options for the Author */}
        {currentUser?._id === blog.userRef && (
          <div className="my-4">
            <button
              onClick={() => navigate(`/blog/edit/${id}`)}
              className="p-3 bg-blue-600 text-white rounded-lg hover:opacity-90"
            >
              Edit Blog
            </button>
            <button
              onClick={() => setShowDeleteConfirmation(true)}
              className="ml-4 p-3 bg-red-600 text-white rounded-lg hover:opacity-90"
            >
              Delete Blog
            </button>
          </div>
        )}

        {showDeleteConfirmation && (
          <ConfirmDelete
            deleteType="blog"
            deleteId={id}
            deleteApi="/api/blog/delete"
            redirectPath="/blogs"
          />
        )}
      </div>
    </main>
  );
}

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

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
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");
  const [deleteError, setDeleteError] = useState(null);
  const navigate = useNavigate();
  const userData = useSelector((state) => state.user);
  console.log("BlogDetail - current user data:", userData);
  const currentUserId =
    userData.currentUser?._id || userData.currentUser?.user?._id;

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
          setBlog(data);
        } else {
          setError(data.message || "Unexpected error");
        }
      } catch (err) {
        setError(err.message);
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

  const handleDeleteBlog = async (e) => {
    e.preventDefault();
    if (deleteConfirmInput !== "DELETE") {
      setDeleteError('Please type "DELETE" to confirm.');
      return;
    }
    try {
      const res = await fetch(`/api/blog/delete/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) {
        setDeleteError(data.message || "Deletion failed");
      } else {
        navigate("/blogs");
      }
    } catch (err) {
      setDeleteError(err.message);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <main className="container py-5">
      {/* Blog Header */}
      <header>
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
      </header>

      {/* Blog Content */}
      <section className="my-4">
        <div>{blog.content || "No content available."}</div>
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
      {currentUserId && String(blog.userRef) === String(currentUserId) && (
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
        <form onSubmit={handleDeleteBlog} className="border p-4 my-4">
          <h3>Confirm Deletion</h3>
          <p>Type "DELETE" to permanently remove this blog.</p>
          <input
            type="text"
            value={deleteConfirmInput}
            onChange={(e) => setDeleteConfirmInput(e.target.value)}
            required
            className="border p-2 my-2 block"
          />
          {deleteError && <p className="text-red-700 text-sm">{deleteError}</p>}
          <div className="flex gap-4">
            <button
              type="submit"
              className="p-3 bg-red-600 text-white rounded-lg hover:opacity-90"
            >
              Confirm Delete
            </button>
            <button
              type="button"
              onClick={() => {
                setShowDeleteConfirmation(false);
                setDeleteError(null);
                setDeleteConfirmInput("");
              }}
              className="p-3 bg-gray-400 text-white rounded-lg hover:opacity-90"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </main>
  );
}

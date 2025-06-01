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
        if (res.status === 403) {
          setCommentError("Blog owners cannot comment on their own blogs");
        } else if (res.status === 409) {
          setCommentError("You have already commented on this blog");
        } else {
          setCommentError(data.message || "Failed to add comment");
        }
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
        </section>{" "}
        {/* Comments Section */}
        <section className="kh-comments mb-5">
          <div className="kh-comments__header">
            <h2>Comments</h2>
            <span className="kh-comments__count">
              {blog.reviews ? blog.reviews.length : 0}
            </span>
          </div>

          <div className="kh-comments__list">
            {blog.reviews && blog.reviews.length > 0 ? (
              blog.reviews.map((rev, idx) => (
                <div key={idx} className="kh-comment">
                  <div className="kh-comment__header">
                    <div className="kh-comment__rating">
                      <div className="kh-comment__stars">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`kh-comment__star ${
                              i < rev.rating
                                ? "kh-comment__star--filled"
                                : "kh-comment__star--empty"
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="kh-comment__rating-text">
                        {rev.rating}/5
                      </span>
                    </div>
                  </div>
                  <p className="kh-comment__text">{rev.comment}</p>
                </div>
              ))
            ) : (
              <div className="kh-comments__empty">
                <div className="kh-comments__empty-icon">💬</div>
                <p>No comments yet. Be the first to share your thoughts!</p>
              </div>
            )}
          </div>
        </section>{" "}
        {/* Add Comment Form */}
        {userData.currentUser &&
          (() => {
            const currentUserId =
              userData.currentUser._id || userData.currentUser?.user?._id;
            const isBlogOwner = blog?.userRef === currentUserId;
            const hasAlreadyCommented = blog?.reviews?.some(
              (review) =>
                review.user === currentUserId ||
                review.user?._id === currentUserId
            );

            // Don't show form if user is blog owner or has already commented
            if (isBlogOwner) {
              return (
                <div className="kh-comment-form kh-comment-form--disabled">
                  <div className="kh-comment-form__header">
                    <h3 className="kh-comment-form__title">
                      Comments Not Available
                    </h3>
                    <p className="kh-comment-form__subtitle">
                      📝 Blog owners cannot comment on their own blogs
                    </p>
                  </div>
                </div>
              );
            }

            if (hasAlreadyCommented) {
              return (
                <div className="kh-comment-form kh-comment-form--disabled">
                  <div className="kh-comment-form__header">
                    <h3 className="kh-comment-form__title">Thank You!</h3>
                    <p className="kh-comment-form__subtitle">
                      ✅ You have already shared your thoughts on this blog
                    </p>
                  </div>
                </div>
              );
            }

            // Show normal comment form
            return (
              <div className="kh-comment-form">
                <div className="kh-comment-form__header">
                  <h3 className="kh-comment-form__title">
                    Share Your Thoughts
                  </h3>
                  <p className="kh-comment-form__subtitle">
                    Your feedback helps other readers discover great content
                  </p>
                </div>

                <form onSubmit={handleCommentSubmit}>
                  <div className="kh-comment-form__fields">
                    <div className="kh-comment-form__field">
                      <label
                        htmlFor="commentRating"
                        className="kh-comment-form__label"
                      >
                        Your Rating
                      </label>
                      <select
                        id="commentRating"
                        value={commentRating}
                        onChange={(e) => setCommentRating(e.target.value)}
                        required
                        className="kh-comment-form__select"
                      >
                        <option value="">Select Rating</option>
                        <option value="1">★ Poor</option>
                        <option value="2">★★ Fair</option>
                        <option value="3">★★★ Good</option>
                        <option value="4">★★★★ Very Good</option>
                        <option value="5">★★★★★ Excellent</option>
                      </select>
                    </div>

                    <div className="kh-comment-form__field">
                      <label
                        htmlFor="commentText"
                        className="kh-comment-form__label"
                      >
                        Your Comment
                      </label>
                      <textarea
                        id="commentText"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        required
                        placeholder="Share your thoughts about this blog post..."
                        className="kh-comment-form__textarea"
                      />
                    </div>
                  </div>

                  {commentError && (
                    <div className="kh-comment-form__error">{commentError}</div>
                  )}

                  <button type="submit" className="kh-comment-form__submit">
                    <span className="kh-comment-form__submit-icon">💬</span>
                    <span>Submit Comment</span>
                  </button>
                </form>
              </div>
            );
          })()}
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

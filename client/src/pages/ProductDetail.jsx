import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux"; // unchanged
import { addToCart } from "../redux/user/userCart"; // added import

const backupImageUrl = "https://cdn-icons-png.flaticon.com/512/219/219969.png";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentRating, setCommentRating] = useState("");
  const [commentText, setCommentText] = useState("");
  const [commentError, setCommentError] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");
  const [deleteError, setDeleteError] = useState(null);
  const [quantity, setQuantity] = useState(1); // new state for quantity
  const navigate = useNavigate();
  const userData = useSelector((state) => state.user);
  const userCart = useSelector((state) => state.userCart); // added selector
  const currentUserId =
    userData.currentUser?._id || userData.currentUser?.user?._id;
  const dispatch = useDispatch(); // new dispatch hook

  // Log redux data whenever user or cart changes
  React.useEffect(() => {
    console.log("Redux Data:", { user: userData, cart: userCart });
  }, [userData, userCart]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/shop/${id}`);
        const data = await res.json();
        if (res.ok) {
          setProduct(data);
          console.log(data);
        } else {
          setError(data.message || "Unexpected error");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    const rating = Number(commentRating);
    if (isNaN(rating) || rating < 0 || rating > 5) {
      setCommentError("Rating must be a number between 0 and 5");
      console.error("Invalid rating value submitted:", commentRating);
      return;
    }
    try {
      const res = await fetch(`/api/shop/comment/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUserId,
          rating, // using validated rating
          comment: commentText,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCommentError(data.message || "Failed to add review");
        console.error("Error adding review:", data);
      } else {
        setProduct({ ...product, reviews: data.reviews });
        setCommentRating("");
        setCommentText("");
        setCommentError(null);
      }
    } catch (err) {
      console.error("Exception in handleCommentSubmit:", err);
      setCommentError(err.message);
    }
  };

  const handleDeleteProduct = async (e) => {
    e.preventDefault();
    if (deleteConfirmInput !== "DELETE") {
      setDeleteError('Please type "DELETE" to confirm.');
      return;
    }
    try {
      const res = await fetch(`/api/shop/delete/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) {
        setDeleteError(data.message || "Deletion failed");
      } else {
        navigate("/products");
      }
    } catch (err) {
      setDeleteError(err.message);
    }
  };

  // New handlers for quantity controls and adding to cart
  const handleIncrease = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleDecrease = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  // Updated handler to pass the price as well
  const handleAddToCart = () => {
    if (product) {
      console.log(
        "Adding product with _id:",
        product._id,
        "and price:",
        product.price
      );
      dispatch(
        addToCart({
          _id: product._id,
          productName: product.productName,
          quantity,
          price: product.price, // confirm price is passed
        })
      );
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <main className="container py-5">
      {/* Product Header */}
      <header>
        <h1>{product.productName || "N/A"}</h1>
        <img
          src={(product.images && product.images[0]) || backupImageUrl}
          alt="Product"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = backupImageUrl;
          }}
          className="rounded-lg"
        />
        <p>Price: {product.price ? `$${product.price}` : "N/A"}</p>
        <p>Stock: {product.stock || 0}</p>
        {/* New Purchase Section */}
        <div className="my-4">
          <h2>Purchase</h2>
          <div className="flex items-center gap-2">
            <button onClick={handleDecrease} className="p-2 border">
              -
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              min="1"
              className="w-16 p-2 border text-center"
            />
            <button onClick={handleIncrease} className="p-2 border">
              +
            </button>
          </div>
          <button
            onClick={handleAddToCart}
            className="mt-2 p-3 bg-green-600 text-white rounded-lg hover:opacity-90"
          >
            Add to Cart
          </button>
        </div>
      </header>

      {/* Product Description */}
      <section className="my-4">
        <h2>Description</h2>
        <p>{product.description || "No description available."}</p>
      </section>

      {/* Reviews Section */}
      <section className="my-4">
        <h2>Reviews</h2>
        {product.reviews && product.reviews.length > 0 ? (
          product.reviews.map((rev, idx) => (
            <div key={idx} className="border p-2 my-2">
              <p>
                <strong>Rating:</strong> {rev.rating}
              </p>
              <p>{rev.comment}</p>
            </div>
          ))
        ) : (
          <p>No reviews yet.</p>
        )}
      </section>

      {/* Add Review Form */}
      {userData.currentUser && (
        <form onSubmit={handleCommentSubmit} className="border p-4 my-4">
          <h3>Add a Review</h3>
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
            Submit Review
          </button>
        </form>
      )}

      {/* Edit and Delete Options for Seller */}
      {currentUserId && String(product.seller) === String(currentUserId) && (
        <div className="my-4">
          <button
            onClick={() => navigate(`/product/edit/${id}`)}
            className="p-3 bg-blue-600 text-white rounded-lg hover:opacity-90"
          >
            Edit Product
          </button>
          <button
            onClick={() => setShowDeleteConfirmation(true)}
            className="ml-4 p-3 bg-red-600 text-white rounded-lg hover:opacity-90"
          >
            Delete Product
          </button>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirmation && (
        <form onSubmit={handleDeleteProduct} className="border p-4 my-4">
          <h3>Confirm Deletion</h3>
          <p>Type "DELETE" to permanently remove this product.</p>
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

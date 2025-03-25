import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

export default function UserProduct() {
  const { currentUser } = useSelector((state) => state.user);
  const userId = currentUser?._id || currentUser?.user?._id;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userId) {
      fetch(`/api/shop/user/${userId}`)
        .then((res) => res.json())
        .then((data) => {
          setProducts(data.shops || data);
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [userId]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    try {
      const res = await fetch(`/api/shop/delete/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Deletion failed");
      } else {
        setProducts((prev) => prev.filter((product) => product._id !== id));
      }
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <main className="container py-5">
      <h1>User Products</h1>
      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        // Corrected ul element: product items are now correctly nested inside the ul
        <ul className="product-list">
          {products.map((product) => (
            <li key={product._id}>
              <Link to={`/products/${product._id}`}>
                <h2>{product.productName}</h2>
                <p>{product.description}</p>
                <p>Price: {product.price ? `$${product.price}` : "N/A"}</p>
              </Link>
              <div className="flex gap-2 mt-2">
                <Link
                  to={`/product/edit/${product._id}`}
                  className="text-blue-500"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(product._id)}
                  className="text-red-500"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

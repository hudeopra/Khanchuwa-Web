import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../redux/user/userCart";

export default function ShopList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantities, setQuantities] = useState({});
  const dispatch = useDispatch();

  // Use the entire user slice directly (updated to match RecipeDetail.jsx)
  const userData = useSelector((state) => state.user);

  // Changed from state.cart to state.userCart
  const userCart = useSelector((state) => state.userCart);

  useEffect(() => {
    console.log("Full Redux user slice:", userData);
    console.log("Full Redux cart slice:", userCart);
    console.log("Redux Data:", {
      currentUser: userData.currentUser,
      cart: userCart,
    });
  }, [userData, userCart]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`/api/shop/all`);
        const data = await res.json();
        setProducts(data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleIncrease = (id) => {
    setQuantities((prev) => ({ ...prev, [id]: (prev[id] || 1) + 1 }));
  };

  const handleDecrease = (id) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) - 1),
    }));
  };

  const handleAddToCart = (product) => {
    const quantity = quantities[product._id] || 1;
    // Debug payload to verify correct data
    const payload = {
      _id: product._id,
      productName: product.productName,
      quantity,
      price: product.price,
    };
    console.log("Adding to cart with payload:", payload);
    dispatch(addToCart(payload));
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <main className="kh-shop-list">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <h1 className="text-3xl font-semibold text-center my-7">
              All Products
            </h1>
          </div>
          {products.map((product) => (
            <div
              key={product._id}
              className="col-12 col-lg-3 col-md-4 col-sm-6 mb-3"
            >
              <div className="kh-product-block__item mb-3">
                <Link to={`/products/${product._id}`}>
                  <div className="kh-product-block__content">
                    <h3>{product.productName}</h3>
                    <p>{product.description}</p>
                    <span>Price: ${product.price}</span>
                  </div>
                  <div className="kh-product-block__item--img">
                    <img src={product.imageUrl} alt={product.productName} />
                  </div>
                </Link>
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDecrease(product._id)}
                      className="p-2 border"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantities[product._id] || 1}
                      onChange={(e) =>
                        setQuantities({
                          ...quantities,
                          [product._id]: Number(e.target.value),
                        })
                      }
                      min="1"
                      className="w-16 p-2 border text-center"
                    />
                    <button
                      onClick={() => handleIncrease(product._id)}
                      className="p-2 border"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="mt-2 p-3 bg-green-600 text-white rounded-lg hover:opacity-90"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux"; // Import useDispatch
import { addToCart } from "../redux/user/userCart"; // Import addToCart action

const TagDetail = () => {
  const { id, tagType } = useParams(); // Get the tag ID and tagType from the URL
  const [tag, setTag] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1); // State for quantity
  const dispatch = useDispatch(); // Initialize dispatch

  useEffect(() => {
    const fetchTag = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/tag/${tagType}/${id}`,
          {
            headers: { "Content-Type": "application/json" }, // Add headers if needed
          }
        );
        if (!response.ok) throw new Error("Failed to fetch tag details");
        const data = await response.json();
        setTag(data);

        // Fetch recipes and blogs based on references
        const recipeFetches = data.recipeRefs.map((refId) => {
          return fetch(`http://localhost:3000/api/recipe/${refId}`, {
            headers: { "Content-Type": "application/json" },
          })
            .then(async (res) => {
              const contentType = res.headers.get("content-type");
              let recipeData;
              if (contentType && contentType.includes("application/json")) {
                recipeData = await res.json();
              } else {
                const text = await res.text();
                throw new Error(text);
              }
              if (!res.ok) {
                console.error(
                  `Error fetching recipe ${refId}:`,
                  res.status,
                  res.statusText
                );
                return null;
              }
              return recipeData;
            })
            .catch((err) => {
              console.error(`Fetch error for recipe ${refId}:`, err);
              return null;
            });
        });

        const blogFetches = data.blogRefs.map((refId) => {
          return fetch(`http://localhost:3000/api/blog/${refId}`, {
            headers: { "Content-Type": "application/json" },
          })
            .then((res) => {
              if (!res.ok) {
                console.error(
                  `Error fetching blog ${refId}:`,
                  res.status,
                  res.statusText
                );
                return null;
              }
              return res.json();
            })
            .catch((err) => {
              console.error(`Fetch error for blog ${refId}:`, err);
              return null;
            });
        });

        const [fetchedRecipes, fetchedBlogs] = await Promise.all([
          Promise.all(recipeFetches),
          Promise.all(blogFetches),
        ]);

        setRecipes(fetchedRecipes.filter((recipe) => recipe)); // Filter out null values
        if (fetchedRecipes.filter((recipe) => !recipe).length > 0) {
          console.warn("Some recipes could not be fetched.");
        }

        setBlogs(fetchedBlogs.filter((blog) => blog)); // Filter out null values
        if (fetchedBlogs.filter((blog) => !blog).length > 0) {
          console.warn("Some blogs could not be fetched.");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTag();
  }, [id, tagType]); // Add tagType to the dependency array

  const handleAddToCart = () => {
    if (tag) {
      dispatch(
        addToCart({
          _id: tag._id,
          productName: tag.name,
          quantity,
          price: tag.disPrice || tag.mrkPrice || 0, // Use discounted price if available
        })
      );
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!tag) return <div>No tag found.</div>;

  return (
    <main className="kh-tag-detail-page">
      <section className="container">
        <div className="row">
          <div className="col-12">
            <h1>{tag.name}</h1>
            <p>
              <strong>Type:</strong> {tag.tagType}
            </p>
            <p>
              <strong>Used in Recipes:</strong> {tag.usedIn.recipe}
            </p>
            <p>
              <strong>Used in Blogs:</strong> {tag.usedIn.blog}
            </p>
            {tag.equipmentRefs && (
              <p>
                <strong>Equipment References:</strong>{" "}
                {tag.equipmentRefs.length}
              </p>
            )}
            {tag.favImg && (
              <div>
                <strong>Favorite Image:</strong>
                <img
                  src={tag.favImg}
                  alt={`${tag.name} favorite`}
                  width="200"
                />
              </div>
            )}
            {tag.bannerImg && (
              <div>
                <strong>Banner Image:</strong>
                <img
                  src={tag.bannerImg}
                  alt={`${tag.name} banner`}
                  width="400"
                />
              </div>
            )}
            {tag.description && (
              <p>
                <strong>Description:</strong> {tag.description}
              </p>
            )}
            {tag.inStock !== undefined && (
              <p>
                <strong>In Stock:</strong> {tag.inStock ? "Yes" : "No"}
              </p>
            )}
            {tag.quantity !== undefined && (
              <p>
                <strong>Quantity:</strong> {tag.quantity}
              </p>
            )}
            {tag.mrkPrice !== undefined && (
              <p>
                <strong>Market Price:</strong> ${tag.mrkPrice}
              </p>
            )}
            {tag.disPrice !== undefined && (
              <p>
                <strong>Discounted Price:</strong> ${tag.disPrice}
              </p>
            )}
            {/* Add to Cart Section */}
            {tag.tagType === "ingredientTag" && ( // Show only for ingredientTag
              <div className="my-4">
                <h2>Purchase</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    className="p-2 border"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    min="1"
                    className="w-16 p-2 border text-center"
                  />
                  <button
                    onClick={() => setQuantity((prev) => prev + 1)} // Removed extra closing parenthesis
                    className="p-2 border"
                  >
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
            )}
            {tag.productLink && (
              <p>
                <strong>Product Link:</strong>{" "}
                <a
                  href={tag.productLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {tag.productLink}
                </a>
              </p>
            )}
            {tag.category && tag.category.length > 0 && (
              <p>
                <strong>Categories:</strong> {tag.category.join(", ")}
              </p>
            )}
            {tag.recipeRefs && tag.recipeRefs.length > 0 && (
              <div>
                <strong>Recipe References:</strong>
                <ul>
                  {tag.recipeRefs.map((ref, index) => (
                    <li key={`recipe-ref-${index}`}>{ref}</li>
                  ))}
                </ul>
              </div>
            )}
            {tag.blogRefs && tag.blogRefs.length > 0 && (
              <div>
                <strong>Blog References:</strong>
                <ul>
                  {tag.blogRefs.map((ref, index) => (
                    <li key={`blog-ref-${index}`}>{ref}</li>
                  ))}
                </ul>
              </div>
            )}
            {tag.equipmentRefs && tag.equipmentRefs.length > 0 && (
              <div>
                <strong>Equipment References:</strong>
                <ul>
                  {tag.equipmentRefs.map((ref, index) => (
                    <li key={`equipment-ref-${index}`}>{ref}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <h2>Recipes list</h2>
            <div className="row">
              {recipes.length > 0 ? (
                recipes.map((recipe) => (
                  <div className="col-md-4" key={`recipe-${recipe._id}`}>
                    <div className="card">
                      <img
                        src={recipe.bannerImgUrl || ""}
                        alt={recipe.recipeName || "Recipe"}
                        className="card-img-top"
                      />
                      <div className="card-body">
                        <h5 className="card-title">
                          {recipe.recipeName || "N/A"}
                        </h5>
                        <p className="card-text">
                          {recipe.description || "No description available."}
                        </p>
                        <a
                          href={`/recipe/${recipe._id}`}
                          className="btn btn-primary"
                        >
                          View Recipe
                        </a>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>No recipes found.</p>
              )}
            </div>
          </div>
          <div className="col-12">
            <h2>Blogs list</h2>
            <div className="row">
              {blogs.length > 0 ? (
                blogs.map((blog) => (
                  <div className="col-md-4" key={`blog-${blog._id}`}>
                    <div className="card">
                      <img
                        src={blog.bannerImgUrl || ""}
                        alt={blog.blogtitle || "Blog"}
                        className="card-img-top"
                      />
                      <div className="card-body">
                        <h5 className="card-title">
                          {blog.blogtitle || "N/A"}
                        </h5>
                        <p className="card-text">
                          {blog.blogBody
                            ? blog.blogBody.slice(0, 100)
                            : "No content available."}
                          ...
                        </p>
                        <a
                          href={`/blog/${blog._id}`}
                          className="btn btn-primary"
                        >
                          View Blog
                        </a>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>No blogs found.</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default TagDetail;

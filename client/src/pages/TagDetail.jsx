import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const TagDetail = () => {
  const { id, tagType } = useParams(); // Get the tag ID and tagType from the URL
  const [tag, setTag] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
            headers: { "Content-Type": "application/json" }, // Add headers
          })
            .then((res) => {
              if (res.status === 401) {
                console.error("Unauthorized access to recipe:", refId);
                return null;
              }
              if (res.status === 404) {
                console.error("Recipe not found:", refId);
                return null;
              }
              return res.ok ? res.json() : null;
            })
            .catch(() => null); // Handle fetch errors gracefully
        });

        const blogFetches = data.blogRefs.map((refId) => {
          return fetch(`http://localhost:3000/api/blog/${refId}`, {
            headers: { "Content-Type": "application/json" }, // Add headers
          })
            .then((res) => {
              if (res.status === 401) {
                console.error("Unauthorized access to blog:", refId);
                return null;
              }
              if (res.status === 404) {
                console.error("Blog not found:", refId);
                return null;
              }
              return res.ok ? res.json() : null;
            })
            .catch(() => null); // Handle fetch errors gracefully
        });

        const [fetchedRecipes, fetchedBlogs] = await Promise.all([
          Promise.all(recipeFetches),
          Promise.all(blogFetches),
        ]);

        setRecipes(fetchedRecipes.filter((recipe) => recipe)); // Filter out null values
        setBlogs(fetchedBlogs.filter((blog) => blog)); // Filter out null values
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTag();
  }, [id, tagType]); // Add tagType to the dependency array

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

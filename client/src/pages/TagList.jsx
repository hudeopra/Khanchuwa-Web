import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // Import Link for navigation

const TagList = () => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch("/api/tag"); // Fetch all tags from the API
        if (!response.ok) throw new Error("Failed to fetch tags");
        const data = await response.json();
        setTags(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <main className="kh-tag-page">
      <section className="container">
        <div className="row">
          <div className="col-12">
            <h1>Tag List</h1>
            {tags.length === 0 ? (
              <p>No tags available.</p>
            ) : (
              <ul className="d-flex flex-wrap gap-3">
                {tags.map((tag) => (
                  <li key={tag._id}>
                    <h2>
                      <Link
                        to={`/tag/${tag.tagType}/${tag._id}`} // Updated link to use tagType and _id
                      >
                        {tag.name}
                      </Link>
                    </h2>
                    <p>Type: {tag.tagType}</p>
                    <p>Used in Recipes: {tag.usedIn.recipe}</p>
                    <p>Used in Blogs: {tag.usedIn.blog}</p>
                    {tag.equipmentRefs && (
                      <p>Equipment References: {tag.equipmentRefs.length}</p>
                    )}
                    {tag.favImg && (
                      <img
                        src={tag.favImg}
                        alt={`${tag.name} favorite`}
                        width="100"
                      />
                    )}
                    {tag.bannerImg && (
                      <img
                        src={tag.bannerImg}
                        alt={`${tag.name} banner`}
                        width="200"
                      />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default TagList;

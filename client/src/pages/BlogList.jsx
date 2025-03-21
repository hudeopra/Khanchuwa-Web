import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

export default function BlogList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = searchParams.get("searchTerm") || "";

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = {};
    if (searchTerm) params.searchTerm = searchTerm;
    setSearchParams(params);
  }, [searchTerm, setSearchParams]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch(`/api/blog/filter?${searchParams.toString()}`);
        const data = await res.json();
        setBlogs(data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [searchParams]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <main className="kh-blog-list">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <h1 className="text-3xl font-semibold text-center my-7">
              All Blogs
            </h1>
          </div>
          {blogs.map((blog) => (
            <div
              key={blog._id}
              className="col-12 col-lg-3 col-md-4 col-sm-6 mb-3"
            >
              <div className="kh-recipe-block__item mb-3">
                <Link to={`/blogs/${blog._id}`} className="">
                  <div className="kh-recipe-block__content">
                    <h3 className="">{blog.blogtitle}</h3>
                    <p className="">{blog.shortDescription}</p>
                    <span className="">By {blog.author}</span>
                  </div>
                  <div className="kh-recipe-block__item--img">
                    <img
                      src={blog.imageUrl}
                      alt={blog.blogtitle}
                      className=""
                    />
                  </div>
                  <p>
                    Published Date:{" "}
                    {new Date(blog.publishedDate).toLocaleDateString()}
                  </p>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

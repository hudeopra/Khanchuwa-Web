import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
import TagSelector from "../components/TagSelector.jsx";
import AccordionItem from "../components/AccordionItem.jsx";

const EditBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const [formData, setFormData] = useState({
    blogtitle: "",
    shortDescription: "",
    blogquote: "",
    author: "",
    bannerImgUrl: "",
    favImgUrl: "",
    blogBody: "",
    cuisineTag: [],
    flavourTag: [],
    ingredientTag: [],
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [previousTags, setPreviousTags] = useState({
    cuisineTag: [],
    flavourTag: [],
    ingredientTag: [],
  });

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        console.log("Fetching blog data for ID:", id); // Debugging log
        const res = await fetch(`/api/blog/${id}`);
        const data = await res.json();
        console.log("Fetched blog data:", data); // Debugging log
        if (!res.ok) {
          setError(data.message || "Failed to fetch blog details.");
          return;
        }
        if (data.userRef !== (currentUser._id || currentUser.user?._id)) {
          setError("You are not authorized to edit this blog.");
          return;
        }
        setFormData({
          blogtitle: data.blogtitle || "",
          shortDescription: data.shortDescription || "",
          blogquote: data.blogquote || "",
          author: data.author || "",
          bannerImgUrl: data.bannerImgUrl || "",
          favImgUrl: data.favImgUrl || "",
          blogBody: data.blogBody || "",
          cuisineTag: data.cuisineTag || [],
          flavourTag: data.flavourTag || [],
          ingredientTag: data.ingredientTag || [],
        });
        setPreviousTags({
          cuisineTag: data.cuisineTag || [],
          flavourTag: data.flavourTag || [],
          ingredientTag: data.ingredientTag || [],
        });
      } catch (err) {
        console.error("Error fetching blog data:", err); // Debugging log
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id, currentUser]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const storeImage = async (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        "state_changed",
        () => {},
        (error) => reject(error),
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  };

  const handleBannerSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploading(true);
      storeImage(file)
        .then((url) => setFormData((prev) => ({ ...prev, bannerImgUrl: url })))
        .catch((err) => console.error("Banner upload error:", err))
        .finally(() => setUploading(false));
    }
  };

  const handleFavSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploading(true);
      storeImage(file)
        .then((url) => setFormData((prev) => ({ ...prev, favImgUrl: url })))
        .catch((err) => console.error("Fav upload error:", err))
        .finally(() => setUploading(false));
    }
  };

  const updateTagBlogReference = async (tagId, blogId) => {
    try {
      await fetch("/api/tag/addBlogRef", {
        // updated endpoint
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagId, blogId }),
      });
    } catch (err) {
      console.error("Error updating blog tag reference:", err);
    }
  };

  const removeTagBlogReference = async (tagId, blogId) => {
    try {
      await fetch("/api/tag/removeBlogRef", {
        // updated endpoint
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagId, blogId }),
      });
    } catch (err) {
      console.error("Error removing blog tag reference:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = currentUser?._id || currentUser?.user?._id;
    if (!userId) return setError("User reference is missing.");
    setLoading(true);
    setError("");
    const bodyData = {
      ...formData,
      userRef: userId,
    };
    console.log("Form data being sent:", bodyData); // Debugging log
    try {
      const res = await fetch(`/api/blog/update/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });
      const data = await res.json();
      console.log("Response from update API:", data); // Debugging log
      if (!res.ok) {
        setError(data.message || "Failed to update blog.");
      } else {
        console.log("Blog updated successfully:", data); // Debugging log
        const categories = ["cuisineTag", "flavourTag", "ingredientTag"];
        for (const cat of categories) {
          const removed = previousTags[cat].filter(
            (tagId) => !formData[cat].includes(tagId)
          );
          const added = formData[cat].filter(
            (tagId) => !previousTags[cat].includes(tagId)
          );
          await Promise.all(
            removed.map((tagId) => removeTagBlogReference(tagId, id))
          );
          await Promise.all(
            added.map((tagId) => updateTagBlogReference(tagId, id))
          );
        }
        navigate(`/blogs/${id}`);
      }
    } catch (err) {
      console.error("Error during blog update:", err); // Debugging log
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading blog data...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <main className="kh-blog-edit">
      <form onSubmit={handleSubmit}>
        <div className="container">
          <h1 className="text-3xl font-semibold text-center my-7">Edit Blog</h1>
          <AccordionItem title="Blog Information">
            <label>
              Blog Title:
              <input
                type="text"
                name="blogtitle"
                value={formData.blogtitle}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Short Description:
              <input
                type="text"
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleChange}
              />
            </label>
            <label>
              Blog Quote:
              <input
                type="text"
                name="blogquote"
                value={formData.blogquote}
                onChange={handleChange}
              />
            </label>
            <label>
              Author:
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleChange}
                required
              />
            </label>
          </AccordionItem>
          <AccordionItem title="Media Upload">
            <label>
              Banner Image:
              <input
                type="file"
                accept="image/png, image/jpeg"
                onChange={handleBannerSelect}
              />
            </label>
            {formData.bannerImgUrl && (
              <div>
                <img
                  src={formData.bannerImgUrl}
                  alt="Banner"
                  style={{ width: "150px" }}
                />
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, bannerImgUrl: "" }))
                  }
                >
                  Remove Banner
                </button>
              </div>
            )}
            <label>
              Favorite Image:
              <input
                type="file"
                accept="image/png, image/jpeg"
                onChange={handleFavSelect}
              />
            </label>
            {formData.favImgUrl && (
              <div>
                <img
                  src={formData.favImgUrl}
                  alt="Favorite"
                  style={{ width: "150px" }}
                />
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, favImgUrl: "" }))
                  }
                >
                  Remove Favorite
                </button>
              </div>
            )}
          </AccordionItem>
          <AccordionItem title="Tags">
            <div className="div-input-wrapper">
              <h4>Tags</h4>
              <div className="kh-blog-edit__form--item">
                <span>Cuisine Tags</span>
                <TagSelector
                  attribute="cuisineTag"
                  value={formData.cuisineTag}
                  onSelect={(selected) =>
                    setFormData((prev) => ({
                      ...prev,
                      cuisineTag: selected.map((t) => t._id),
                    }))
                  }
                />
              </div>
              <div className="kh-blog-edit__form--item">
                <span>Flavour Tags</span>
                <TagSelector
                  attribute="flavourTag"
                  value={formData.flavourTag}
                  onSelect={(selected) =>
                    setFormData((prev) => ({
                      ...prev,
                      flavourTag: selected.map((t) => t._id),
                    }))
                  }
                />
              </div>
              <div className="kh-blog-edit__form--item">
                <span>Ingredient Tags</span>
                <TagSelector
                  attribute="ingredientTag"
                  value={formData.ingredientTag}
                  onSelect={(selected) =>
                    setFormData((prev) => ({
                      ...prev,
                      ingredientTag: selected
                        .filter((t) => t != null)
                        .map((t) => (t && t._id ? t._id : t)),
                    }))
                  }
                />
              </div>
            </div>
          </AccordionItem>
          <AccordionItem title="Blog Content">
            <label>
              Blog Content:
              <textarea
                name="blogBody"
                value={formData.blogBody}
                onChange={handleChange}
                required
              />
            </label>
          </AccordionItem>
          <button type="submit" disabled={uploading}>
            {loading ? "Updating..." : "Update Blog"}
          </button>
          {error && <p className="text-red-700 text-sm">{error}</p>}
        </div>
      </form>
    </main>
  );
};

export default EditBlog;

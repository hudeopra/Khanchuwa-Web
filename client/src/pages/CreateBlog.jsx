import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useAlert } from "../components/AlertContext";
import {
  uploadImageToFirebase,
  deleteImageFromFirebase,
} from "../utilities/firebaseImageUtils";
import TagSelector from "../components/TagSelector.jsx";
import AccordionItem from "../components/AccordionItem.jsx";

const CreateBlog = () => {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const { showAlert } = useAlert();
  const [redirected, setRedirected] = useState(false);
  const [localCurrentUser, setLocalCurrentUser] = useState(null); // Added proper state for current user
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
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      // If we've already shown the alert and redirected, don't do it again
      if (redirected) return;

      try {
        const res = await fetch("/api/user/current", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch current user");
        const data = await res.json();
        console.log("Current user data:", data); // Debugging log

        // Check if user has creator or admin role
        if (data.role !== "creator" && data.role !== "admin") {
          showAlert(
            "danger",
            "You must be a creator or admin to access this page"
          );
          setRedirected(true); // Mark as redirected
          navigate("/"); // Redirect to homepage
          return; // Exit early
        }

        setLocalCurrentUser(data); // Set local current user state
        dispatch({
          type: "user/updateUserSuccess",
          payload: data, // Update Redux with the new user data
        });
      } catch (error) {
        console.error("Error fetching current user:", error.message);
      }
    };

    fetchCurrentUser(); // Fetch current user on reload
  }, [dispatch, navigate, showAlert, redirected]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBannerSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploading(true);
      setTimeout(() => setUploading(false), 2000); // Disable input for 2 seconds after upload
      uploadImageToFirebase(file)
        .then((url) => setFormData((prev) => ({ ...prev, bannerImgUrl: url })))
        .catch((err) => console.error("Banner upload error:", err))
        .finally(() => setUploading(false));
    }
  };

  const handleFavSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploading(true);
      setTimeout(() => setUploading(false), 2000); // Disable input for 2 seconds after upload
      uploadImageToFirebase(file)
        .then((url) => setFormData((prev) => ({ ...prev, favImgUrl: url })))
        .catch((err) => console.error("Fav upload error:", err))
        .finally(() => setUploading(false));
    }
  };

  const handleImageRemove = (field) => {
    const imageUrl = formData[field];
    if (imageUrl) {
      console.log("Attempting to delete image:", imageUrl); // Debugging log
      deleteImageFromFirebase(imageUrl)
        .then(() => {
          console.log("Image deleted successfully from Firebase:", imageUrl); // Debugging log
          setFormData((prev) => ({ ...prev, [field]: "" }));
        })
        .catch((err) =>
          console.error("Error deleting image from Firebase:", err)
        );
    }
  };

  const updateTagBlogReference = async (tagId, blogId) => {
    try {
      await fetch("/api/tag/addBlogRef", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagId, blogId }),
      });
    } catch (err) {
      console.error("Error updating blog tag reference:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = currentUser?._id || currentUser?.user?._id;
    if (!userId) return setError("User reference is missing.");
    const bodyData = {
      ...formData,
      userRef: userId,
    };
    console.log("Form data being sent:", bodyData); // Debugging log
    try {
      const res = await fetch(`/api/blog/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });
      const data = await res.json();
      console.log("Response from create API:", data); // Debugging log
      if (!res.ok) {
        setError(data.message || "Failed to create blog.");
      } else {
        await Promise.all(
          formData.cuisineTag.map((tagId) =>
            updateTagBlogReference(tagId, data._id)
          )
        );
        await Promise.all(
          formData.flavourTag.map((tagId) =>
            updateTagBlogReference(tagId, data._id)
          )
        );
        await Promise.all(
          formData.ingredientTag.map((tagId) =>
            updateTagBlogReference(tagId, data._id)
          )
        );
        console.log("Blog created successfully:", data); // Debugging log
        navigate(`/blogs/${data._id}`);
      }
    } catch (err) {
      console.error("Error during blog creation:", err); // Debugging log
      setError(err.message);
    }
  };

  return (
    <main className="kh-blog-create">
      <form onSubmit={handleSubmit}>
        <div className="container">
          <h1 className="text-3xl font-semibold text-center my-7">
            Create Blog
          </h1>
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
                  onClick={() => handleImageRemove("bannerImgUrl")}
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
                  onClick={() => handleImageRemove("favImgUrl")}
                >
                  Remove Favorite
                </button>
              </div>
            )}
          </AccordionItem>
          <AccordionItem title="Tags">
            <div className="div-input-wrapper">
              <h4>Tags</h4>
              <div className="kh-blog-create__form--item">
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
              <div className="kh-blog-create__form--item">
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
              <div className="kh-blog-create__form--item">
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
            {uploading ? "Creating..." : "Create Blog"}
          </button>
          {error && <p className="text-red-700 text-sm">{error}</p>}
        </div>
      </form>
    </main>
  );
};

export default CreateBlog;

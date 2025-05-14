import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAlert } from "../components/AlertContext"; // Import AlertContext
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { app } from "../firebase";
import AccordionItem from "../components/AccordionItem.jsx"; // Import AccordionItem
import {
  uploadImageToFirebase,
  deleteImageFromFirebase,
} from "../utilities/firebaseImageUtils";

export default function ProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showAlert } = useAlert(); // Use AlertContext
  const [formData, setFormData] = useState(null);
  const [selectedImages, setSelectedImages] = useState({
    favImg: null,
    bannerImg: null,
  }); // Store selected files locally
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/tag/update/${id}`);
        const data = await res.json();
        console.log("Fetched Product Data:", data); // Log fetched data
        if (!data) {
          setError("Product not found.");
          return;
        }
        setFormData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  const handleImageSelect = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showAlert("error", "Image size must be less than 2 MB.");
        return;
      }
      setUploading(true);
      setTimeout(() => setUploading(false), 2000); // Disable input for 2 seconds after upload
      uploadImageToFirebase(file)
        .then((url) => {
          setFormData((prev) => ({ ...prev, [field]: url }));
          showAlert("success", "Image uploaded successfully!");
        })
        .catch((err) => {
          console.error("Image upload error:", err);
          showAlert("error", "Image upload failed.");
        })
        .finally(() => setUploading(false));
    }
  };

  const handleImageRemove = (field) => {
    const imageUrl = formData[field];
    if (imageUrl) {
      deleteImageFromFirebase(imageUrl)
        .then(() => {
          setFormData((prev) => ({ ...prev, [field]: "" }));
          showAlert("success", "Image removed successfully!");
        })
        .catch((err) => {
          console.error("Error deleting image:", err);
          showAlert("error", "Failed to delete image.");
        });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      // Upload selected images to Firebase
      const favImgUrl = selectedImages.favImg
        ? await uploadImageToFirebase(selectedImages.favImg)
        : formData.favImg;
      const bannerImgUrl = selectedImages.bannerImg
        ? await uploadImageToFirebase(selectedImages.bannerImg)
        : formData.bannerImg;

      // Update formData with Firebase URLs
      const updatedFormData = {
        ...formData,
        favImg: favImgUrl,
        bannerImg: bannerImgUrl,
      };

      const res = await fetch(`/api/tag/update/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFormData),
      });
      const data = await res.json();
      if (data.success === false) {
        setError(data.message);
        showAlert("error", `Update failed: ${data.message}`); // Show error alert
      } else {
        showAlert("success", "Product updated successfully!"); // Show success alert
        navigate(`/cookshop/${formData.tagType}/${id}`);
      }
    } catch (err) {
      setError(err.message);
      showAlert("error", `Update failed: ${err.message}`); // Show error alert
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <p>Loading product data...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <main className="product-edit-form">
      <h1 className="text-3xl font-semibold text-center my-7">Edit Product</h1>
      <form onSubmit={handleSubmit}>
        <div className="container">
          <div className="row">
            <div className="col-12 col-md-8">
              <AccordionItem title="Product Information">
                <div>
                  <label htmlFor="name">Product Name</label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label htmlFor="tagType">Tag Type</label>
                  <input
                    type="text"
                    id="tagType"
                    value={formData.tagType}
                    onChange={(e) =>
                      setFormData({ ...formData, tagType: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label htmlFor="rating">Rating</label>
                  <select
                    id="rating"
                    value={formData.rating || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, rating: e.target.value })
                    }
                  >
                    {[1, 2, 3, 4, 5].map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>
              </AccordionItem>
              {formData.tagType === "ingredientTag" && (
                <AccordionItem title="Ingredient Details">
                  <div>
                    <label htmlFor="inStock">In Stock</label>
                    <select
                      id="inStock"
                      value={formData.inStock}
                      onChange={(e) =>
                        setFormData({ ...formData, inStock: e.target.value })
                      }
                    >
                      <option value={1}>Yes</option>
                      <option value={0}>No</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="quantity">Quantity</label>
                    <input
                      type="number"
                      id="quantity"
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData({ ...formData, quantity: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label htmlFor="mrkPrice">Market Price</label>
                    <input
                      type="number"
                      id="mrkPrice"
                      value={formData.mrkPrice}
                      onChange={(e) =>
                        setFormData({ ...formData, mrkPrice: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label htmlFor="disPrice">Discounted Price</label>
                    <input
                      type="number"
                      id="disPrice"
                      value={formData.disPrice}
                      onChange={(e) =>
                        setFormData({ ...formData, disPrice: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label htmlFor="description">Description</label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                </AccordionItem>
              )}
            </div>
            <div className="col-12 col-md-4">
              <div className="kh-recipe-form__admin">
                <button type="submit" disabled={uploading}>
                  {uploading ? "Uploading..." : "Update Product"}
                </button>
                {error && <p className="text-red-700 text-sm">{error}</p>}
              </div>
              <AccordionItem title="Media Upload">
                <div>
                  <label htmlFor="favImg">Favorite Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageSelect(e, "favImg")}
                  />
                  {formData.favImg && (
                    <div>
                      <img src={formData.favImg} alt="Favorite" width="100" />
                      <button
                        type="button"
                        onClick={() => handleImageRemove("favImg")}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <label htmlFor="bannerImg">Banner Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageSelect(e, "bannerImg")}
                  />
                  {formData.bannerImg && (
                    <div>
                      <img src={formData.bannerImg} alt="Banner" width="100" />
                      <button
                        type="button"
                        onClick={() => handleImageRemove("bannerImg")}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </AccordionItem>
            </div>
          </div>
        </div>
      </form>
    </main>
  );
}

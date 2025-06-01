import React, { useState, useEffect } from "react";
import { useAlert } from "./AlertContext";
import AccordionItem from "./AccordionItem.jsx";
import {
  uploadImageToFirebase,
  deleteImageFromFirebase,
} from "../utilities/firebaseImageUtils";

export default function ProductEditForm({ productId, onProductUpdate }) {
  const { showAlert } = useAlert();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [updateButtonState, setUpdateButtonState] = useState("normal"); // 'normal', 'warning', 'ready'
  const [timeoutId, setTimeoutId] = useState(null);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/tag/update/${productId}`);
        const data = await res.json();
        console.log("Fetched Product Data:", data);
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
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  const handleImageSelect = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showAlert("error", "Image size must be less than 2 MB.");
        return;
      }
      setUploading(true);
      setTimeout(() => setUploading(false), 2000);
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
  const handleUpdateClick = () => {
    if (updateButtonState === "normal") {
      setUpdateButtonState("warning");
      const id = setTimeout(() => {
        setUpdateButtonState("normal");
      }, 3000); // Reset to normal after 3 seconds if not clicked again
      setTimeoutId(id);
    } else if (updateButtonState === "warning") {
      if (timeoutId) {
        clearTimeout(timeoutId);
        setTimeoutId(null);
      }
      setUpdateButtonState("ready");
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setUploading(true);
    try {
      const res = await fetch(`/api/tag/update/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        setError(data.message);
        showAlert("error", `Update failed: ${data.message}`);
      } else {
        showAlert("success", "Product updated successfully!");
        setFormData(data); // Update with the returned data
        if (onProductUpdate) {
          onProductUpdate(data); // Callback to parent component
        }
      }
    } catch (err) {
      setError(err.message);
      showAlert("error", `Update failed: ${err.message}`);
    } finally {
      setUploading(false);
      setUpdateButtonState("normal");
      if (timeoutId) {
        clearTimeout(timeoutId);
        setTimeoutId(null);
      }
    }
  };

  const getUpdateButtonClass = () => {
    switch (updateButtonState) {
      case "warning":
        return "bg-yellow-600 hover:bg-yellow-700";
      case "ready":
        return "bg-green-600 hover:bg-green-700";
      default:
        return "bg-blue-600 hover:bg-blue-700";
    }
  };

  const getUpdateButtonText = () => {
    switch (updateButtonState) {
      case "warning":
        return "Click Again to Confirm";
      case "ready":
        return "Updating...";
      default:
        return "Update Product";
    }
  };

  if (loading) return <p>Loading product data...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!formData) return <p>No product selected</p>;

  return (
    <div className="product-edit-form">
      <AccordionItem title="Product Information">
        <div className="mb-3">
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Product Name
          </label>
          <input
            type="text"
            id="name"
            value={formData.name || ""}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="tagType" className="block text-sm font-medium mb-1">
            Tag Type
          </label>
          <input
            type="text"
            id="tagType"
            value={formData.tagType || ""}
            onChange={(e) =>
              setFormData({ ...formData, tagType: e.target.value })
            }
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="rating" className="block text-sm font-medium mb-1">
            Rating
          </label>
          <select
            id="rating"
            value={formData.rating || ""}
            onChange={(e) =>
              setFormData({ ...formData, rating: e.target.value })
            }
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="">Select Rating</option>
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
          <div className="mb-3">
            <label htmlFor="inStock" className="block text-sm font-medium mb-1">
              In Stock
            </label>
            <select
              id="inStock"
              value={formData.inStock}
              onChange={(e) =>
                setFormData({ ...formData, inStock: parseInt(e.target.value) })
              }
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value={1}>Yes</option>
              <option value={0}>No</option>
            </select>
          </div>
          <div className="mb-3">
            <label
              htmlFor="quantity"
              className="block text-sm font-medium mb-1"
            >
              Quantity
            </label>
            <input
              type="number"
              id="quantity"
              value={formData.quantity || ""}
              onChange={(e) =>
                setFormData({ ...formData, quantity: parseInt(e.target.value) })
              }
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="mb-3">
            <label
              htmlFor="mrkPrice"
              className="block text-sm font-medium mb-1"
            >
              Market Price
            </label>
            <input
              type="number"
              id="mrkPrice"
              value={formData.mrkPrice || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  mrkPrice: parseFloat(e.target.value),
                })
              }
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="mb-3">
            <label
              htmlFor="disPrice"
              className="block text-sm font-medium mb-1"
            >
              Discounted Price
            </label>
            <input
              type="number"
              id="disPrice"
              value={formData.disPrice || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  disPrice: parseFloat(e.target.value),
                })
              }
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="mb-3">
            <label
              htmlFor="description"
              className="block text-sm font-medium mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value,
                })
              }
              className="w-full p-2 border border-gray-300 rounded"
              rows="4"
            />
          </div>
        </AccordionItem>
      )}

      <AccordionItem title="Media Upload">
        <div className="mb-3">
          <label htmlFor="favImg" className="block text-sm font-medium mb-1">
            Favorite Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageSelect(e, "favImg")}
            className="w-full p-2 border border-gray-300 rounded"
          />
          {formData.favImg && (
            <div className="mt-2">
              <img
                src={formData.favImg}
                alt="Favorite"
                width="100"
                className="rounded"
              />
              <button
                type="button"
                onClick={() => handleImageRemove("favImg")}
                className="ml-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          )}
        </div>
        <div className="mb-3">
          <label htmlFor="bannerImg" className="block text-sm font-medium mb-1">
            Banner Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageSelect(e, "bannerImg")}
            className="w-full p-2 border border-gray-300 rounded"
          />
          {formData.bannerImg && (
            <div className="mt-2">
              <img
                src={formData.bannerImg}
                alt="Banner"
                width="100"
                className="rounded"
              />
              <button
                type="button"
                onClick={() => handleImageRemove("bannerImg")}
                className="ml-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      </AccordionItem>

      <div className="mt-4">
        <button
          type="button"
          onClick={handleUpdateClick}
          disabled={uploading}
          className={`w-full p-3 text-white rounded-lg transition-colors ${getUpdateButtonClass()} ${
            uploading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {uploading ? "Uploading..." : getUpdateButtonText()}
        </button>
        {updateButtonState === "warning" && (
          <p className="text-yellow-600 text-sm mt-2 text-center">
            Click again within 3 seconds to confirm the update
          </p>
        )}
        {error && <p className="text-red-700 text-sm mt-2">{error}</p>}
      </div>
    </div>
  );
}

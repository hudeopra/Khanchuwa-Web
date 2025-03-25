import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
import AccordionItem from "../components/AccordionItem.jsx";

const CreateProduct = () => {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const [formData, setFormData] = useState({
    productName: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    imageUrl: "",
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

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

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploading(true);
      storeImage(file)
        .then((url) => setFormData((prev) => ({ ...prev, imageUrl: url })))
        .catch((err) => console.error("Image upload error:", err))
        .finally(() => setUploading(false));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = currentUser?._id || currentUser?.user?._id;
    if (!userId) return setError("User reference is missing.");
    const bodyData = {
      ...formData,
      seller: userId,
      images: formData.imageUrl ? [formData.imageUrl] : [],
    };
    try {
      const res = await fetch(`/api/shop/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to create product.");
      } else {
        navigate(`/products/${data._id}`);
      }
    } catch (err) {
      console.error("Error during product creation:", err);
      setError(err.message);
    }
  };

  return (
    <main className="kh-product-create">
      <form onSubmit={handleSubmit}>
        <div className="container">
          <h1 className="text-3xl font-semibold text-center my-7">
            Create Product
          </h1>
          <AccordionItem title="Product Information">
            <label>
              Product Name:
              <input
                type="text"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Description:
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Price:
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Stock:
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
              />
            </label>
            <label>
              Category:
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
              />
            </label>
          </AccordionItem>
          <AccordionItem title="Media Upload">
            <label>
              Product Image:
              <input
                type="file"
                accept="image/png, image/jpeg"
                onChange={handleImageSelect}
              />
            </label>
            {formData.imageUrl && (
              <div>
                <img
                  src={formData.imageUrl}
                  alt="Product"
                  style={{ width: "150px" }}
                />
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, imageUrl: "" }))
                  }
                >
                  Remove Image
                </button>
              </div>
            )}
          </AccordionItem>
          <button type="submit" disabled={uploading}>
            {uploading ? "Creating..." : "Create Product"}
          </button>
          {error && <p className="text-red-700 text-sm">{error}</p>}
        </div>
      </form>
    </main>
  );
};

export default CreateProduct;

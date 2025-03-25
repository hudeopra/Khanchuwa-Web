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
import TagSelector from "../components/TagSelector.jsx"; // new import

const CreateProduct = () => {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  console.log("Current user data:", currentUser); // Log currentUser when component renders

  const [formData, setFormData] = useState({
    productName: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    imageUrl: "",
    cuisineTag: [], // added new tag state
    flavourTag: [], // added new tag state
    ingredientTag: [], // added new tag state
    equipmentTag: [], // added new tag state
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

  // Updated helper function with extra logging:
  const updateTagProductReference = async (tagId, productId) => {
    console.log(
      "Calling addProductRef for tag:",
      tagId,
      "with product:",
      productId
    );
    try {
      await fetch("/api/tag/addProductRef", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tagId: tagId.toString(),
          productId: productId.toString(),
        }),
      });
      console.log("addProductRef call completed for tag:", tagId);
    } catch (err) {
      console.error(
        "Error updating product tag reference for tag:",
        tagId,
        err
      );
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
    console.log("Form data being sent:", bodyData);
    try {
      // Updated fetch call to use a relative URL (like CreateBlog.jsx and CreateRecipe.jsx)
      const res = await fetch(`/api/shop/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });
      const data = await res.json();
      console.log("Response from create API:", data);
      if (!res.ok) {
        setError(data.message || "Failed to create product.");
      } else {
        await Promise.all(
          formData.cuisineTag.map((tagId) =>
            updateTagProductReference(tagId, data._id)
          )
        );
        await Promise.all(
          formData.flavourTag.map((tagId) =>
            updateTagProductReference(tagId, data._id)
          )
        );
        await Promise.all(
          formData.ingredientTag.map((tagId) =>
            updateTagProductReference(tagId, data._id)
          )
        );
        await Promise.all(
          formData.equipmentTag.map((tagId) =>
            updateTagProductReference(tagId, data._id)
          )
        );
        console.log("Product created successfully:", data);
        navigate(`/products/${data._id}`);
      }
    } catch (err) {
      console.error("Fetch failed:", err);
      setError("Network error: " + err.message);
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
          <AccordionItem title="Tags">
            <div className="div-input-wrapper">
              <h4>Tags</h4>
              <div className="create-product__form--item">
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
              <div className="create-product__form--item">
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
              <div className="create-product__form--item">
                <span>Ingredient Tags</span>
                <TagSelector
                  attribute="ingredientTag"
                  value={formData.ingredientTag}
                  onSelect={(selected) =>
                    setFormData((prev) => ({
                      ...prev,
                      ingredientTag: selected.map((t) => t._id),
                    }))
                  }
                />
              </div>
              <div className="create-product__form--item">
                <span>Equipment Tags</span>
                <TagSelector
                  attribute="equipmentTag"
                  value={formData.equipmentTag}
                  onSelect={(selected) =>
                    setFormData((prev) => ({
                      ...prev,
                      equipmentTag: selected.map((t) => t._id),
                    }))
                  }
                />
              </div>
            </div>
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

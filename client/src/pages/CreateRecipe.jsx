import { useState, useEffect } from "react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function CreateRecipe() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    imageUrls: [],
    recipeName: "",
    description: "",
    diet: "",
    ingredients: [
      { name: "", quantity: "" },
      { name: "", quantity: "" },
    ], // default to 2 ingredients
    prepTime: "",
    cookTime: "",
    servings: "",
    difficulty: "",
    chefName: "",
    videoUrl: "",
    flavourTags: [""],
    cuisines: [""], // renamed field
    bannerImgUrl: "", // Banner image URL
    favImgUrl: "", // Favorite image URL
    shortDescription: "",
    nutritionalInfo: [
      { name: "", value: "" },
      { name: "", value: "" },
    ], // default to 2 items
    cookInstructions: [], // renamed from steps
    prepInstructions: [], // renamed from prepNotes
    tags: [],
  });
  const [imageUploadError, setImageUploadError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  // Set chefName from currentUser’s username
  useEffect(() => {
    if (currentUser && currentUser.username) {
      setFormData((prev) => ({ ...prev, chefName: currentUser.username }));
    }
  }, [currentUser]);

  const handleArrayChange = (field, index, value) => {
    const newArr = [...formData[field]];
    newArr[index] = value;
    setFormData({ ...formData, [field]: newArr });
  };

  const addArrayField = (field) => {
    setFormData({ ...formData, [field]: [...formData[field], ""] });
  };

  // Modified: Update handleImageSubmit to accept filesToUpload parameter
  const handleImageSubmit = (filesToUpload) => {
    // Allow upload if at least 1 and (existing + new) images are <= 6
    if (
      filesToUpload.length > 0 &&
      filesToUpload.length + formData.imageUrls.length <= 6
    ) {
      setUploading(true);
      setImageUploadError(false);
      const promises = [];
      for (let i = 0; i < filesToUpload.length; i++) {
        promises.push(storeImage(filesToUpload[i]));
      }
      Promise.all(promises)
        .then((urls) => {
          setFormData({
            ...formData,
            imageUrls: formData.imageUrls.concat(urls),
          });
          setImageUploadError(false);
          setUploading(false);
        })
        .catch((err) => {
          setImageUploadError("CreateRecipe.jsx: Error uploading images");
          setUploading(false);
        });
    } else {
      setImageUploadError("CreateRecipe.jsx: Upload between 1 to 6 images");
      setUploading(false);
    }
  };

  // New function: Handle file selection and trigger image upload if within limit
  const handleFileSelect = (e) => {
    const newFiles = Array.from(e.target.files); // convert FileList to Array
    const totalImages = formData.imageUrls.length + newFiles.length;
    if (totalImages <= 6) {
      // Upload new selection immediately
      handleImageSubmit(newFiles);
    } else {
      setImageUploadError("CreateRecipe.jsx: Upload between 1 to 6 images");
    }
  };

  const storeImage = async (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  };

  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter((_, i) => i !== index),
    });
  };

  const handleChange = (e) => {
    const { id, value, type, name } = e.target;
    if (type === "radio") {
      setFormData({
        ...formData,
        [name]: value,
      });
    } else {
      setFormData({
        ...formData,
        [id]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);
    try {
      if (formData.imageUrls.length < 1)
        return setError("You must upload at least one image");
      setLoading(true);
      setError(false);

      // Process cuisines input
      const processedCuisines = formData.cuisines.reduce((acc, item) => {
        const trimmed = item.trim();
        if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
          const items = trimmed
            .slice(1, -1)
            .split(",")
            .map((x) => x.trim().replace(/^['"]|['"]$/g, ""))
            .filter((x) => x);
          return acc.concat(items);
        } else {
          if (trimmed) acc.push(trimmed);
          return acc;
        }
      }, []);

      const bodyData = {
        ...formData,
        cuisines: processedCuisines, // now directly send cuisine names as strings
        userRef: currentUser._id,
      };

      const res = await fetch(`/api/recipe/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });
      const data = await res.json();
      console.log("Response data:", data);

      setLoading(false);
      if (data.success === false) {
        setError(data.message);
      } else if (data._id) {
        navigate(`/recipes/${data._id}`);
      } else {
        setError("Recipe creation failed. Please try again.");
      }
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleBannerSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      storeImage(file)
        .then((url) => setFormData({ ...formData, bannerImgUrl: url }))
        .catch((err) => console.error("Banner upload error:", err));
    }
  };

  const handleFavSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      storeImage(file)
        .then((url) => setFormData({ ...formData, favImgUrl: url }))
        .catch((err) => console.error("Fav upload error:", err));
    }
  };

  // Add helper function to remove a field:
  const removeField = (field, index) => {
    // For nutritionalInfo, ensure at least 2 remain; for instructions, allow removal if length >= 3.
    if (
      (field === "nutritionalInfo" && formData.nutritionalInfo.length >= 3) ||
      ((field === "cookInstructions" || field === "prepInstructions") &&
        formData[field].length >= 3)
    ) {
      const newArr = formData[field].filter((_, i) => i !== index);
      setFormData({ ...formData, [field]: newArr });
    }
  };

  return (
    <main className="p-3 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">
        Create a Recipe
      </h1>

      <p>Author: {formData.chefName}</p>
      <form
        onSubmit={handleSubmit}
        className="flex flex-wrap sm:flex-row gap-4"
      >
        <input type="hidden" id="userRef" value={currentUser._id} />
        <div className="flex flex-wrap gap-4 flex-1">
          <label htmlFor="recipeName">Name</label>
          <input
            type="text"
            placeholder="Name"
            className="border p-3 rounded-lg"
            id="recipeName"
            maxLength="62"
            minLength="10"
            required
            onChange={handleChange}
            value={formData.recipeName}
          />
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            placeholder="Description"
            className="border p-3 rounded-lg"
            required
            onChange={handleChange}
            value={formData.description}
          />
          <label htmlFor="diet">Diet</label>
          <input
            type="text"
            placeholder="Diet (e.g., vegetarian, non-vegetarian, vegan)"
            className="border p-3 rounded-lg"
            id="diet"
            required
            onChange={handleChange}
            value={formData.diet}
          />
          <div>
            <label>Ingredients:</label>
            {formData.ingredients.map((ingredient, index) => (
              <div key={index} className="flex items-center gap-2">
                <div>
                  <label htmlFor={`ingredient-name-${index}`}>
                    Name {index + 1}
                  </label>
                  <input
                    id={`ingredient-name-${index}`}
                    type="text"
                    placeholder="Ingredient name"
                    className="border p-3 rounded-lg my-1"
                    value={ingredient.name}
                    onChange={(e) => {
                      const newIngredients = formData.ingredients.map(
                        (ing, idx) =>
                          idx === index ? { ...ing, name: e.target.value } : ing
                      );
                      setFormData({ ...formData, ingredients: newIngredients });
                    }}
                    required
                  />
                  <label htmlFor={`ingredient-qty-${index}`}>
                    Quantity {index + 1}
                  </label>
                  <input
                    id={`ingredient-qty-${index}`}
                    type="text"
                    placeholder="Quantity"
                    className="border p-3 rounded-lg my-1"
                    value={ingredient.quantity}
                    onChange={(e) => {
                      const newIngredients = formData.ingredients.map(
                        (ing, idx) =>
                          idx === index
                            ? { ...ing, quantity: e.target.value }
                            : ing
                      );
                      setFormData({ ...formData, ingredients: newIngredients });
                    }}
                    required
                  />
                </div>
                {formData.ingredients.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        ingredients: formData.ingredients.filter(
                          (_, i) => i !== index
                        ),
                      })
                    }
                    className="p-1 border rounded text-red-600"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setFormData({
                  ...formData,
                  ingredients: [
                    ...formData.ingredients,
                    { name: "", quantity: "" },
                  ],
                })
              }
              className="p-2 border rounded my-1"
            >
              Add Ingredient
            </button>
          </div>
          <label htmlFor="prepTime">Prep Time</label>
          <input
            type="number"
            placeholder="Prep Time"
            className="border p-3 rounded-lg"
            id="prepTime"
            required
            onChange={handleChange}
            value={formData.prepTime}
          />
          <label htmlFor="cookTime">Cook Time</label>
          <input
            type="number"
            placeholder="Cook Time"
            className="border p-3 rounded-lg"
            id="cookTime"
            required
            onChange={handleChange}
            value={formData.cookTime}
          />
          <div className="flex flex-col gap-2">
            <p>Servings:</p>
            <label>
              <input
                type="radio"
                name="servings"
                value="1"
                checked={formData.servings === "1"}
                onChange={handleChange}
              />
              1
            </label>
            <label>
              <input
                type="radio"
                name="servings"
                value="2"
                checked={formData.servings === "2"}
                onChange={handleChange}
              />
              2
            </label>
            <label>
              <input
                type="radio"
                name="servings"
                value="4"
                checked={formData.servings === "4"}
                onChange={handleChange}
              />
              4
            </label>
          </div>
          <div className="flex flex-col gap-2">
            <p>Difficulty:</p>
            <label>
              <input
                type="radio"
                name="difficulty"
                value="Easy"
                checked={formData.difficulty === "Easy"}
                onChange={handleChange}
              />
              Easy
            </label>
            <label>
              <input
                type="radio"
                name="difficulty"
                value="Medium"
                checked={formData.difficulty === "Medium"}
                onChange={handleChange}
              />
              Medium
            </label>
            <label>
              <input
                type="radio"
                name="difficulty"
                value="Hard"
                checked={formData.difficulty === "Hard"}
                onChange={handleChange}
              />
              Hard
            </label>
          </div>
          <div>
            <label>Cuisines:</label>
            {formData.cuisines.map((cuisine, index) => (
              <div key={index} className="flex items-center gap-2">
                <label htmlFor={`cuisine-${index}`}>Cuisine {index + 1}</label>
                <input
                  id={`cuisine-${index}`}
                  type="text"
                  placeholder="Cuisine"
                  className="border p-3 rounded-lg my-1"
                  value={cuisine}
                  onChange={(e) =>
                    handleArrayChange("cuisines", index, e.target.value)
                  } // updated field name
                  required
                />
                {formData.cuisines.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        cuisines: formData.cuisines.filter(
                          (_, i) => i !== index
                        ),
                      })
                    }
                    className="p-1 border rounded text-red-600"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayField("cuisines")} // updated field name
              className="p-2 border rounded my-1"
            >
              Add Cuisine
            </button>
          </div>
          <div>
            <label>Flavour Tags:</label>
            {formData.flavourTags.map((tag, index) => (
              <div key={index} className="flex items-center gap-2">
                <label htmlFor={`flavortag-${index}`}>
                  Flavour Tag {index + 1}
                </label>
                <input
                  id={`flavortag-${index}`}
                  type="text"
                  placeholder="Flavour Tag"
                  className="border p-3 rounded-lg my-1"
                  value={tag}
                  onChange={(e) =>
                    handleArrayChange("flavourTags", index, e.target.value)
                  }
                  required
                />
                {formData.flavourTags.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        flavourTags: formData.flavourTags.filter(
                          (_, i) => i !== index
                        ),
                      })
                    }
                    className="p-1 border rounded text-red-600"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayField("flavourTags")}
              className="p-2 border rounded my-1"
            >
              Add Flavour Tag
            </button>
          </div>
          <label htmlFor="videoUrl">Video URL</label>
          <input
            type="text"
            placeholder="Video URL"
            className="border p-3 rounded-lg"
            id="videoUrl"
            onChange={handleChange}
            value={formData.videoUrl}
          />
          <label htmlFor="bannerImg">Banner Image</label>
          <input
            type="file"
            accept="image/png, image/jpeg"
            id="bannerImg"
            onChange={handleBannerSelect}
          />
          {formData.bannerImgUrl && (
            <div className="flex items-center gap-2">
              <img
                src={formData.bannerImgUrl}
                alt="Banner"
                className="w-20 h-20 object-contain rounded-lg"
              />
              <button
                type="button"
                onClick={() => setFormData({ ...formData, bannerImgUrl: "" })}
                className="p-2 text-red-700 rounded-lg"
              >
                Delete
              </button>
            </div>
          )}
          <label htmlFor="favImg">Favorite Image</label>
          <input
            type="file"
            accept="image/png, image/jpeg"
            id="favImg"
            onChange={handleFavSelect}
          />
          {formData.favImgUrl && (
            <div className="flex items-center gap-2">
              <img
                src={formData.favImgUrl}
                alt="Favorite"
                className="w-20 h-20 object-contain rounded-lg"
              />
              <button
                type="button"
                onClick={() => setFormData({ ...formData, favImgUrl: "" })}
                className="p-2 text-red-700 rounded-lg"
              >
                Delete
              </button>
            </div>
          )}
          <label htmlFor="images">Images:</label>
          <input
            onChange={handleFileSelect}
            className="p-3 border border-gray-300 rounded w-full"
            type="file"
            id="images"
            accept="image/*"
            multiple
          />
          <p className="text-red-700 text-sm">
            {imageUploadError && imageUploadError}
          </p>
          {formData.imageUrls.length > 0 &&
            formData.imageUrls.map((url, index) => (
              <div
                key={url}
                className="flex justify-between p-3 border items-center"
              >
                <img
                  src={url}
                  alt="recipe image"
                  className="w-20 h-20 object-contain rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="p-3 text-red-700 rounded-lg uppercase hover:opacity-75"
                >
                  Delete
                </button>
              </div>
            ))}
          <label htmlFor="shortDescription">Short Description</label>
          <textarea
            id="shortDescription"
            placeholder="Short description"
            onChange={handleChange}
            value={formData.shortDescription}
          />

          <label>Nutritional Info:</label>
          {formData.nutritionalInfo.map((item, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <input
                type="text"
                value={item.name}
                onChange={(e) => {
                  const newInfo = formData.nutritionalInfo.map((info, i) =>
                    i === idx ? { ...info, name: e.target.value } : info
                  );
                  setFormData({ ...formData, nutritionalInfo: newInfo });
                }}
                placeholder="Nutrient"
                className="border p-2 rounded"
                required
              />
              <input
                type="text"
                value={item.value}
                onChange={(e) => {
                  const newInfo = formData.nutritionalInfo.map((info, i) =>
                    i === idx ? { ...info, value: e.target.value } : info
                  );
                  setFormData({ ...formData, nutritionalInfo: newInfo });
                }}
                placeholder="Amount"
                className="border p-2 rounded"
                required
              />
              {formData.nutritionalInfo.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      nutritionalInfo: formData.nutritionalInfo.filter(
                        (_, i) => i !== idx
                      ),
                    })
                  }
                  className="p-1 border rounded text-red-600"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setFormData({
                ...formData,
                nutritionalInfo: [
                  ...formData.nutritionalInfo,
                  { name: "", value: "" },
                ],
              })
            }
            className="p-2 border rounded my-1"
          >
            Add Nutritional Info
          </button>

          <label>Cook Instructions:</label>
          {formData.cookInstructions.map((instruction, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <input
                type="text"
                value={instruction}
                onChange={(e) => {
                  const newInstructions = formData.cookInstructions.map(
                    (ins, i) => (i === idx ? e.target.value : ins)
                  );
                  setFormData({
                    ...formData,
                    cookInstructions: newInstructions,
                  });
                }}
                className="border p-2 rounded my-1"
                placeholder="Instruction"
              />
              {formData.cookInstructions.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      cookInstructions: formData.cookInstructions.filter(
                        (_, i) => i !== idx
                      ),
                    })
                  }
                  className="p-1 border rounded text-red-600"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setFormData({
                ...formData,
                cookInstructions: [...formData.cookInstructions, ""],
              })
            }
            className="p-2 border rounded my-1"
          >
            Add Instruction
          </button>

          <label>Prep Instructions:</label>
          {formData.prepInstructions.map((instruction, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <input
                type="text"
                value={instruction}
                onChange={(e) => {
                  const newInstructions = formData.prepInstructions.map(
                    (ins, i) => (i === idx ? e.target.value : ins)
                  );
                  setFormData({
                    ...formData,
                    prepInstructions: newInstructions,
                  });
                }}
                className="border p-2 rounded my-1"
                placeholder="Instruction"
              />
              {formData.prepInstructions.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      prepInstructions: formData.prepInstructions.filter(
                        (_, i) => i !== idx
                      ),
                    })
                  }
                  className="p-1 border rounded text-red-600"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setFormData({
                ...formData,
                prepInstructions: [...formData.prepInstructions, ""],
              })
            }
            className="p-2 border rounded my-1"
          >
            Add Instruction
          </button>

          <label htmlFor="tags">Tags (comma separated)</label>
          <input
            type="text"
            id="tags"
            placeholder="e.g., easy, vegan"
            onChange={(e) =>
              setFormData({
                ...formData,
                tags: e.target.value.split(",").map((s) => s.trim()),
              })
            }
            value={formData.tags.join(", ")}
          />

          <button
            type="submit"
            disabled={loading || uploading}
            className="p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80"
          >
            {loading ? "Creating..." : "Create Recipe"}
          </button>
          {error && <p className="text-red-700 text-sm">{error}</p>}
        </div>
      </form>
    </main>
  );
}

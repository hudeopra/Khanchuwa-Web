import React, { useState, useEffect } from "react";
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

export default function EditRecipe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const [recipe, setRecipe] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(false);

  useEffect(() => {
    async function fetchRecipe() {
      try {
        const res = await fetch(`/api/recipe/${id}`);
        const data = await res.json();
        // Authorization check: make sure current user is allowed to edit
        if (
          !data ||
          data.userRef !== (currentUser._id || currentUser.user?._id)
        ) {
          setError("You are not authorized to edit this recipe.");
          return;
        }
        setRecipe(data);
        // Initialize formData with the fetched recipe including new keys
        setFormData({
          imageUrls: data.imageUrls || [],
          recipeName: data.recipeName || "",
          description: data.description || "",
          diet: data.diet || "",
          ingredients:
            data.ingredients && data.ingredients.length > 0
              ? data.ingredients
              : [{ name: "", quantity: "" }],
          prepTime: data.prepTime || "",
          cookTime: data.cookTime || "",
          servings: data.servings || "",
          difficulty: data.difficulty || "",
          chefName: data.chefName || "",
          videoUrl: data.videoUrl || "",
          flavourTag: data.flavourTag || [],
          cuisineTag: data.cuisineTag || [],
          ingredientTag: data.ingredientTag || [],
          bannerImgUrl: data.bannerImgUrl || "",
          favImgUrl: data.favImgUrl || "",
          shortDescription: data.shortDescription || "",
          nutritionalInfo:
            data.nutritionalInfo && Array.isArray(data.nutritionalInfo)
              ? data.nutritionalInfo
              : [
                  { name: "", value: "" },
                  { name: "", value: "" },
                ],
          cookInstructions: data.cookInstructions || [],
          prepInstructions: data.prepInstructions || [],
          tags: data.tags || [],
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (currentUser) fetchRecipe();
  }, [id, currentUser]);

  const handleArrayChange = (field, index, value) => {
    const newArr = [...formData[field]];
    newArr[index] = value;
    setFormData({ ...formData, [field]: newArr });
  };

  const addArrayField = (field) => {
    setFormData({ ...formData, [field]: [...formData[field], ""] });
  };

  const removeField = (field, index) => {
    if (formData[field].length >= 3) {
      const newArr = formData[field].filter((_, i) => i !== index);
      setFormData({ ...formData, [field]: newArr });
    }
  };

  const handleChange = (e) => {
    const { id, value, type, name } = e.target;
    if (type === "radio") {
      setFormData({ ...formData, [name]: value });
    } else {
      setFormData({ ...formData, [id]: value });
    }
  };

  // Firebase image upload functions (same as CreateRecipe)
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

  const handleImageSubmit = (filesToUpload) => {
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
          setImageUploadError("Error uploading images");
          setUploading(false);
        });
    } else {
      setImageUploadError("Upload between 1 to 6 images");
      setUploading(false);
    }
  };

  const handleFileSelect = (e) => {
    const newFiles = Array.from(e.target.files);
    const totalImages = formData.imageUrls.length + newFiles.length;
    if (totalImages <= 6) {
      handleImageSubmit(newFiles);
    } else {
      setImageUploadError("Upload between 1 to 6 images");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/recipe/update/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        setError(data.message);
      } else {
        navigate(`/recipes/${id}`);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p>Loading recipe data...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <main className="p-3 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Edit Recipe</h1>
      <form
        onSubmit={handleSubmit}
        className="flex flex-wrap sm:flex-row gap-4"
      >
        <input type="hidden" id="userRef" value={currentUser._id} />
        <div className="flex flex-wrap gap-4 flex-1">
          {/* Recipe Information Section */}
          <AccordionItem title="Recipe Information">
            <div className="div-input-wrapper">
              <label htmlFor="recipeName">Name</label>
              <input
                type="text"
                placeholder="Name"
                id="recipeName"
                className="border p-3 rounded-lg"
                required
                onChange={handleChange}
                value={formData.recipeName}
              />
              <label htmlFor="shortDescription">Short Description</label>
              <textarea
                id="shortDescription"
                placeholder="Short description"
                className="border p-3 rounded-lg"
                onChange={handleChange}
                value={formData.shortDescription}
              />
              <label htmlFor="description">Long Description</label>
              <textarea
                id="description"
                placeholder="Description"
                className="border p-3 rounded-lg"
                required
                onChange={handleChange}
                value={formData.description}
              />
              <label htmlFor="videoUrl">Video URL</label>
              <input
                type="text"
                id="videoUrl"
                placeholder="Video URL"
                className="border p-3 rounded-lg"
                onChange={handleChange}
                value={formData.videoUrl}
              />
            </div>
          </AccordionItem>

          {/* Tags Section matching CreateRecipe */}
          <AccordionItem title="Tags">
            <div className="div-input-wrapper">
              <h2>Tags</h2>
              <div className="recipe-tags">
                <h3>Cuisine Tags</h3>
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
                <h3>Flavour Tags</h3>
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
                <h3>Ingredient Tags</h3>
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
                <h3>General Tags</h3>
                <TagSelector
                  attribute="tags"
                  value={formData.tags}
                  onSelect={(selected) =>
                    setFormData((prev) => ({
                      ...prev,
                      tags: selected.map((t) => t.name),
                    }))
                  }
                />
              </div>
            </div>
          </AccordionItem>

          {/* Diet & Ingredients Section */}
          <AccordionItem title="Diet & Ingredients">
            <div className="div-input-wrapper">
              <label htmlFor="diet">Diet</label>
              <select
                id="diet"
                className="border p-3 rounded-lg"
                onChange={handleChange}
                value={formData.diet}
                required
              >
                <option value="">Select Diet</option>
                <option value="Vegetarian">Vegetarian</option>
                <option value="Vegan">Vegan</option>
                <option value="Non-Vegetarian">Non-Vegetarian</option>
              </select>
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
                            idx === index
                              ? { ...ing, name: e.target.value }
                              : ing
                        );
                        setFormData({
                          ...formData,
                          ingredients: newIngredients,
                        });
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
                        setFormData({
                          ...formData,
                          ingredients: newIngredients,
                        });
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
          </AccordionItem>

          {/* Cooking & Prep Section */}
          <AccordionItem title="Cooking & Prep">
            <div className="div-input-wrapper">
              <label htmlFor="prepTime">Prep Time</label>
              <input
                type="number"
                placeholder="Prep Time"
                id="prepTime"
                className="border p-3 rounded-lg"
                required
                onChange={handleChange}
                value={formData.prepTime}
              />
              <label htmlFor="cookTime">Cook Time</label>
              <input
                type="number"
                placeholder="Cook Time"
                id="cookTime"
                className="border p-3 rounded-lg"
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
                  />{" "}
                  1
                </label>
                <label>
                  <input
                    type="radio"
                    name="servings"
                    value="2"
                    checked={formData.servings === "2"}
                    onChange={handleChange}
                  />{" "}
                  2
                </label>
                <label>
                  <input
                    type="radio"
                    name="servings"
                    value="4"
                    checked={formData.servings === "4"}
                    onChange={handleChange}
                  />{" "}
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
                  />{" "}
                  Easy
                </label>
                <label>
                  <input
                    type="radio"
                    name="difficulty"
                    value="Medium"
                    checked={formData.difficulty === "Medium"}
                    onChange={handleChange}
                  />{" "}
                  Medium
                </label>
                <label>
                  <input
                    type="radio"
                    name="difficulty"
                    value="Hard"
                    checked={formData.difficulty === "Hard"}
                    onChange={handleChange}
                  />{" "}
                  Hard
                </label>
              </div>
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
            </div>
          </AccordionItem>

          {/* Media Section */}
          <AccordionItem title="Media Upload">
            <div className="div-input-wrapper">
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
                    onClick={() =>
                      setFormData({ ...formData, bannerImgUrl: "" })
                    }
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
              <label htmlFor="images">Gallery Images:</label>
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
                      alt="recipe"
                      className="w-20 h-20 object-contain rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          imageUrls: formData.imageUrls.filter(
                            (_, i) => i !== index
                          ),
                        })
                      }
                      className="p-3 text-red-700 rounded-lg uppercase hover:opacity-75"
                    >
                      Delete
                    </button>
                  </div>
                ))}
            </div>
          </AccordionItem>

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
        </div>
        <button
          type="submit"
          disabled={loading || uploading}
          className="p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80"
        >
          {loading ? "Updating..." : "Update Recipe"}
        </button>
        {error && <p className="text-red-700 text-sm">{error}</p>}
      </form>
    </main>
  );
}

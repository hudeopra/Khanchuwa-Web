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
import TextEditor from "../components/TextEditor.jsx"; // NEW IMPORT
import {
  uploadImageToFirebase,
  deleteImageFromFirebase,
} from "../utilities/firebaseImageUtils";

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
  const [previousTags, setPreviousTags] = useState({
    ingredientTag: [],
    cuisineTag: [],
    flavourTag: [],
  });

  useEffect(() => {
    async function fetchRecipe() {
      try {
        const res = await fetch(`/api/recipe/${id}`);
        const data = await res.json();
        // Authorization check: make sure current user is allowed to edit
        console.log("recipedetail:", data);
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
            data.ingredients?.length > 0
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
          nutritionalInfo: Array.isArray(data.nutritionalInfo)
            ? data.nutritionalInfo
            : [{ name: "", value: "" }],
          cookInstructions: data.cookInstructions || "",
          prepInstructions: data.prepInstructions || "",
          tags: data.tags || [],
          cookingMethod: data.cookingMethod || [],
          mealCourse: data.mealCourse || [], // Ensure default array
          mealType: data.mealType || [], // Ensure default array
          dietaryRestrictions: data.dietaryRestrictions || [], // Ensure default array
          allergies: data.allergies || [], // Ensure default array
        });
        // Save the original tag arrays for future diff
        setPreviousTags({
          ingredientTag: data.ingredientTag || [],
          cuisineTag: data.cuisineTag || [],
          flavourTag: data.flavourTag || [],
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
      deleteImageFromFirebase(imageUrl)
        .then(() => setFormData((prev) => ({ ...prev, [field]: "" })))
        .catch((err) =>
          console.error("Error deleting image from Firebase:", err)
        );
    }
  };

  // Helper to update a tag reference
  const updateTagReference = async (tagId, recipeId) => {
    try {
      await fetch("/api/tag/addRecipeRef", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagId, recipeId }),
      });
    } catch (err) {
      console.error("Error updating tag reference:", err);
    }
  };

  // Helper to remove a tag reference
  const removeTagReference = async (tagId, recipeId) => {
    try {
      await fetch("/api/tag/removeRecipeRef", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagId, recipeId }),
      });
    } catch (err) {
      console.error("Error removing tag reference:", err);
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
        // Compute removed tags per type
        const removedIngredientTags = previousTags.ingredientTag.filter(
          (tagId) => !formData.ingredientTag.includes(tagId)
        );
        const removedCuisineTags = previousTags.cuisineTag.filter(
          (tagId) => !formData.cuisineTag.includes(tagId)
        );
        const removedFlavourTags = previousTags.flavourTag.filter(
          (tagId) => !formData.flavourTag.includes(tagId)
        );
        // Remove tag references for removed tags
        await Promise.all(
          removedIngredientTags.map((tagId) => removeTagReference(tagId, id))
        );
        await Promise.all(
          removedCuisineTags.map((tagId) => removeTagReference(tagId, id))
        );
        await Promise.all(
          removedFlavourTags.map((tagId) => removeTagReference(tagId, id))
        );
        // For current tags, add recipe reference (optionally you can check new ones only)
        await Promise.all(
          formData.ingredientTag.map((tagId) => updateTagReference(tagId, id))
        );
        await Promise.all(
          formData.cuisineTag.map((tagId) => updateTagReference(tagId, id))
        );
        await Promise.all(
          formData.flavourTag.map((tagId) => updateTagReference(tagId, id))
        );
        navigate(`/recipes/${id}`);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Add a helper to toggle checkbox options
  const toggleOption = (field, option) => {
    setFormData((prev) => {
      const current = prev[field] || [];
      if (current.includes(option)) {
        return { ...prev, [field]: current.filter((o) => o !== option) };
      } else {
        return { ...prev, [field]: [...current, option] };
      }
    });
  };

  if (loading) return <p>Loading recipe data...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <main className="kh-recipe-form">
      <form onSubmit={handleSubmit} className="">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center">
              <h1 className="text-3xl font-semibold text-center my-7">
                Edit a Recipe
              </h1>
            </div>
            <div className="col-12 col-md-8">
              <AccordionItem title="Recipe Information">
                <div className="div-input-wrapper">
                  <h4>Recipe Information</h4>
                  <div className="row">
                    <div className="col-8">
                      <div className="row">
                        <div className="col-6">
                          <div className="kh-recipe-form__form--item">
                            <input
                              type="hidden"
                              id="userRef"
                              value={currentUser._id}
                            />
                            <label htmlFor="recipeName">Name</label>
                            <input
                              type="text"
                              placeholder="Name"
                              className=""
                              id="recipeName"
                              maxLength="62"
                              minLength="10"
                              pattern="^[A-Za-z\s\-\'\u00C0-\u017F]{10,62}$" // Regex pattern for validating recipe name
                              onChange={handleChange}
                              value={formData.recipeName}
                            />
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="kh-recipe-form__form--item">
                            <label htmlFor="videoUrl">Video URL</label>
                            <input
                              type="text"
                              id="videoUrl"
                              placeholder="Video URL"
                              className=""
                              pattern="^(https?:\\/\\/)?([\\da-z\\.-]+)\\.([a-z\\.]{2,6})([\\/\\w \\.-]*)*\\/?$" // Regex pattern for validating video URLs
                              onChange={handleChange}
                              value={formData.videoUrl}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="kh-recipe-form__form--item kh-recipe-form__checkbox">
                        <label htmlFor="description">Long Description</label>
                        <textarea
                          id="description"
                          placeholder="Description"
                          className=""
                          maxLength="1000" // Limit to 1000 characters
                          pattern="^[\s\S]{0,1000}$" // Regex pattern for validating long descriptions
                          onChange={handleChange}
                          value={formData.description}
                        />
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="kh-recipe-form__form--item">
                        <label htmlFor="shortDescription">
                          Short Description
                        </label>
                        <textarea
                          id="shortDescription"
                          placeholder="Short description"
                          className=""
                          maxLength="500" // Limit to 500 characters
                          pattern="^[\s\S]{0,500}$" // Regex pattern for validating short descriptions
                          onChange={handleChange}
                          value={formData.shortDescription}
                        />
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="kh-recipe-form__form--item kh-recipe-form__checkbox">
                        <label>Meal Course</label>
                        <div className="kh-input-checkbox-wrapper">
                          {[
                            "Appetizer",
                            "Soup",
                            "Main Course (Entrée)",
                            "Side Dish",
                            "Dessert",
                          ].map((opt) => (
                            <div
                              className={`kh-recipe-form__checkbox--item ${
                                formData.mealCourse?.includes(opt)
                                  ? "checked"
                                  : ""
                              }`}
                              key={opt}
                            >
                              <input
                                type="checkbox"
                                checked={
                                  formData.mealCourse?.includes(opt) || false
                                } // Ensure checked state
                                onChange={() => toggleOption("mealCourse", opt)}
                              />
                              <label>{opt}</label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="kh-recipe-form__form--item kh-recipe-form__checkbox">
                        <label>Meal Time</label>
                        <div className="kh-input-checkbox-wrapper">
                          {[
                            "Snack",
                            "Breakfast",
                            "Brunch",
                            "Afternoon Tea",
                            "Lunch",
                            "Dinner",
                            "Supper",
                            "Late Night Snack",
                          ].map((opt) => (
                            <div
                              className={`kh-recipe-form__checkbox--item ${
                                formData.mealType?.includes(opt)
                                  ? "checked"
                                  : ""
                              }`}
                              key={opt}
                            >
                              <input
                                type="checkbox"
                                checked={
                                  formData.mealType?.includes(opt) || false
                                } // Ensure checked state
                                onChange={() => toggleOption("mealType", opt)}
                              />
                              <label>{opt}</label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="kh-recipe-form__form--item kh-recipe-form__checkbox">
                        <label>Cooking Method</label>
                        <div className="kh-input-checkbox-wrapper">
                          {[
                            "Stir-fried",
                            "Grilled",
                            "Baked",
                            "Boiled",
                            "Fried",
                            "Roasting",
                            "Steamed",
                            "Simmered",
                            "Fresh",
                          ].map((opt) => (
                            <div
                              className={`kh-recipe-form__checkbox--item ${
                                formData.cookingMethod?.includes(opt)
                                  ? "checked"
                                  : ""
                              }`}
                              key={opt}
                            >
                              <input
                                type="checkbox"
                                checked={
                                  formData.cookingMethod?.includes(opt) || false
                                } // Ensure checked state
                                onChange={() =>
                                  toggleOption("cookingMethod", opt)
                                }
                              />
                              <label>{opt}</label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="kh-recipe-form__form--item kh-recipe-form__checkbox">
                        <label>Dietary Restrictions:</label>
                        <div className="kh-input-checkbox-wrapper">
                          {[
                            "Vegetarian",
                            "Vegan",
                            "Gluten-Free",
                            "Dairy-Free",
                            "Nut-Free",
                          ].map((opt) => (
                            <div
                              className={`kh-recipe-form__checkbox--item ${
                                formData.dietaryRestrictions?.includes(opt)
                                  ? "checked"
                                  : ""
                              }`}
                              key={opt}
                            >
                              <input
                                type="checkbox"
                                checked={
                                  formData.dietaryRestrictions?.includes(opt) ||
                                  false
                                }
                                onChange={() =>
                                  toggleOption("dietaryRestrictions", opt)
                                }
                              />
                              <label>{opt}</label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="kh-recipe-form__form--item kh-recipe-form__checkbox">
                        <label>Allergies:</label>
                        <div className="kh-input-checkbox-wrapper">
                          {[
                            "Peanuts",
                            "Shellfish",
                            "Dairy",
                            "Gluten",
                            "Soy",
                          ].map((opt) => (
                            <div
                              className={`kh-recipe-form__checkbox--item ${
                                formData.allergies?.includes(opt)
                                  ? "checked"
                                  : ""
                              }`}
                              key={opt}
                            >
                              <input
                                type="checkbox"
                                checked={
                                  formData.allergies?.includes(opt) || false
                                }
                                onChange={() => toggleOption("allergies", opt)}
                              />
                              <label>{opt}</label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionItem>
              <AccordionItem title="Tags">
                <div className="div-input-wrapper">
                  <h4>Tags</h4>
                  <div className="kh-tagselector__tag-wrapper">
                    <div className="kh-recipe-form__form--item ">
                      <span>Cuisine Tags</span>
                      <TagSelector
                        attribute="cuisineTag"
                        value={formData.cuisineTag.map((t) => t.tagName)} // Map to tagName
                        onSelect={(selected) =>
                          setFormData((prev) => {
                            const existingTags = prev.cuisineTag || [];
                            const updatedTags = selected.map((t) => ({
                              tagId: t.tagId || t._id, // Preserve tagId or fallback to _id
                              tagName: t.tagName,
                            }));
                            return {
                              ...prev,
                              cuisineTag: [
                                ...existingTags,
                                ...updatedTags,
                              ].filter(
                                (tag, index, self) =>
                                  index ===
                                  self.findIndex((t) => t.tagId === tag.tagId)
                              ), // Ensure no duplicates
                            };
                          })
                        }
                      />
                    </div>
                    <div className="kh-recipe-form__form--item  ">
                      <span>Flavour Tags</span>
                      <TagSelector
                        attribute="flavourTag"
                        value={formData.flavourTag.map((t) => t.tagName)} // Map to tagName
                        onSelect={(selected) =>
                          setFormData((prev) => {
                            const existingTags = prev.flavourTag || [];
                            const updatedTags = selected.map((t) => ({
                              tagId: t.tagId || t._id, // Preserve tagId or fallback to _id
                              tagName: t.tagName,
                            }));
                            return {
                              ...prev,
                              flavourTag: [
                                ...existingTags,
                                ...updatedTags,
                              ].filter(
                                (tag, index, self) =>
                                  index ===
                                  self.findIndex((t) => t.tagId === tag.tagId)
                              ), // Ensure no duplicates
                            };
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="kh-recipe-form__form--item">
                    <span>Ingredient Tags</span>
                    <TagSelector
                      attribute="ingredientTag"
                      value={formData.ingredientTag.map((t) => t.tagName)} // Map to tagName
                      onSelect={(selected) =>
                        setFormData((prev) => {
                          const existingTags = prev.ingredientTag || [];
                          const updatedTags = selected.map((t) => ({
                            tagId: t.tagId || t._id, // Preserve tagId or fallback to _id
                            tagName: t.tagName,
                          }));
                          return {
                            ...prev,
                            ingredientTag: [
                              ...existingTags,
                              ...updatedTags,
                            ].filter(
                              (tag, index, self) =>
                                index ===
                                self.findIndex((t) => t.tagId === tag.tagId)
                            ), // Ensure no duplicates
                            ingredients: [
                              ...prev.ingredients,
                              ...selected.map((t) => ({
                                name: t.tagName,
                                quantity: "",
                              })),
                            ].filter(
                              (ingredient, index, self) =>
                                index ===
                                self.findIndex(
                                  (i) => i.name === ingredient.name
                                )
                            ), // Ensure no duplicate ingredients
                          };
                        })
                      }
                    />

                    <div className="kh-recipe-form__form--item">
                      <label>Ingredients:</label>
                      {formData.ingredients.map((ingredient, index) => (
                        <div key={index} className="kh-recipe-form__ingredient">
                          <div className="kh-recipe-form__ingredient--item">
                            <label htmlFor={`ingredient-name-${index}`}>
                              Name {index + 1}
                            </label>
                            <input
                              id={`ingredient-name-${index}`}
                              type="text"
                              placeholder="Ingredient name"
                              className="   my-1"
                              value={ingredient.name || ""} // Ensure default value
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
                            />
                          </div>
                          <div className="kh-recipe-form__ingredient--item">
                            {" "}
                            <label htmlFor={`ingredient-qty-${index}`}>
                              Quantity {index + 1}
                            </label>
                            <input
                              id={`ingredient-qty-${index}`}
                              type="text"
                              placeholder="Quantity"
                              className="   my-1"
                              value={ingredient.quantity || ""} // Ensure default value
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
                            />
                            <div className="kh-recipe-form__ingredient--remove">
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
                                  className="kh-btn kh-btn__x"
                                >
                                  x
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {/* <button
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
                        className=""
                      >
                        Add Ingredient
                      </button> */}
                    </div>
                  </div>
                </div>
              </AccordionItem>
              <AccordionItem title="Instructions">
                <div className="div-input-wrapper">
                  <label>Preparation Instructions:</label>
                  <TextEditor
                    value={formData.prepInstructions || ""} // Ensure default value
                    onChange={(val) =>
                      setFormData({ ...formData, prepInstructions: val })
                    }
                  />
                  <label>Cooking Instructions:</label>
                  <TextEditor
                    value={formData.cookInstructions || ""} // Ensure default value
                    onChange={(val) =>
                      setFormData({ ...formData, cookInstructions: val })
                    }
                  />
                </div>
              </AccordionItem>
            </div>
            <div className="col-12 col-md-3">
              <div className="kh-recipe-form__admin">
                <label htmlFor="chefName"></label>
                <input
                  type="text"
                  id="chefName"
                  className="  text-center"
                  value={formData.chefName}
                  onChange={handleChange}
                />
                <div className="kh-recipe-form__admin--submit">
                  <input type="hidden" id="userRef" value={currentUser._id} />

                  <button
                    type="submit"
                    disabled={loading || uploading}
                    className=" "
                  >
                    {loading ? "Updating..." : "Update Recipe"}
                  </button>
                  {error && <p className="text-red-700 text-sm">{error}</p>}
                </div>
              </div>
              <AccordionItem title="Fivegrid ">
                <div className="div-input-wrapper">
                  <h4>Cooking and Prep</h4>
                  <div className="kh-recipe-form__fiveGrid">
                    <div className="kh-recipe-form__form--item">
                      <label htmlFor="diet">Diet</label>
                      <select
                        id="diet"
                        className=" nice-select "
                        onChange={handleChange}
                        value={formData.diet}
                      >
                        <option value="">Select Diet</option>
                        <option value="Vegetarian">Vegetarian</option>
                        <option value="Vegan">Vegan</option>
                        <option value="Non-Vegetarian">Non-Vegetarian</option>
                        <option value="Gluten-Free">Gluten-Free</option>
                        <option value="High Protein">High Protein</option>
                      </select>
                    </div>
                    <div className="kh-recipe-form__form--item">
                      <label htmlFor="difficulty">Difficulty</label>
                      <select
                        id="difficulty"
                        className=" nice-select "
                        onChange={handleChange}
                        value={formData.difficulty}
                      >
                        <option value="">Select Difficulty</option>
                        <option value="Very Easy">Very Easy</option>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                        <option value="Very Hard">Very Hard</option>
                      </select>
                    </div>
                    <div className="kh-recipe-form__form--item">
                      <label htmlFor="prepTime">Prep Time</label>
                      <input
                        type="number"
                        placeholder="Prep Time"
                        className=""
                        id="prepTime"
                        pattern="^[1-9][0-9]{0,2}$" // Regex pattern for validating prep time
                        onChange={handleChange}
                        value={formData.prepTime}
                      />
                    </div>
                    <div className="kh-recipe-form__form--item">
                      <label htmlFor="cookTime">Cook Time</label>
                      <input
                        type="number"
                        placeholder="Cook Time"
                        className=""
                        id="cookTime"
                        pattern="^[1-9][0-9]{0,2}$" // Regex pattern for validating cook time
                        onChange={handleChange}
                        value={formData.cookTime}
                      />
                    </div>
                    <div className="kh-recipe-form__form--item">
                      <label htmlFor="servings">Servings:</label>
                      <select
                        id="servings"
                        className="nice-select "
                        value={formData.servings}
                        onChange={handleChange}
                      >
                        <option value="">Select Servings</option>
                        {[1, 2, 4, 6, 8, 10, 12].map((option) => (
                          <option key={option} value={option.toString()}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </AccordionItem>
              <AccordionItem title="Nutritional Info ">
                <div className="div-input-wrapper">
                  <h4>Nutritional Info</h4>
                  <div className="kh-recipe-form__nutritional">
                    {formData.nutritionalInfo.map((item, idx) => (
                      <div
                        key={idx}
                        className="kh-recipe-form__nutritional__item"
                      >
                        <label className="" htmlFor={`nutritional-info-${idx}`}>
                          {item.name}
                        </label>
                        <input
                          id={`nutritional-info-${idx}`}
                          name={`nutritional-info-${idx}`}
                          type="text"
                          placeholder={`Enter ${item.name}`}
                          pattern="^(\d{1,3}(\.\d{1,2})?|1000)$" // Strict regex for numbers and decimals from 0 to 1000
                          onChange={(e) => {
                            const regex = /^(\d{1,3}(\.\d{1,2})?|1000)$/;
                            if (
                              regex.test(e.target.value) ||
                              e.target.value === ""
                            ) {
                              const newInfo = formData.nutritionalInfo.map(
                                (info, i) =>
                                  i === idx
                                    ? { ...info, value: e.target.value }
                                    : info
                              );
                              setFormData({
                                ...formData,
                                nutritionalInfo: newInfo,
                              });
                            }
                          }}
                          value={item.value}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </AccordionItem>
              <AccordionItem title="Media Upload ">
                <div className="div-input-wrapper kh-media-upload">
                  <h4>Media Upload</h4>
                  <div className="kh-recipe-form__form--item">
                    <label htmlFor="bannerImg">Banner Image</label>
                    <input
                      type="file"
                      accept="image/png, image/jpeg"
                      id="bannerImg"
                      onChange={handleBannerSelect}
                    />
                    {formData.bannerImgUrl && (
                      <div className="kh-media-upload__preview">
                        <img
                          src={formData.bannerImgUrl}
                          alt="Banner"
                          className=""
                        />
                        <button
                          type="button"
                          onClick={() => handleImageRemove("bannerImgUrl")}
                          className="kh-btn kh-btn__x"
                        >
                          x
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="kh-recipe-form__form--item">
                    <label htmlFor="favImg">Favorite Image</label>
                    <input
                      type="file"
                      accept="image/png, image/jpeg"
                      id="favImg"
                      onChange={handleFavSelect}
                    />
                    {formData.favImgUrl && (
                      <div className="kh-media-upload__preview">
                        <img
                          src={formData.favImgUrl}
                          alt="Favorite"
                          className=""
                        />
                        <button
                          type="button"
                          onClick={() => handleImageRemove("favImgUrl")}
                          className="kh-btn kh-btn__x"
                        >
                          x
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="kh-recipe-form__form--item">
                    <label htmlFor="images">Gallery Images:</label>
                    <input
                      onChange={handleFileSelect}
                      className="  -gray-300  w-full"
                      type="file"
                      id="images"
                      accept="image/*"
                      multiple
                    />
                    <p className="text-red-700 text-sm">
                      {imageUploadError && imageUploadError}
                    </p>
                    <div className="kh-media-upload__flex">
                      {formData.imageUrls.length > 0 &&
                        formData.imageUrls.map((url, index) => (
                          <div key={url} className="kh-media-upload__preview ">
                            <img src={url} alt="recipe image" className="" />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="kh-btn kh-btn__x"
                            >
                              x
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </AccordionItem>
            </div>
          </div>
        </div>
      </form>
    </main>
  );
}

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
import TagSelector from "../components/TagSelector.jsx";
import AccordionItem from "../components/AccordionItem.jsx";
import TextEditor from "../components/TextEditor.jsx"; // NEW IMPORT

export default function CreateRecipe() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    imageUrls: [],
    recipeName: "",
    description: "",
    diet: "",
    ingredients: [{ name: "", quantity: "" }], // default to 2 ingredients
    prepTime: "",
    cookTime: "",
    servings: "",
    difficulty: "",
    chefName: "",
    videoUrl: "",
    flavourTag: [],
    cuisineTag: [],
    ingredientTag: [],
    bannerImgUrl: "", // Banner image URL
    favImgUrl: "", // Favorite image URL
    shortDescription: "",
    nutritionalInfo: [
      { name: "Calories", value: "" },
      { name: "Carbohydrates", value: "" },
      { name: "Protein", value: "" },
      { name: "Fat", value: "" },
    ], // default to 2 items
    cookInstructions: "", // Initialize the new instructions as empty strings
    prepInstructions: "", // Initialize the new instructions as empty strings
    tags: [],
    mealType: [], // UPDATED: multiple meal types can be selected
    cookingMethod: [], // UPDATED: cooking methods (multiple), will include extra +1 option
  });
  const [imageUploadError, setImageUploadError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  // Set chefName from currentUser’s username
  useEffect(() => {
    // Use nested user object if available.
    const username = currentUser?.user?.username || currentUser?.username;
    if (username) {
      setFormData((prev) => ({ ...prev, chefName: username }));
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

  // Add helper to update an ingredient tag with the new recipe reference
  const updateIngredientTagReference = async (tagId, recipeId) => {
    try {
      await fetch("/api/tag/addRecipeRef", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagId, recipeId }),
      });
    } catch (err) {
      console.error("Error updating ingredient tag reference:", err);
    }
  };

  // Add helper to update a tag’s recipeRefs array with the newly created recipe’s _id
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);
    // Validation: ensure imageUrls, bannerImgUrl, favImgUrl are present.
    if (formData.imageUrls.length < 1)
      return setError("You must upload at least one image");
    if (!formData.bannerImgUrl) return setError("Banner image is .");
    if (!formData.favImgUrl) return setError("Favorite image is .");
    // Updated user reference validation:
    const userId = currentUser?._id || currentUser?.user?._id;
    if (!userId) return setError("User reference is missing.");

    setLoading(true);
    setError(false);
    // Process cuisineTag input
    const processedcuisineTag = formData.cuisineTag.reduce((acc, item) => {
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

    // Build the bodyData using the valid userId.
    const bodyData = {
      ...formData,
      cuisineTag: processedcuisineTag, // now directly send cuisine names as strings
      userRef: userId,
    };

    try {
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
        // Update each ingredient tag used:
        await Promise.all(
          formData.ingredientTag.map((tagId) =>
            updateIngredientTagReference(tagId, data._id)
          )
        );
        // For each ingredient tag used, update the tag with the new recipe's _id.
        await Promise.all(
          formData.ingredientTag.map((tagId) =>
            updateTagReference(tagId, data._id)
          )
        );
        // Update for ingredientTag, cuisineTag and flavourTag
        await Promise.all(
          formData.ingredientTag.map((tagId) =>
            updateTagReference(tagId, data._id)
          )
        );
        await Promise.all(
          formData.cuisineTag.map((tagId) =>
            updateTagReference(tagId, data._id)
          )
        );
        await Promise.all(
          formData.flavourTag.map((tagId) =>
            updateTagReference(tagId, data._id)
          )
        );
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

  // Helper to toggle checkbox options
  const toggleOption = (field, option) => {
    setFormData((prev) => {
      const current = prev[field] || [];
      return current.includes(option)
        ? { ...prev, [field]: current.filter((o) => o !== option) }
        : { ...prev, [field]: [...current, option] };
    });
  };

  return (
    <main className="kh-recipe-form">
      <form onSubmit={handleSubmit} className="">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center">
              <h1 className="text-3xl font-semibold text-center my-7">
                Create a Recipe
              </h1>
            </div>
            <div className="col-8">
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
                              className="border  rounded-lg"
                              id="recipeName"
                              maxLength="62"
                              minLength="10"
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
                              className="border  rounded-lg"
                              onChange={handleChange}
                              value={formData.videoUrl}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="kh-recipe-form__form--item">
                        <label>Meal Type</label>
                        {[
                          "Appetizer",
                          "Main Course",
                          "Dessert",
                          "Snack",
                          "Beverage",
                          "Lunch",
                          "Dinner",
                          "Breakfast",
                        ].map((opt) => (
                          <div key={opt}>
                            <input
                              type="checkbox"
                              checked={
                                formData.mealType?.includes(opt) || false
                              }
                              onChange={() => toggleOption("mealType", opt)}
                            />
                            <label>{opt}</label>
                          </div>
                        ))}
                      </div>
                      <div className="kh-recipe-form__form--item">
                        <label htmlFor="description">Long Description</label>
                        <textarea
                          id="description"
                          placeholder="Description"
                          className="border  rounded-lg"
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
                          className="border  rounded-lg"
                          onChange={handleChange}
                          value={formData.shortDescription}
                        />
                      </div>
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
                        <label
                          className="w-32"
                          htmlFor={`nutritional-info-${idx}`}
                        >
                          {item.name}
                        </label>
                        <input
                          id={`nutritional-info-${idx}`}
                          name={`nutritional-info-${idx}`}
                          type="text"
                          value={item.value}
                          onChange={(e) => {
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
                          }}
                          placeholder="Enter amount"
                          className="border p-2 rounded"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </AccordionItem>
              <AccordionItem title="Fivegrid ">
                <div className="div-input-wrapper">
                  <h4>Cooking and Prep</h4>
                  <div className="kh-recipe-form__fiveGrid">
                    <div className="kh-recipe-form__form--item">
                      <label htmlFor="diet">Diet</label>
                      <select
                        id="diet"
                        className="border  rounded-lg"
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
                        className="border  rounded-lg"
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
                        className="border  rounded-lg"
                        id="prepTime"
                        onChange={handleChange}
                        value={formData.prepTime}
                      />
                    </div>
                    <div className="kh-recipe-form__form--item">
                      <label htmlFor="cookTime">Cook Time</label>
                      <input
                        type="number"
                        placeholder="Cook Time"
                        className="border  rounded-lg"
                        id="cookTime"
                        onChange={handleChange}
                        value={formData.cookTime}
                      />
                    </div>
                    <div className="kh-recipe-form__form--item">
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
                    <div className="kh-recipe-form__form--item">
                      <label>Cooking Method</label>
                      {[
                        "Grilled",
                        "Baked",
                        "Boiled",
                        "Fried",
                        "Roasting",
                        "Steamed",
                        "Simmering",
                        "Raw",
                        "+1",
                      ].map((opt) => (
                        <div key={opt}>
                          <input
                            type="checkbox"
                            checked={
                              formData.cookingMethod?.includes(opt) || false
                            }
                            onChange={() => toggleOption("cookingMethod", opt)}
                          />
                          <label>{opt}</label>
                        </div>
                      ))}
                    </div>
                  </div>
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
                            className="border  rounded-lg my-1"
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
                            className="border  rounded-lg my-1"
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
                          />
                        </div>
                        <div className="kh-recipe-form__ingredient--item">
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
                              className=""
                            >
                              Remove
                            </button>
                          )}
                        </div>
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
                      className=""
                    >
                      Add Ingredient
                    </button>
                  </div>
                </div>
              </AccordionItem>
              <AccordionItem title="Instructions">
                <div className="div-input-wrapper">
                  <label>Preparation Instructions:</label>
                  <TextEditor
                    value={formData.prepInstructions}
                    onChange={(val) =>
                      setFormData({ ...formData, prepInstructions: val })
                    }
                  />
                  <label>Cooking Instructions:</label>
                  <TextEditor
                    value={formData.cookInstructions}
                    onChange={(val) =>
                      setFormData({ ...formData, cookInstructions: val })
                    }
                  />
                </div>
              </AccordionItem>
            </div>
            <div className="col-3">
              <div className="kh-recipe-form__admin">
                <p>Author: {formData.chefName}</p>
                <div className="submitwrapper">
                  <input type="hidden" id="userRef" value={currentUser._id} />

                  <button
                    type="submit"
                    disabled={loading || uploading}
                    className=" "
                  >
                    {loading ? "Creating..." : "Create Recipe"}
                  </button>
                  {error && <p className="text-red-700 text-sm">{error}</p>}
                </div>
              </div>
              <AccordionItem title="Media Upload ">
                <div className="div-input-wrapper">
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
                      <div className="flex items-center gap-2">
                        <img
                          src={formData.bannerImgUrl}
                          alt="Banner"
                          className="w-20 h-20 object-contain rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              bannerImgUrl: "",
                            })
                          }
                          className="p-2 text-red-700 rounded-lg"
                        >
                          Delete
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
                      <div className="flex items-center gap-2">
                        <img
                          src={formData.favImgUrl}
                          alt="Favorite"
                          className="w-20 h-20 object-contain rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              favImgUrl: "",
                            })
                          }
                          className="p-2 text-red-700 rounded-lg"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="kh-recipe-form__form--item">
                    <label htmlFor="images">Gallery Images:</label>
                    <input
                      onChange={handleFileSelect}
                      className=" border border-gray-300 rounded w-full"
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
                          className="flex justify-between  border items-center"
                        >
                          <img
                            src={url}
                            alt="recipe image"
                            className="w-20 h-20 object-contain rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className=" text-red-700 rounded-lg uppercase hover:opacity-75"
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              </AccordionItem>
              <AccordionItem title="Tags">
                <div className="div-input-wrapper">
                  <h4>Tags</h4>
                  <div className="kh-recipe-form__form--item">
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
                  <div className="kh-recipe-form__form--item">
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
                  <div className="kh-recipe-form__form--item">
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
                </div>
              </AccordionItem>
            </div>
          </div>
        </div>
      </form>
    </main>
  );
}

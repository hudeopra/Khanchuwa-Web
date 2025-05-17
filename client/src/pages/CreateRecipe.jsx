import { useState, useEffect } from "react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useAlert } from "../components/AlertContext";
import TagSelector from "../components/TagSelector.jsx";
import AccordionItem from "../components/AccordionItem.jsx";
import TextEditor from "../components/TextEditor.jsx"; // NEW IMPORT
import {
  uploadImageToFirebase,
  deleteImageFromFirebase,
} from "../utilities/firebaseImageUtils";

export default function CreateRecipe() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showAlert } = useAlert();
  const [redirected, setRedirected] = useState(false);
  const [localCurrentUser, setLocalCurrentUser] = useState(null); // Added local state for current user
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
    mealType: [], // UPDATED: multiple meal types can be selected
    cookingMethod: [], // UPDATED: cooking methods (multiple), will include extra +1 option
    dietaryRestrictions: [], // NEW: dietary restrictions
    allergies: [], // NEW: allergies
  });
  const [imageUploadError, setImageUploadError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  // Set chefName from currentUser’s fullname
  useEffect(() => {
    const username = currentUser?.username; // Access fullname directly
    if (username) {
      setFormData((prev) => ({ ...prev, chefName: username }));
    }
  }, [currentUser]);

  useEffect(() => {
    // Log formData changes to the console
    console.log("Form data updated:", formData);
  }, [formData]);

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

    const userId = currentUser?._id || currentUser?.user?._id;
    if (!userId) return setError("User reference is missing.");

    setLoading(true);
    setError(false);

    // Format tags to include both tagId and tagName
    const formatTags = (tags, dbTags = []) =>
      tags.map((tagId) => {
        const tag = dbTags.find((t) => t._id === tagId);
        return { tagId, tagName: tag?.name || "Unknown" };
      });

    const bodyData = {
      ...formData,
      cuisineTag: formatTags(formData.cuisineTag, formData.cuisineTagDb || []), // Ensure cuisineTag is included
      flavourTag: formatTags(formData.flavourTag, formData.flavourTagDb || []),
      ingredientTag: formatTags(
        formData.ingredientTag,
        formData.ingredientTagDb || []
      ),
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

  // Add helper function to remove a field:
  const removeField = (field, index) => {
    if (field === "nutritionalInfo" && formData.nutritionalInfo.length >= 3) {
      const newArr = formData[field].filter((_, i) => i !== index);
      setFormData({ ...formData, [field]: newArr });
    } else if (
      (field === "cookInstructions" || field === "prepInstructions") &&
      formData[field].length > 0
    ) {
      setFormData({ ...formData, [field]: "" }); // Reset the string field
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
          showAlert("danger", "You must be a creator to access this page");
          setRedirected(true); // Mark as redirected
          navigate("/"); // Redirect to homepage
          return; // Exit early
        }

        setLocalCurrentUser(data); // Set local current user
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
            <div className="col-12 col-md-8">
              <AccordionItem title="Recipe Information">
                <div className="div-input-wrapper">
                  <h4>Recipe Information</h4>
                  <div className="row">
                    <div className="col-8">
                      <div className="row">
                        <div className="col-6">
                          <div className="kh-recipe-form__form--item kh-input-item">
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
                              pattern="^[A-Za-z\s\-\'\u00C0-\u017F]{10,62}$" // Added regex pattern
                              onChange={handleChange}
                              value={formData.recipeName}
                              required
                            />
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="kh-recipe-form__form--item kh-input-item">
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
                      <div className="kh-recipe-form__form--item kh-input-item">
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
                      <div className="kh-recipe-form__form--item kh-input-item">
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
                      <div className="kh-recipe-form__form--item  kh-recipe-form__checkbox">
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
                                }
                                onChange={() => toggleOption("mealCourse", opt)}
                              />
                              <label>{opt}</label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="kh-recipe-form__form--item  kh-recipe-form__checkbox">
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
                                }
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
                                }
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
                  <div className="kh-recipe-form__form--item ">
                    <span>Cuisine Tags</span>
                    <TagSelector
                      attribute="cuisineTag"
                      value={formData.cuisineTag.map((t) => t._id)} // Map to tag IDs
                      onSelect={(selected) =>
                        setFormData((prev) => ({
                          ...prev,
                          cuisineTag: selected.map((t) => t._id), // Store only tag IDs
                        }))
                      }
                    />
                  </div>
                  <div className="kh-recipe-form__form--item ">
                    <span>Flavour Tags</span>
                    <TagSelector
                      attribute="flavourTag"
                      value={formData.flavourTag.map((t) => t._id)} // Map to tag IDs
                      onSelect={(selected) =>
                        setFormData((prev) => ({
                          ...prev,
                          flavourTag: selected.map((t) => t._id), // Store only tag IDs
                        }))
                      }
                    />
                  </div>
                  <div className="kh-recipe-form__form--item ">
                    <span>Ingredient Tags</span>
                    <TagSelector
                      attribute="ingredientTag"
                      value={formData.ingredientTag.map((t) => t._id)} // Map to tag IDs
                      onSelect={(selected) =>
                        setFormData((prev) => ({
                          ...prev,
                          ingredientTag: selected.map((t) => t._id), // Store only tag IDs
                          ingredients: selected.map((t) => ({
                            name: t.name,
                            quantity: "",
                          })),
                        }))
                      }
                    />
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
            <div className="col-12 col-md-4">
              <div className="kh-recipe-form__admin">
                <p>
                  Author: <span>@{formData.chefName}</span>
                </p>
                <div className="kh-recipe-form__admin--submit">
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
              <AccordionItem title="Cooking and Prep ">
                <div className="div-input-wrapper">
                  <div className="kh-recipe-form__wrapper">
                    <div className="kh-recipe-form__form--item kh-input-item">
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
                    <div className="kh-recipe-form__form--item kh-input-item">
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
                    <div className="kh-recipe-form__form--item kh-input-item">
                      <label htmlFor="prepTime">Prep Time</label>
                      <input
                        type="number"
                        placeholder="Prep Time"
                        className="  "
                        id="prepTime"
                        pattern="^[1-9][0-9]{0,2}$" // Regex pattern for validating prep time
                        onChange={handleChange}
                        value={formData.prepTime}
                      />
                    </div>
                    <div className="kh-recipe-form__form--item kh-input-item">
                      <label htmlFor="cookTime">Cook Time</label>
                      <input
                        type="number"
                        placeholder="Cook Time"
                        className="  "
                        id="cookTime"
                        pattern="^[1-9][0-9]{0,2}$" // Regex pattern for validating cook time
                        onChange={handleChange}
                        value={formData.cookTime}
                      />
                    </div>
                    <div className="kh-recipe-form__form--item kh-input-item">
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
                    <div className="kh-recipe-form__form--item kh-input-item">
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
                              className="   my-1"
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
                        <label htmlFor={`nutritional-info-${idx}`}>
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
                  <div className="kh-recipe-form__form--item kh-input-item">
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
                  <div className="kh-recipe-form__form--item kh-input-item">
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
                  <div className="kh-recipe-form__form--item kh-input-item">
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
                          <div key={url} className="kh-media-upload__preview">
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

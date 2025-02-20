import { useState } from "react";
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
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    imageUrls: [],
    recipeName: "",
    description: "",
    diet: "",
    ingredients: "",
    prepTime: "",
    cookTime: "",
    servings: "",
    difficulty: "",
    chefName: "",
    recipeTester: "",
    recipeTag: "",
    cuisine: "",
  });
  const [imageUploadError, setImageUploadError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleImageSubmit = (e) => {
    if (files.length > 0 && files.length + formData.imageUrls.length < 7) {
      setUploading(true);
      setImageUploadError(false);
      const promises = [];

      for (let i = 0; i < files.length; i++) {
        promises.push(storeImage(files[i]));
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
      setImageUploadError("CreateRecipe.jsx: Max 6 images uploadable");
      setUploading(false);
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

      const res = await fetch(`/api/recipe/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          userRef: currentUser._id, // Ensure userRef is included in the request body
        }),
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

  return (
    <main className="p-3 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">
        Create a Recipe
      </h1>
      <form
        onSubmit={handleSubmit}
        className="flex flex-wrap sm:flex-row gap-4"
      >
        <input type="hidden" id="userRef" value={currentUser._id} />
        <div className="flex flex-wrap gap-4 flex-1">
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
          <textarea
            type="text"
            placeholder="Description"
            className="border p-3 rounded-lg"
            id="description"
            required
            onChange={handleChange}
            value={formData.description}
          />
          <input
            type="text"
            placeholder="Diet (e.g., vegetarian, non-vegetarian, vegan)"
            className="border p-3 rounded-lg"
            id="diet"
            required
            onChange={handleChange}
            value={formData.diet}
          />
          <textarea
            type="text"
            placeholder="Ingredients (comma separated)"
            className="border p-3 rounded-lg"
            id="ingredients"
            required
            onChange={handleChange}
            value={formData.ingredients}
          />
          <input
            type="text"
            placeholder="Prep Time"
            className="border p-3 rounded-lg"
            id="prepTime"
            required
            onChange={handleChange}
            value={formData.prepTime}
          />
          <input
            type="text"
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
          <input
            type="text"
            placeholder="Author/Chef"
            className="border p-3 rounded-lg"
            id="chefName"
            required
            onChange={handleChange}
            value={formData.chefName}
          />
          <input
            type="text"
            placeholder="Recipe Tester"
            className="border p-3 rounded-lg"
            id="recipeTester"
            required
            onChange={handleChange}
            value={formData.recipeTester}
          />
          <input
            type="text"
            placeholder="Cuisine"
            className="border p-3 rounded-lg"
            id="cuisine"
            required
            onChange={handleChange}
            value={formData.cuisine}
          />
          <textarea
            type="text"
            placeholder="Recipe Tags (comma separated)"
            className="border p-3 rounded-lg"
            id="recipeTag"
            required
            onChange={handleChange}
            value={formData.recipeTags}
          />
          <p className="font-semibold">
            Images:
            <span className="font-normal text-gray-600 ml-2">
              The first image will be the cover (max 6)
            </span>
          </p>
          <div className="flex gap-4">
            <input
              onChange={(e) => setFiles(e.target.files)}
              className="p-3 border border-gray-300 rounded w-full"
              type="file"
              id="images"
              accept="image/*"
              multiple
            />
            <button
              type="button"
              disabled={uploading}
              onClick={handleImageSubmit}
              className="p-3 text-green-700 border border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-80"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
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

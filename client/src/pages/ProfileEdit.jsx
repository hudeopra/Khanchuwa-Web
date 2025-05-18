import { useSelector, useDispatch } from "react-redux";
import { useRef, useState, useEffect } from "react";
import { app } from "../firebase";
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  signOutUserStart,
  signOutUserSuccess,
  signOutUserFailure,
} from "../redux/user/userSlice";
import { Link } from "react-router-dom";
import BootstrapAlert from "../components/BootstrapAlert";
import ProfileNav from "../components/ProfileNav";
import { useAlert } from "../components/AlertContext"; // Import the alert context
import {
  uploadImageToFirebase,
  deleteImageFromFirebase,
} from "../utilities/firebaseImageUtils";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa"; // Import FontAwesome icons

// Updated PasswordFeedback component to show only unmet conditions
const PasswordFeedback = ({ password }) => {
  const conditions = [
    { regex: /[a-z]/, message: "At least one lowercase letter" },
    { regex: /[A-Z]/, message: "At least one uppercase letter" },
    { regex: /\d/, message: "At least one digit" },
    {
      regex: /[!@#$%^&*]/,
      message: "At least one special character (!@#$%^&*)",
    },
    { regex: /.{8,}/, message: "At least 8 characters long" },
  ];

  const unmetConditions = conditions.filter(
    (condition) => !condition.regex.test(password)
  );

  return (
    <ul className="text-sm text-red-600">
      {unmetConditions.map((condition, index) => (
        <li key={index}>{condition.message}</li>
      ))}
    </ul>
  );
};

export default function ProfileEdit() {
  const fileRef = useRef(null);
  const { currentUser, loading, error } = useSelector((state) => state.user); // Extract currentUser from Redux state
  const [file, setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [userData, setUserData] = useState({});
  const [dobError, setDobError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [uploading, setUploading] = useState(false); // State to disable input during upload
  const dispatch = useDispatch();
  const { showAlert } = useAlert(); // Access the showAlert function
  const [flavourTags, setFlavourTags] = useState([]); // State to store flavour tags
  const [cuisineTags, setCuisineTags] = useState([]); // State to store cuisine tags
  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    reEnterNewPassword: false,
  });

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/user/current", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch user data");
        const data = await res.json();

        setUserData({
          username: data.username || "",
          email: data.email || "",
          avatar: data.avatar || "",
          fullname: data.fullname || "",
          dateOfBirth: data.dateOfBirth || "",
          gender: data.gender || "",
          bio: data.bio || "",
          address: data.address || "",
          phoneNumber: data.phoneNumber || "",
          socialMedia:
            data.socialMedia?.reduce((acc, item) => {
              acc[item.platform.toLowerCase()] = item.url;
              return acc;
            }, {}) || {},
          preferences: data.preferences || {
            dietaryRestrictions: [],
            allergies: [],
            language: "",
            notifications: { email: false, push: false },
          },
        });
      } catch (error) {
        console.error(error.message);
      }
    };

    fetchUser();
  }, [location, updateSuccess]); // Re-fetch data on route change or after update

  useEffect(() => {
    if (file) {
      handelFileUpload(file);
    }
  }, [file]);

  useEffect(() => {
    const fetchFlavourTags = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/tag/flavourTag");
        const data = await res.json();
        setFlavourTags(data.map((tag) => tag.name)); // Extract tag names
      } catch (err) {
        console.error("Error fetching flavour tags:", err);
      }
    };
    fetchFlavourTags();
  }, []);

  useEffect(() => {
    const fetchCuisineTags = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/tag/cuisineTag");
        const data = await res.json();
        setCuisineTags(data.map((tag) => tag.name)); // Extract tag names
      } catch (err) {
        console.error("Error fetching cuisine tags:", err);
      }
    };
    fetchCuisineTags();
  }, []); // Fetch cuisine tags on component mount

  const handelFileUpload = (file) => {
    setUploading(true);
    setTimeout(() => setUploading(false), 2000); // Disable input for 2 seconds after upload
    uploadImageToFirebase(file)
      .then((url) => {
        setUserData((prev) => ({ ...prev, avatar: url }));
        showAlert("success", "Image uploaded successfully!");
      })
      .catch((err) => {
        console.error("Image upload error:", err);
        showAlert("error", "Image upload failed.");
      })
      .finally(() => setUploading(false));
  };

  const handleImageRemove = () => {
    const imageUrl = userData.avatar;
    if (imageUrl) {
      deleteImageFromFirebase(imageUrl)
        .then(() => {
          setUserData((prev) => ({ ...prev, avatar: "" }));
          showAlert("success", "Image removed successfully!");
        })
        .catch((err) => {
          console.error("Error deleting image:", err);
          showAlert("error", "Failed to delete image.");
        });
    }
  };

  const handelChange = (e) => {
    console.log(`Field Changed: ${e.target.id}, Value: ${e.target.value}`); // Debugging field changes
    if (e.target.id === "dateOfBirth") {
      const selectedDate = new Date(e.target.value);
      const currentDate = new Date();
      let age = currentDate.getFullYear() - selectedDate.getFullYear();
      const m = currentDate.getMonth() - selectedDate.getMonth();
      if (
        m < 0 ||
        (m === 0 && currentDate.getDate() < selectedDate.getDate())
      ) {
        age--;
      }
      if (age < 13) {
        setDobError("Age limit not met");
        return;
      } else {
        setDobError("");
      }
    }
    setUserData({ ...userData, [e.target.id]: e.target.value });
  };

  // Helper for updating array fields
  const handleArrayChange = (e, field, index, key, inputType = "text") => {
    const value = inputType === "checkbox" ? e.target.checked : e.target.value;
    const items = userData[field] ? [...userData[field]] : [];
    items[index] = { ...items[index], [key]: value };
    setUserData({ ...userData, [field]: items });
  };

  const addArrayItem = (field, newItem) => {
    const items = userData[field] ? [...userData[field]] : [];
    items.push(newItem);
    setUserData({ ...userData, [field]: items });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate current password
    if (userData.currentPassword) {
      try {
        const res = await fetch(`/api/user/validate-password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ currentPassword: userData.currentPassword }),
        });

        const data = await res.json();
        if (!data.isValid) {
          showAlert("error", "Current password is incorrect.");
          return;
        }
      } catch (error) {
        showAlert("error", "Failed to validate current password.");
        return;
      }
    }

    // Validate new password and re-entered password
    if (userData.newPassword || userData.reEnterNewPassword) {
      if (userData.newPassword !== userData.reEnterNewPassword) {
        showAlert(
          "error",
          "New password and re-entered password do not match."
        );
        return;
      }
    }

    try {
      dispatch(updateUserStart());
      const userId = currentUser.user ? currentUser.user._id : currentUser._id;
      const socialMediaArray = Object.entries(userData.socialMedia).map(
        ([platform, url]) => ({ platform, url })
      ); // Convert socialMedia object back to an array

      const updatedUserData = {
        ...userData,
        socialMedia: socialMediaArray,
        bio: userData.bio, // Ensure bio is included
        password: userData.newPassword || undefined, // Only include new password if provided
      };

      const res = await fetch(`/api/user/update/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedUserData),
      });

      const data = await res.json();
      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        showAlert("error", data.message); // Redirect error to Header
        return;
      }

      dispatch(updateUserSuccess(data));
      showAlert("success", "User updated successfully!"); // Redirect success to Header
    } catch (error) {
      dispatch(updateUserFailure(error.message));
      showAlert("error", error.message); // Redirect error to Header
    }
  };

  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());
      const userId = currentUser.user ? currentUser.user._id : currentUser._id;
      if (userId) {
        const res = await fetch(`/api/user/delete/${userId}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (data.success === false) {
          dispatch(deleteUserFailure(data.message));
          return;
        }
        dispatch(deleteUserSuccess(data));
      } else {
        throw new Error("User ID is not available");
      }
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  }; // logs changes to the currentUser state // useEffect(() => { // console.log("Current User: ", currentUser); // }, [currentUser]);
  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      const res = await fetch("/api/auth/signout");
      const data = await res.json();
      if (data.success === false) {
        dispatch(signOutUserFailure(data.message));
        return;
      }
      dispatch(signOutUserSuccess(data));
    } catch (error) {
      dispatch(signOutUserFailure(error.message));
    }
  };

  const toggleOption = (field, option) => {
    const fieldParts = field.split(".");
    const fieldName = fieldParts[0];
    const subFieldName = fieldParts[1];

    const currentOptions = userData[fieldName]?.[subFieldName] || [];
    const updatedOptions = currentOptions.includes(option)
      ? currentOptions.filter((opt) => opt !== option)
      : [...currentOptions, option];

    setUserData({
      ...userData,
      [fieldName]: {
        ...userData[fieldName],
        [subFieldName]: updatedOptions,
      },
    });
  };

  return (
    <main className="kh-profile">
      <h1>Profile Page</h1>
      <div className="container">
        <div className="row">
          <div className="col-3">
            <ProfileNav active="Settings" subActive={false} />
          </div>
          <div className="col-9">
            <div className="kh-profile__user">
              <form onSubmit={handleSubmit} className="">
                <ul className="nav nav-tabs" id="myTab" role="tablist">
                  <li className="nav-item" role="presentation">
                    <button
                      className="nav-link active"
                      id="profile-tab"
                      data-toggle="tab"
                      data-target="#profile"
                      type="button"
                      role="tab"
                      aria-controls="profile"
                      aria-selected="true"
                    >
                      My Information
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button
                      className="nav-link"
                      id="preferences-tab"
                      data-toggle="tab"
                      data-target="#preferences"
                      type="button"
                      role="tab"
                      aria-controls="preferences"
                      aria-selected="false"
                    >
                      Preferences
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button
                      className="nav-link"
                      id="social-tab"
                      data-toggle="tab"
                      data-target="#social"
                      type="button"
                      role="tab"
                      aria-controls="social"
                      aria-selected="false"
                    >
                      Social Media
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button
                      className="nav-link"
                      id="setting-tab"
                      data-toggle="tab"
                      data-target="#setting"
                      type="button"
                      role="tab"
                      aria-controls="setting"
                      aria-selected="false"
                    >
                      User Settings
                    </button>
                  </li>
                </ul>
                <div className="tab-content" id="myTabContent">
                  <div
                    className="tab-pane fade show active"
                    id="profile"
                    role="tabpanel"
                    aria-labelledby="profile-tab"
                  >
                    <div className="kh-input-wrapper">
                      <div className="kh-input-item">
                        <input
                          onChange={(e) => setFile(e.target.files[0])}
                          type="file"
                          ref={fileRef}
                          hidden
                          accept="image/*"
                          disabled={uploading} // Disable input during upload
                        />
                        {userData.avatar && (
                          <img
                            onClick={() => fileRef.current.click()}
                            src={userData.avatar}
                            alt="User Profile Img"
                          />
                        )}
                        {userData.avatar && (
                          <button
                            type="button"
                            onClick={handleImageRemove}
                            className="btn btn-danger"
                          >
                            Remove Image
                          </button>
                        )}
                      </div>
                      <div className="kh-input-item">
                        <input
                          type="text"
                          placeholder="Username"
                          value={userData.username || ""}
                          id="username"
                          className="border p-3 rounded-lg"
                          pattern="^[a-zA-Z0-9_-]{3,20}$" // Regex for username validation
                          onChange={handelChange}
                        />
                      </div>
                      <div className="kh-input-item">
                        <input
                          type="text"
                          placeholder="Full Name"
                          value={userData.fullname || ""} // Ensure correct field is used
                          id="fullname" // Corrected id to match userData field
                          className="border p-3 rounded-lg"
                          pattern="^[a-zA-Z\s'-]{2,50}$" // Regex for full name validation
                          onChange={(e) =>
                            setUserData({
                              ...userData,
                              fullname: e.target.value,
                            })
                          } // Directly update fullname
                        />
                      </div>
                      <div className="kh-input-item">
                        <input
                          type="email"
                          placeholder="Email"
                          value={userData.email || ""}
                          id="email"
                          className="border p-3 rounded-lg"
                          pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$" // Regex for email validation
                          onChange={handelChange}
                        />
                      </div>
                      <div className="kh-input-item">
                        <input
                          type="date"
                          placeholder="Date of Birth"
                          value={
                            userData.dateOfBirth
                              ? userData.dateOfBirth.split("T")[0]
                              : ""
                          }
                          id="dateOfBirth"
                          className="border p-3 rounded-lg"
                          pattern="^(19|20)\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$" // Regex for date of birth validation
                          onChange={handelChange}
                        />
                        {dobError && <p className="text-red-700">{dobError}</p>}
                      </div>
                      <div className="kh-recipe-form__form--item  kh-recipe-form__checkbox">
                        <label className="block text-gray-700 font-bold mb-2">
                          Gender:
                        </label>
                        <div className="kh-input-checkbox-wrapper">
                          {["Male", "Female", "Other"].map((opt) => (
                            <div
                              className={`kh-recipe-form__checkbox--item ${
                                userData.gender === opt.toLowerCase()
                                  ? "checked"
                                  : ""
                              }`}
                              key={opt}
                            >
                              <input
                                type="radio"
                                id="gender"
                                name="gender"
                                value={opt.toLowerCase()}
                                pattern="^(male|female|other)$" // Regex for gender validation
                                checked={userData.gender === opt.toLowerCase()}
                                onChange={handelChange}
                              />
                              <label>{opt}</label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="kh-input-item">
                        <label>Bio (max 150 characters):</label>
                        <textarea
                          placeholder="Bio (max 150 characters)"
                          value={userData.bio || ""} // Add fallback to ensure bio is not undefined
                          id="bio"
                          maxLength={150}
                          className="border p-3 rounded-lg"
                          pattern="^.{0,150}$" // Regex for bio validation
                          onChange={handelChange}
                        />
                        <p>{(userData.bio || "").length}/150</p>{" "}
                        {/* Add fallback for length */}
                        {userData.bio && userData.bio.length > 150 && (
                          <p className="text-red-700">
                            Bio exceeds the maximum character limit!
                          </p>
                        )}
                      </div>
                      <div className="kh-input-item">
                        <input
                          type="text"
                          placeholder="Address"
                          value={userData.address || ""}
                          id="address"
                          className="border p-3 rounded-lg"
                          onChange={handelChange}
                        />
                      </div>
                      <div className="kh-input-item">
                        <input
                          type="text"
                          placeholder="Phone Number"
                          value={userData.phoneNumber || ""}
                          id="phoneNumber"
                          className="border p-3 rounded-lg"
                          onChange={handelChange}
                        />
                      </div>
                    </div>
                  </div>
                  <div
                    className="tab-pane fade"
                    id="preferences"
                    role="tabpanel"
                    aria-labelledby="preferences-tab"
                  >
                    <div className="kh-input-wrapper">
                      <div className="kh-recipe-form__form--item  kh-recipe-form__checkbox">
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
                                userData.preferences?.dietaryRestrictions?.includes(
                                  opt
                                )
                                  ? "checked"
                                  : ""
                              }`}
                              key={opt}
                            >
                              <input
                                type="checkbox"
                                pattern="^(Vegetarian|Vegan|Gluten-Free|Dairy-Free|Nut-Free)$" // Regex for dietary restrictions validation
                                checked={
                                  userData.preferences?.dietaryRestrictions?.includes(
                                    opt
                                  ) || false
                                }
                                onChange={() =>
                                  toggleOption(
                                    "preferences.dietaryRestrictions",
                                    opt
                                  )
                                }
                              />
                              <label>{opt}</label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="kh-recipe-form__form--item  kh-recipe-form__checkbox">
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
                                userData.preferences?.allergies?.includes(opt)
                                  ? "checked"
                                  : ""
                              }`}
                              key={opt}
                            >
                              <input
                                type="checkbox"
                                pattern="^(Peanuts|Shellfish|Dairy|Gluten|Soy)$" // Regex for allergies validation
                                checked={
                                  userData.preferences?.allergies?.includes(
                                    opt
                                  ) || false
                                }
                                onChange={() =>
                                  toggleOption("preferences.allergies", opt)
                                }
                              />
                              <label>{opt}</label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="kh-recipe-form__form--item  kh-recipe-form__checkbox">
                        <label>Flavour Tags:</label>
                        <div className="kh-input-checkbox-wrapper">
                          {flavourTags.map((tag) => (
                            <div
                              className={`kh-recipe-form__checkbox--item ${
                                userData.preferences?.flavourTag?.includes(tag)
                                  ? "checked"
                                  : ""
                              }`}
                              key={tag}
                            >
                              <input
                                type="checkbox"
                                pattern="^(Creamy|Spicy|Crispy|Savory|Buttery|Tangy|Nutty|Umami|ABCDFalvor|Sweet)$" // Regex for flavour tags validation
                                checked={
                                  userData.preferences?.flavourTag?.includes(
                                    tag
                                  ) || false
                                }
                                onChange={() =>
                                  toggleOption("preferences.flavourTag", tag)
                                }
                              />
                              <label>{tag}</label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="kh-recipe-form__form--item  kh-recipe-form__checkbox">
                        <label>Cuisine Tags:</label>
                        <div className="kh-input-checkbox-wrapper">
                          {cuisineTags.map((tag) => (
                            <div
                              className={`kh-recipe-form__checkbox--item ${
                                userData.preferences?.cuisineTags?.includes(tag)
                                  ? "checked"
                                  : ""
                              }`}
                              key={tag}
                            >
                              <input
                                type="checkbox"
                                checked={
                                  userData.preferences?.cuisineTags?.includes(
                                    tag
                                  ) || false
                                }
                                onChange={() =>
                                  toggleOption("preferences.cuisineTags", tag)
                                }
                              />
                              <label>{tag}</label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    className="tab-pane fade"
                    id="social"
                    role="tabpanel"
                    aria-labelledby="social-tab"
                  >
                    <div className="kh-input-wrapper">
                      <div className="kh-input-item">
                        <label>TikTok:</label>
                        <input
                          type="text"
                          placeholder="TikTok URL"
                          value={userData.socialMedia?.tiktok || ""}
                          id="socialMedia.tiktok"
                          className="border p-2 rounded"
                          pattern="^https?:\\/\\/(www\\.)?tiktok\\.com\\/@[a-zA-Z0-9._-]+$" // Regex for TikTok URL validation
                          onChange={(e) =>
                            setUserData({
                              ...userData,
                              socialMedia: {
                                ...userData.socialMedia,
                                tiktok: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div className="kh-input-item">
                        <label>Instagram:</label>
                        <input
                          type="text"
                          placeholder="Instagram URL"
                          value={userData.socialMedia?.instagram || ""} // Corrected key from 'insta' to 'instagram'
                          id="socialMedia.instagram"
                          className="border p-2 rounded"
                          pattern="^https?:\\/\\/(www\\.)?instagram\\.com\\/[a-zA-Z0-9._-]+$" // Regex for Instagram URL validation
                          onChange={(e) =>
                            setUserData({
                              ...userData,
                              socialMedia: {
                                ...userData.socialMedia,
                                instagram: e.target.value, // Corrected key from 'insta' to 'instagram'
                              },
                            })
                          }
                        />
                      </div>
                      <div className="kh-input-item">
                        <label>YouTube:</label>
                        <input
                          type="text"
                          placeholder="YouTube URL"
                          value={userData.socialMedia?.youtube || ""}
                          id="socialMedia.youtube"
                          className="border p-2 rounded"
                          pattern="^https?:\\/\\/(www\\.)?youtube\\.com\\/(@[a-zA-Z0-9_-]+|channel\\/[a-zA-Z0-9_-]+)$" // Regex for YouTube URL validation
                          onChange={(e) =>
                            setUserData({
                              ...userData,
                              socialMedia: {
                                ...userData.socialMedia,
                                youtube: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div
                    className="tab-pane fade"
                    id="setting"
                    role="tabpanel"
                    aria-labelledby="setting-tab"
                  >
                    <div className="kh-input-wrapper">
                      <div className="kh-input-item">
                        <input
                          type={
                            showPassword.currentPassword ? "text" : "password"
                          }
                          placeholder="Enter Current Password"
                          id="currentPassword"
                          className="border p-3 rounded-lg"
                          onChange={handelChange}
                        />
                        {/* <button
                          type="button"
                          onClick={() =>
                            togglePasswordVisibility("currentPassword")
                          }
                          className="absolute right-3 top-3"
                        >
                          {showPassword.currentPassword ? (
                            <FaRegEyeSlash className="w-6 h-6" />
                          ) : (
                            <FaRegEye className="w-6 h-6" />
                          )}
                        </button> */}
                      </div>
                      <div className="kh-input-item">
                        <input
                          type={showPassword.newPassword ? "text" : "password"}
                          placeholder="Enter New Password"
                          id="newPassword"
                          className="border p-3 rounded-lg"
                          onChange={(e) => {
                            const trimmedValue = e.target.value.trim();
                            handelChange({
                              ...e,
                              target: { ...e.target, value: trimmedValue },
                            });
                            setUserData({
                              ...userData,
                              newPassword: trimmedValue,
                            });
                          }}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            togglePasswordVisibility("newPassword")
                          }
                          className="absolute right-3 top-3"
                        >
                          {showPassword.newPassword ? (
                            <FaRegEyeSlash className="w-6 h-6" />
                          ) : (
                            <FaRegEye className="w-6 h-6" />
                          )}
                        </button>
                        <PasswordFeedback
                          password={userData.newPassword || ""}
                        />
                      </div>
                      <div className="kh-input-item">
                        <input
                          type={
                            showPassword.reEnterNewPassword
                              ? "text"
                              : "password"
                          }
                          placeholder="Re-enter New Password"
                          id="reEnterNewPassword"
                          className="border p-3 rounded-lg"
                          onChange={(e) => {
                            const trimmedValue = e.target.value.trim();
                            handelChange({
                              ...e,
                              target: { ...e.target, value: trimmedValue },
                            });
                            setUserData({
                              ...userData,
                              reEnterNewPassword: trimmedValue,
                            });
                          }}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            togglePasswordVisibility("reEnterNewPassword")
                          }
                          className="absolute right-3 top-3"
                        >
                          {showPassword.reEnterNewPassword ? (
                            <FaRegEyeSlash className="w-6 h-6" />
                          ) : (
                            <FaRegEye className="w-6 h-6" />
                          )}
                        </button>
                        {userData.newPassword !==
                          userData.reEnterNewPassword && (
                          <p className="text-sm text-red-600">
                            Passwords do not match
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="">
                      <span
                        onClick={() => setShowDeleteConfirmation(true)}
                        className="text-red-700 cursor-pointer"
                      >
                        Delete account
                      </span>{" "}
                      {showDeleteConfirmation && (
                        <div className="delete-confirmation-popup">
                          <p>Are you sure you want to delete your account?</p>
                          <button
                            onClick={handleDeleteUser}
                            className="confirm-delete-btn"
                          >
                            Yes, delete my account
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirmation(false)}
                            className="cancel-delete-btn"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="kh-input-item">
                  <button
                    disabled={loading}
                    className="bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80"
                  >
                    {loading ? "Loading..." : "Update"}
                  </button>
                </div>
                {error && (
                  <BootstrapAlert
                    type="error"
                    message={error}
                    duration={5000}
                  />
                )}
                {updateSuccess && (
                  <BootstrapAlert
                    type="success"
                    message="User is updated successfully!"
                    duration={5000}
                  />
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

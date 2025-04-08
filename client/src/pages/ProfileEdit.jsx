import { useSelector, useDispatch } from "react-redux";
import { useRef, useState, useEffect } from "react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
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

// import { getAuth } from "firebase/auth";

export default function ProfileEdit() {
  const fileRef = useRef(null);
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [file, setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  // userData now tracks additional fields
  const [userData, setUserData] = useState({});
  const [dobError, setDobError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const dispatch = useDispatch();
  const { showAlert } = useAlert(); // Access the showAlert function

  useEffect(() => {
    if (file) {
      handelFileUpload(file);
    }
  }, [file]);

  useEffect(() => {
    if (currentUser) {
      const user = currentUser.user || currentUser;
      console.log("Current User Data:", user); // Debugging user data
      setUserData({
        // retained fields
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        password: user.password,
        // new fields:
        fullname: user.fullname || "",
        dateOfBirth: user.dateOfBirth || "",
        gender: user.gender || "", // Ensure gender is initialized
        socialMedia:
          user.socialMedia?.reduce((acc, item) => {
            acc[item.platform.toLowerCase()] = item.url;
            return acc;
          }, {}) || {}, // Map socialMedia array to an object
        // New field for usertype with default "guest"
        usertype: user.usertype || "guest",
        bio: user.bio || "", // Ensure bio is initialized as an empty string
      });
    }
  }, [currentUser]);

  const handelFileUpload = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + "_" + file.name; // storing file name without duplicate names for accuracy

    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file); //uploading file to storage

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFilePerc(Math.round(progress)); // update filePerc state
      },
      (error) => {
        setFileUploadError(true);
        setError(error.message);
        console.error(error.message);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setUserData({ ...userData, avatar: downloadURL });
        });
      }
    );
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
                <div className="kh-input-wrapper text-center">
                  <input
                    onChange={(e) => setFile(e.target.files[0])}
                    type="file"
                    ref={fileRef}
                    hidden
                    accept="image/*"
                  />
                  {currentUser && (
                    <img
                      onClick={() => fileRef.current.click()}
                      src={
                        userData.avatar ||
                        currentUser?.user?.avatar ||
                        currentUser?.avatar
                      }
                      alt="User Profile Img"
                      accept="image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
                    />
                  )}
                  <p className="self-center">
                    {fileUploadError ? (
                      <span className="text-red-700">
                        Error Image Upload (image must be less than 1 mb)
                      </span>
                    ) : filePerc > 0 && filePerc < 100 ? (
                      <span className="color-green-500">
                        Uploading {filePerc}%
                      </span>
                    ) : filePerc === 100 ? (
                      <span className="text-green-700">
                        Image Uploaded successfully
                      </span>
                    ) : (
                      ""
                    )}
                  </p>
                  {/* // file upload error message
   {error && <p className="kh-profile__user--img-error">{error}</p>}I */}
                </div>
                <div className="kh-input-wrapper">
                  <input
                    type="text"
                    placeholder="Username"
                    defaultValue={
                      userData.username ||
                      currentUser?.user?.username ||
                      currentUser?.username
                    }
                    id="username"
                    className="border p-3 rounded-lg"
                    onChange={handelChange}
                  />
                </div>
                <div className="kh-input-wrapper">
                  <input
                    type="email"
                    placeholder="Email"
                    defaultValue={
                      userData.email ||
                      currentUser?.user?.email ||
                      currentUser?.email
                    }
                    id="email"
                    className="border p-3 rounded-lg"
                    onChange={handelChange}
                  />
                </div>
                <div className="kh-input-wrapper">
                  <input
                    type="password"
                    placeholder="Password"
                    id="password"
                    className="border p-3 rounded-lg"
                    onChange={handelChange}
                  />
                </div>
                {/* New single fields */}
                <div className="kh-input-wrapper">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={userData.fullname || ""} // Ensure correct field is used
                    id="fullname" // Corrected id to match userData field
                    className="border p-3 rounded-lg"
                    onChange={(e) =>
                      setUserData({ ...userData, fullname: e.target.value })
                    } // Directly update fullname
                  />
                </div>

                <div className="kh-input-wrapper">
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
                    onChange={handelChange}
                  />
                  {dobError && <p className="text-red-700">{dobError}</p>}
                </div>
                <div className="kh-input-wrapper">
                  <label className="block text-gray-700 font-bold mb-2">
                    Gender:
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="gender" // Add id attribute
                        name="gender"
                        value="male"
                        checked={userData.gender === "male"}
                        onChange={handelChange}
                        className="form-radio text-blue-600"
                      />
                      <span className="text-gray-700">Male</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="gender" // Add id attribute
                        name="gender"
                        value="female"
                        checked={userData.gender === "female"}
                        onChange={handelChange}
                        className="form-radio text-blue-600"
                      />
                      <span className="text-gray-700">Female</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="gender" // Add id attribute
                        name="gender"
                        value="other"
                        checked={userData.gender === "other"}
                        onChange={handelChange}
                        className="form-radio text-blue-600"
                      />
                      <span className="text-gray-700">Other</span>
                    </label>
                  </div>
                  {console.log("Selected Gender:", userData.gender)}{" "}
                  {/* Debugging selected gender */}
                </div>
                {/* Replace dynamic social media block with fixed social media inputs */}
                <div className="kh-input-wrapper">
                  <label>TikTok:</label>
                  <input
                    type="text"
                    placeholder="TikTok URL"
                    value={userData.socialMedia?.tiktok || ""}
                    id="socialMedia.tiktok"
                    className="border p-2 rounded"
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
                <div className="kh-input-wrapper">
                  <label>Instagram:</label>
                  <input
                    type="text"
                    placeholder="Instagram URL"
                    value={userData.socialMedia?.instagram || ""} // Corrected key from 'insta' to 'instagram'
                    id="socialMedia.instagram"
                    className="border p-2 rounded"
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
                <div className="kh-input-wrapper">
                  <label>YouTube:</label>
                  <input
                    type="text"
                    placeholder="YouTube URL"
                    value={userData.socialMedia?.youtube || ""}
                    id="socialMedia.youtube"
                    className="border p-2 rounded"
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
                <div className="kh-input-wrapper">
                  <textarea
                    placeholder="Bio (max 150 characters)"
                    value={userData.bio || ""} // Add fallback to ensure bio is not undefined
                    id="bio"
                    maxLength={150}
                    className="border p-3 rounded-lg"
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
                {/* ...existing submit button and action links... */}
                <div className="kh-input-wrapper">
                  <button
                    disabled={loading}
                    className="bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80"
                  >
                    {loading ? "Loading..." : "Update"}
                  </button>
                  <Link
                    className="bg-green-700 text-white p-3 rounded-lg uppercase text-center hover:opacity-95"
                    to={"/create-recipe"}
                  >
                    Create Recipe
                  </Link>
                </div>
                <div className="kh-profile__user--action-links">
                  <span
                    onClick={() => setShowDeleteConfirmation(true)}
                    className="text-red-700 cursor-pointer"
                  >
                    Delete account
                  </span>
                  <span
                    onClick={handleSignOut}
                    className="text-blue-500 cursor-pointer"
                  >
                    Sign out
                  </span>
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

            <ul className="nav nav-tabs" id="myTab" role="tablist">
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link active"
                  id="home-tab"
                  data-toggle="tab"
                  data-target="#home"
                  type="button"
                  role="tab"
                  aria-controls="home"
                  aria-selected="true"
                >
                  Home
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link"
                  id="profile-tab"
                  data-toggle="tab"
                  data-target="#profile"
                  type="button"
                  role="tab"
                  aria-controls="profile"
                  aria-selected="false"
                >
                  Profile
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link"
                  id="contact-tab"
                  data-toggle="tab"
                  data-target="#contact"
                  type="button"
                  role="tab"
                  aria-controls="contact"
                  aria-selected="false"
                >
                  Contact
                </button>
              </li>
            </ul>
            <div className="tab-content" id="myTabContent">
              <div
                className="tab-pane fade show active"
                id="home"
                role="tabpanel"
                aria-labelledby="home-tab"
              >
                Placeholder content for the tab panel. This one relates to the
                home tab. Takes you miles high, so high, 'cause she’s got that
                one international smile. There's a stranger in my bed, there's a
                pounding in my head. Oh, no. In another life I would make you
                stay. ‘Cause I, I’m capable of anything. Suiting up for my
                crowning battle. Used to steal your parents' liquor and climb to
                the roof. Tone, tan fit and ready, turn it up cause its gettin'
                heavy. Her love is like a drug. I guess that I forgot I had a
                choice.
              </div>
              <div
                className="tab-pane fade"
                id="profile"
                role="tabpanel"
                aria-labelledby="profile-tab"
              >
                Placeholder content for the tab panel. This one relates to the
                profile tab. You got the finest architecture. Passport stamps,
                she's cosmopolitan. Fine, fresh, fierce, we got it on lock.
                Never planned that one day I'd be losing you. She eats your
                heart out. Your kiss is cosmic, every move is magic. I mean the
                ones, I mean like she's the one. Greetings loved ones let's take
                a journey. Just own the night like the 4th of July! But you'd
                rather get wasted.
              </div>
              <div
                className="tab-pane fade"
                id="contact"
                role="tabpanel"
                aria-labelledby="contact-tab"
              >
                Placeholder content for the tab panel. This one relates to the .
                Got a motel and built a fort out of sheets. 'Cause she's the
                muse and the artist. (This is how we do) So you wanna play with
                magic. So just be sure before you give it all to me. I'm
                walking, I'm walking on air (tonight). Skip the talk, heard it
                all, time to walk the walk. Catch her if you can. Stinging like
                a bee I earned my stripes.
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

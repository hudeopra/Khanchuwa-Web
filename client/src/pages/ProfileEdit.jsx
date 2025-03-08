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

  useEffect(() => {
    if (file) {
      handelFileUpload(file);
    }
  }, [file]);

  useEffect(() => {
    if (currentUser) {
      const user = currentUser.user || currentUser;
      console.log("Current User Data:", user);
      setUserData({
        // retained fields
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        password: user.password,
        // new fields:
        fullname: user.fullname || "",
        dateOfBirth: user.dateOfBirth || "",
        gender: user.gender || "",
        emails: user.emails || "",
        phoneNumbers:
          user.phoneNumbers && user.phoneNumbers.length > 0
            ? user.phoneNumbers
            : [{ number: "", isPrimary: false }],
        addresses:
          user.addresses && user.addresses.length > 0
            ? user.addresses
            : [
                {
                  type: "",
                  street: "",
                  city: "",
                  state: "",
                  zip: "",
                  country: "",
                },
              ],
        socialMedia:
          user.socialMedia && user.socialMedia.length > 0
            ? user.socialMedia
            : [{ platform: "", url: "" }],
        preferences: user.preferences || {
          dietaryRestrictions: [],
          allergies: [],
          tastePreferences: [],
          language: "",
          notifications: { email: false, push: false },
        },
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
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setUserData({ ...userData, avatar: downloadURL });
        });
      }
    );
  };

  const handelChange = (e) => {
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
      console.log("User ID: ", userId); // verify user id is available and accurate
      console.log("User Data: ", userData);
      if (userId) {
        const res = await fetch(`/api/user/update/${userId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        });
        const data = await res.json();
        if (data.success === false) {
          dispatch(updateUserFailure(data.message));
          return;
        }

        dispatch(updateUserSuccess(data));
        setUpdateSuccess(true);
      } else {
        throw new Error("User ID is not available");
      }
    } catch (error) {
      dispatch(updateUserFailure(error.message));
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
      <div className="kh-profile__user">
        <form onSubmit={handleSubmit} className="">
          <div class="accordion" id="accordionExample">
            <div class="card">
              <div class="card-header" id="headingOne">
                <h2 class="mb-0">
                  <button
                    class="btn btn-link btn-block text-left"
                    type="button"
                    data-toggle="collapse"
                    data-target="#collapseOne"
                    aria-expanded="true"
                    aria-controls="collapseOne"
                  >
                    Collapsible Group Item #1
                  </button>
                </h2>
              </div>

              <div
                id="collapseOne"
                class="collapse show"
                aria-labelledby="headingOne"
                data-parent="#accordionExample"
              >
                <div class="card-body">
                  Some placeholder content for the first accordion panel. This
                  panel is shown by default, thanks to the <code>.show</code>{" "}
                  class.
                </div>
              </div>
            </div>
            <div class="card">
              <div class="card-header" id="headingTwo">
                <h2 class="mb-0">
                  <button
                    class="btn btn-link btn-block text-left collapsed"
                    type="button"
                    data-toggle="collapse"
                    data-target="#collapseTwo"
                    aria-expanded="false"
                    aria-controls="collapseTwo"
                  >
                    Collapsible Group Item #2
                  </button>
                </h2>
              </div>
              <div
                id="collapseTwo"
                class="collapse"
                aria-labelledby="headingTwo"
                data-parent="#accordionExample"
              >
                <div class="card-body">
                  Some placeholder content for the second accordion panel. This
                  panel is hidden by default.
                </div>
              </div>
            </div>
            <div class="card">
              <div class="card-header" id="headingThree">
                <h2 class="mb-0">
                  <button
                    class="btn btn-link btn-block text-left collapsed"
                    type="button"
                    data-toggle="collapse"
                    data-target="#collapseThree"
                    aria-expanded="false"
                    aria-controls="collapseThree"
                  >
                    Collapsible Group Item #3
                  </button>
                </h2>
              </div>
              <div
                id="collapseThree"
                class="collapse"
                aria-labelledby="headingThree"
                data-parent="#accordionExample"
              >
                <div class="card-body">
                  And lastly, the placeholder content for the third and final
                  accordion panel. This panel is hidden by default.
                </div>
              </div>
            </div>
          </div>
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
                <span className="color-green-500">Uploading {filePerc}%</span>
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
                userData.email || currentUser?.user?.email || currentUser?.email
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
              value={userData.fullname || ""}
              id="fullnamelanguage"
              className="border p-3 rounded-lg"
              onChange={handelChange}
            />
          </div>

          <div className="kh-input-wrapper">
            <input
              type="date"
              placeholder="Date of Birth"
              value={
                userData.dateOfBirth ? userData.dateOfBirth.split("T")[0] : ""
              }
              id="dateOfBirth"
              className="border p-3 rounded-lg"
              onChange={handelChange}
            />
            {dobError && <p className="text-red-700">{dobError}</p>}
          </div>
          <div className="kh-input-wrapper">
            <label>Gender:</label>
            <div className="flex space-x-4">
              <label>
                <input
                  type="radio"
                  name="gender"
                  id="gender"
                  value="male"
                  checked={userData.gender === "male"}
                  onChange={handelChange}
                />
                Male
              </label>
              <label>
                <input
                  type="radio"
                  name="gender"
                  id="gender"
                  value="Female"
                  checked={userData.gender === "Female"}
                  onChange={handelChange}
                />
                Female
              </label>
              <label>
                <input
                  type="radio"
                  name="gender"
                  id="gender"
                  value="other"
                  checked={userData.gender === "other"}
                  onChange={handelChange}
                />
                Other
              </label>
            </div>
          </div>
          <div className="kh-input-wrapper">
            <input
              type="text"
              placeholder="Alternative Emails"
              value={userData.emails || ""}
              id="emails"
              className="border p-3 rounded-lg"
              onChange={handelChange}
            />
          </div>
          {/* Dynamic array field for Phone Numbers */}
          <div className="kh-input-wrapper">
            <label>Phone Numbers:</label>
            {userData.phoneNumbers &&
              userData.phoneNumbers.map((phone, index) => (
                <div key={index} className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Phone Number"
                    value={phone.number || ""}
                    onChange={(e) =>
                      handleArrayChange(e, "phoneNumbers", index, "number")
                    }
                    className="border p-2 rounded"
                  />
                  <label>
                    Primary
                    <input
                      type="checkbox"
                      checked={phone.isPrimary || false}
                      onChange={(e) =>
                        handleArrayChange(
                          e,
                          "phoneNumbers",
                          index,
                          "isPrimary",
                          "checkbox"
                        )
                      }
                    />
                  </label>
                </div>
              ))}
            <button
              type="button"
              onClick={() => {
                if ((userData.phoneNumbers?.length || 0) < 2) {
                  addArrayItem("phoneNumbers", {
                    number: "",
                    isPrimary: false,
                  });
                }
              }}
              disabled={(userData.phoneNumbers?.length || 0) >= 2}
            >
              +
            </button>
          </div>
          {/* Dynamic array field for Addresses */}
          <div className="kh-input-wrapper">
            <label>Addresses:</label>
            {userData.addresses &&
              userData.addresses.map((addr, index) => (
                <div
                  key={index}
                  className="flex flex-col space-y-1 border p-2 mb-2"
                >
                  <input
                    type="text"
                    placeholder="Type"
                    value={addr.type || ""}
                    onChange={(e) =>
                      handleArrayChange(e, "addresses", index, "type")
                    }
                    className="border p-2 rounded"
                  />
                  <input
                    type="text"
                    placeholder="Street"
                    value={addr.street || ""}
                    onChange={(e) =>
                      handleArrayChange(e, "addresses", index, "street")
                    }
                    className="border p-2 rounded"
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={addr.city || ""}
                    onChange={(e) =>
                      handleArrayChange(e, "addresses", index, "city")
                    }
                    className="border p-2 rounded"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={addr.state || ""}
                    onChange={(e) =>
                      handleArrayChange(e, "addresses", index, "state")
                    }
                    className="border p-2 rounded"
                  />
                  <input
                    type="text"
                    placeholder="Zip"
                    value={addr.zip || ""}
                    onChange={(e) =>
                      handleArrayChange(e, "addresses", index, "zip")
                    }
                    className="border p-2 rounded"
                  />
                  <input
                    type="text"
                    placeholder="Country"
                    value={addr.country || ""}
                    onChange={(e) =>
                      handleArrayChange(e, "addresses", index, "country")
                    }
                    className="border p-2 rounded"
                  />
                </div>
              ))}
            <button
              type="button"
              onClick={() => {
                if ((userData.addresses?.length || 0) < 2) {
                  addArrayItem("addresses", {
                    type: "",
                    street: "",
                    city: "",
                    state: "",
                    zip: "",
                    country: "",
                  });
                }
              }}
              disabled={(userData.addresses?.length || 0) >= 2}
            >
              +
            </button>
          </div>
          {/* Dynamic array field for Social Media */}
          <div className="kh-input-wrapper">
            <label>Social Media:</label>
            {userData.socialMedia &&
              userData.socialMedia.map((sm, index) => (
                <div key={index} className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Platform"
                    value={sm.platform || ""}
                    onChange={(e) =>
                      handleArrayChange(e, "socialMedia", index, "platform")
                    }
                    className="border p-2 rounded"
                  />
                  <input
                    type="text"
                    placeholder="URL"
                    value={sm.url || ""}
                    onChange={(e) =>
                      handleArrayChange(e, "socialMedia", index, "url")
                    }
                    className="border p-2 rounded"
                  />
                </div>
              ))}
            <button
              type="button"
              onClick={() => {
                if ((userData.socialMedia?.length || 0) < 5) {
                  addArrayItem("socialMedia", { platform: "", url: "" });
                }
              }}
              disabled={(userData.socialMedia?.length || 0) >= 5}
            >
              +
            </button>
          </div>
          {/* Preferences section */}
          <div className="kh-input-wrapper">
            <label>Preferences:</label>
            <input
              type="text"
              placeholder="Language"
              value={userData.preferences?.language || ""}
              id="preferences.language"
              className="border p-3 rounded-lg"
              onChange={(e) =>
                setUserData({
                  ...userData,
                  preferences: {
                    ...userData.preferences,
                    language: e.target.value,
                  },
                })
              }
            />
            <div className="kh-input-wrapper">
              <label>Dietary Restrictions:</label>
              {userData.preferences?.dietaryRestrictions &&
                userData.preferences.dietaryRestrictions.map((item, index) => (
                  <div key={index}>
                    <input
                      type="text"
                      placeholder="Restriction"
                      value={item || ""}
                      onChange={(e) => {
                        const restrictions = [
                          ...userData.preferences.dietaryRestrictions,
                        ];
                        restrictions[index] = e.target.value;
                        setUserData({
                          ...userData,
                          preferences: {
                            ...userData.preferences,
                            dietaryRestrictions: restrictions,
                          },
                        });
                      }}
                      className="border p-2 rounded"
                    />
                  </div>
                ))}
              <button
                type="button"
                onClick={() => {
                  if (
                    (userData.preferences?.dietaryRestrictions?.length || 0) < 5
                  ) {
                    const restrictions = userData.preferences
                      ?.dietaryRestrictions
                      ? [...userData.preferences.dietaryRestrictions]
                      : [];
                    restrictions.push("");
                    setUserData({
                      ...userData,
                      preferences: {
                        ...userData.preferences,
                        dietaryRestrictions: restrictions,
                      },
                    });
                  }
                }}
                disabled={
                  (userData.preferences?.dietaryRestrictions?.length || 0) >= 5
                }
              >
                +
              </button>
            </div>
            <div className="kh-input-wrapper">
              <label>Allergies:</label>
              {userData.preferences?.allergies &&
                userData.preferences.allergies.map((item, index) => (
                  <div key={index}>
                    <input
                      type="text"
                      placeholder="Allergy"
                      value={item || ""}
                      onChange={(e) => {
                        const allergies = [...userData.preferences.allergies];
                        allergies[index] = e.target.value;
                        setUserData({
                          ...userData,
                          preferences: {
                            ...userData.preferences,
                            allergies: allergies,
                          },
                        });
                      }}
                      className="border p-2 rounded"
                    />
                  </div>
                ))}
              <button
                type="button"
                onClick={() => {
                  if ((userData.preferences?.allergies?.length || 0) < 5) {
                    const allergies = userData.preferences?.allergies
                      ? [...userData.preferences.allergies]
                      : [];
                    allergies.push("");
                    setUserData({
                      ...userData,
                      preferences: {
                        ...userData.preferences,
                        allergies: allergies,
                      },
                    });
                  }
                }}
                disabled={(userData.preferences?.allergies?.length || 0) >= 5}
              >
                +
              </button>
            </div>
            <div className="kh-input-wrapper">
              <label>Taste Preferences:</label>
              {userData.preferences?.tastePreferences &&
                userData.preferences.tastePreferences.map((item, index) => (
                  <div key={index}>
                    <input
                      type="text"
                      placeholder="Preference"
                      value={item || ""}
                      onChange={(e) => {
                        const tastes = [
                          ...userData.preferences.tastePreferences,
                        ];
                        tastes[index] = e.target.value;
                        setUserData({
                          ...userData,
                          preferences: {
                            ...userData.preferences,
                            tastePreferences: tastes,
                          },
                        });
                      }}
                      className="border p-2 rounded"
                    />
                  </div>
                ))}
              <button
                type="button"
                onClick={() => {
                  if (
                    (userData.preferences?.tastePreferences?.length || 0) < 5
                  ) {
                    const tastes = userData.preferences?.tastePreferences
                      ? [...userData.preferences.tastePreferences]
                      : [];
                    tastes.push("");
                    setUserData({
                      ...userData,
                      preferences: {
                        ...userData.preferences,
                        tastePreferences: tastes,
                      },
                    });
                  }
                }}
                disabled={
                  (userData.preferences?.tastePreferences?.length || 0) >= 5
                }
              >
                +
              </button>
            </div>
            <div className="kh-input-wrapper">
              <label>
                Notifications Email:
                <input
                  type="checkbox"
                  checked={userData.preferences?.notifications?.email || false}
                  onChange={(e) =>
                    setUserData({
                      ...userData,
                      preferences: {
                        ...userData.preferences,
                        notifications: {
                          ...userData.preferences.notifications,
                          email: e.target.checked,
                        },
                      },
                    })
                  }
                />
              </label>
              <label>
                Notifications Push:
                <input
                  type="checkbox"
                  checked={userData.preferences?.notifications?.push || false}
                  onChange={(e) =>
                    setUserData({
                      ...userData,
                      preferences: {
                        ...userData.preferences,
                        notifications: {
                          ...userData.preferences.notifications,
                          push: e.target.checked,
                        },
                      },
                    })
                  }
                />
              </label>
            </div>
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
            <BootstrapAlert type="error" message={error} duration={5000} />
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
          <button onClick={handleDeleteUser} className="confirm-delete-btn">
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

      <ul class="nav nav-tabs" id="myTab" role="tablist">
        <li class="nav-item" role="presentation">
          <button
            class="nav-link active"
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
        <li class="nav-item" role="presentation">
          <button
            class="nav-link"
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
        <li class="nav-item" role="presentation">
          <button
            class="nav-link"
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
      <div class="tab-content" id="myTabContent">
        <div
          class="tab-pane fade show active"
          id="home"
          role="tabpanel"
          aria-labelledby="home-tab"
        >
          Placeholder content for the tab panel. This one relates to the home
          tab. Takes you miles high, so high, 'cause she’s got that one
          international smile. There's a stranger in my bed, there's a pounding
          in my head. Oh, no. In another life I would make you stay. ‘Cause I,
          I’m capable of anything. Suiting up for my crowning battle. Used to
          steal your parents' liquor and climb to the roof. Tone, tan fit and
          ready, turn it up cause its gettin' heavy. Her love is like a drug. I
          guess that I forgot I had a choice.
        </div>
        <div
          class="tab-pane fade"
          id="profile"
          role="tabpanel"
          aria-labelledby="profile-tab"
        >
          Placeholder content for the tab panel. This one relates to the profile
          tab. You got the finest architecture. Passport stamps, she's
          cosmopolitan. Fine, fresh, fierce, we got it on lock. Never planned
          that one day I'd be losing you. She eats your heart out. Your kiss is
          cosmic, every move is magic. I mean the ones, I mean like she's the
          one. Greetings loved ones let's take a journey. Just own the night
          like the 4th of July! But you'd rather get wasted.
        </div>
        <div
          class="tab-pane fade"
          id="contact"
          role="tabpanel"
          aria-labelledby="contact-tab"
        >
          Placeholder content for the tab panel. This one relates to the . Got a
          motel and built a fort out of sheets. 'Cause she's the muse and the
          artist. (This is how we do) So you wanna play with magic. So just be
          sure before you give it all to me. I'm walking, I'm walking on air
          (tonight). Skip the talk, heard it all, time to walk the walk. Catch
          her if you can. Stinging like a bee I earned my stripes.
        </div>
      </div>
    </main>
  );
}

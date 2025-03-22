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

// import { getAuth } from "firebase/auth";

export default function Profile() {
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
  const [recentRecipes, setRecentRecipes] = useState([]);
  const [recentBlogs, setRecentBlogs] = useState([]);
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
        fullname: user.fullname,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        emails: user.emails,
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
        // New field for usertype
        usertype: user.usertype || "guest",
      });
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      const user = currentUser.user || currentUser;
      const userId = user._id;
      fetch(`http://localhost:3000/api/recipe/user/${userId}?limit=5`)
        .then((res) => {
          if (!res.ok) {
            return res.text().then((text) => {
              throw new Error(`Fetch error: ${res.status} ${text}`);
            });
          }
          return res.json();
        })
        .then((data) => {
          if (data.success) {
            setRecentRecipes(data.recipes);
          }
        })
        .catch((error) => console.error(error));
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      const user = currentUser.user || currentUser;
      const userId = user._id;
      fetch(`http://localhost:3000/api/blog/user/${userId}?limit=5`)
        .then((res) => {
          if (!res.ok) {
            return res.text().then((text) => {
              throw new Error(`Fetch error: ${res.status} ${text}`);
            });
          }
          return res.json();
        })
        .then((data) => {
          if (data.success) {
            setRecentBlogs(data.blogs);
          }
        })
        .catch((error) => console.error(error));
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
      <h1>Dashboard</h1>
      <div className="container">
        <div className="row">
          <div className="col-3">
            <ProfileNav active="Dashboard" subActive={false} />
          </div>
          <div className="col-9">
            <div className="kh-profile__tab">
              <h1>User Information</h1>
              {currentUser ? (
                (() => {
                  const user = currentUser.user || currentUser;
                  return (
                    <div className="row">
                      <div className="col-6">
                        <div className="kh-profile__tab--wrapper kh-profile__tab--id-card">
                          <div className="kh-profile__tab--item">
                            <img
                              src={user.avatar}
                              alt="Avatar"
                              className="profile-avatar"
                            />
                          </div>
                          <div className="kh-profile__tab--user-info">
                            {user.fullname && <h2>{user.fullname}</h2>}
                            <span>@{user.username}</span>
                          </div>
                          <div className="kh-profile__tab--item">
                            <strong>Language:</strong>
                            {user.preferences.language}
                          </div>
                        </div>
                        <div className="kh-profile__tab--wrapper kh-profile__tab--user-details">
                          <div className="kh-profile__tab--item">
                            {user.dateOfBirth && (
                              <p>
                                <strong>Date Of Birth:</strong>{" "}
                                {new Date(
                                  user.dateOfBirth
                                ).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <div className="kh-profile__tab--item">
                            {user.gender && (
                              <p>
                                <strong>Gender:</strong> {user.gender}
                              </p>
                            )}
                          </div>
                          <div className="kh-profile__tab--item">
                            {user.phoneNumbers &&
                              user.phoneNumbers.length > 0 && (
                                <div>
                                  <strong>Phone Numbers:</strong>
                                  <ul>
                                    {user.phoneNumbers.map((phone, index) => (
                                      <li key={index}>
                                        {phone.number}{" "}
                                        {phone.isPrimary && "(Primary)"}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                          </div>
                          <div className="kh-profile__tab--item">
                            {user.addresses && user.addresses.length > 0 && (
                              <div>
                                <strong>Addresses:</strong>
                                <ul>
                                  {user.addresses.map((addr, index) => (
                                    <li key={index}>
                                      {addr.type}: {addr.street}, {addr.city}
                                      {/* {addr.type}: {addr.street}, {addr.city},{" "}
                                      {addr.state}, {addr.zip}, {addr.country} */}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                          <div className="kh-profile__tab--item">
                            {user.socialMedia &&
                              user.socialMedia.length > 0 && (
                                <div>
                                  <strong>Social Media:</strong>
                                  <ul>
                                    {user.socialMedia.map((sm, index) => (
                                      <li key={index}>
                                        {sm.platform}:{" "}
                                        <a
                                          href={sm.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          {sm.url}
                                        </a>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                          </div>

                          <div className="kh-profile__tab--item"></div>
                          <div className="kh-profile__tab--item"></div>
                          <div className="kh-profile__tab--item"></div>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="kh-profile__tab--wrapper">
                          {user.preferences && (
                            <div>
                              <strong>Preferences:</strong>
                              {user.preferences.dietaryRestrictions &&
                                user.preferences.dietaryRestrictions.length >
                                  0 && (
                                  <div>
                                    <strong>Dietary Restrictions:</strong>
                                    <ul>
                                      {user.preferences.dietaryRestrictions.map(
                                        (item, index) => (
                                          <li key={index}>{item}</li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                )}
                              {user.preferences.allergies &&
                                user.preferences.allergies.length > 0 && (
                                  <div>
                                    <strong>Allergies:</strong>
                                    <ul>
                                      {user.preferences.allergies.map(
                                        (item, index) => (
                                          <li key={index}>{item}</li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                )}
                              {user.preferences.tastePreferences &&
                                user.preferences.tastePreferences.length >
                                  0 && (
                                  <div>
                                    <strong>Taste Preferences:</strong>
                                    <ul>
                                      {user.preferences.tastePreferences.map(
                                        (item, index) => (
                                          <li key={index}>{item}</li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                )}
                              {user.preferences.notifications && (
                                <p>
                                  <strong>Notifications:</strong> Email:{" "}
                                  {user.preferences.notifications.email
                                    ? "Yes"
                                    : "No"}
                                  , Push:{" "}
                                  {user.preferences.notifications.push
                                    ? "Yes"
                                    : "No"}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <p>No user data available</p>
              )}
            </div>
            <div className="kh-recipe-post">
              <Link to={`/user-recipe`} className="btn btn-edit">
                View All recipes
              </Link>
              {recentRecipes.length > 0 ? (
                recentRecipes.map((recipe) => (
                  <div key={recipe._id} className="recipe-block">
                    <div className="recipe-block-wrapper">
                      <h3>{recipe.recipeName}</h3>
                      <img
                        src={
                          Array.isArray(recipe.imageUrls) &&
                          recipe.imageUrls.length > 0
                            ? recipe.imageUrls[0]
                            : ""
                        }
                        alt={recipe.recipeName}
                        className="recipe-fav-image"
                      />
                    </div>
                    <Link
                      to={`/recipe/edit/${recipe._id}`}
                      className="btn btn-edit"
                    >
                      Edit
                    </Link>
                  </div>
                ))
              ) : (
                <p>No recent recipes.</p>
              )}
            </div>
            <div className="kh-blog-post">
              <h2>Recent Blogs</h2>
              <Link to={`/user-blog`} className="btn btn-edit">
                View All Blogs
              </Link>
              {recentBlogs.length > 0 ? (
                recentBlogs.map((blog) => (
                  <div key={blog._id} className="blog-block">
                    <div className="blog-block-wrapper">
                      <h3>{blog.blogtitle}</h3>
                      <p>{blog.blogtype}</p>
                    </div>
                    <Link
                      to={`/blog/edit/${blog._id}`}
                      className="btn btn-edit"
                    >
                      Edit
                    </Link>
                  </div>
                ))
              ) : (
                <p>No recent blogs.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

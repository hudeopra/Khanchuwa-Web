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
      <h1>User Information</h1>
      {currentUser ? (
        (() => {
          const user = currentUser.user || currentUser;
          return (
            <div className="profile-card">
              <img src={user.avatar} alt="Avatar" className="profile-avatar" />
              <div className="profile-details">
                <p>
                  <strong>Username:</strong> {user.username}
                </p>
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
                {user.fullname && (
                  <p>
                    <strong>Full Name:</strong> {user.fullname}
                  </p>
                )}
                {user.dateOfBirth && (
                  <p>
                    <strong>Date Of Birth:</strong>{" "}
                    {new Date(user.dateOfBirth).toLocaleDateString()}
                  </p>
                )}
                {user.gender && (
                  <p>
                    <strong>Gender:</strong> {user.gender}
                  </p>
                )}
                {user.emails && (
                  <p>
                    <strong>Alternative Emails:</strong> {user.emails}
                  </p>
                )}
                {user.phoneNumbers && user.phoneNumbers.length > 0 && (
                  <div>
                    <strong>Phone Numbers:</strong>
                    <ul>
                      {user.phoneNumbers.map((phone, index) => (
                        <li key={index}>
                          {phone.number} {phone.isPrimary && "(Primary)"}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {user.addresses && user.addresses.length > 0 && (
                  <div>
                    <strong>Addresses:</strong>
                    <ul>
                      {user.addresses.map((addr, index) => (
                        <li key={index}>
                          {addr.type}: {addr.street}, {addr.city}, {addr.state},{" "}
                          {addr.zip}, {addr.country}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {user.socialMedia && user.socialMedia.length > 0 && (
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
                {user.preferences && (
                  <div>
                    <strong>Preferences:</strong>
                    <p>
                      <strong>Language:</strong> {user.preferences.language}
                    </p>
                    {user.preferences.dietaryRestrictions &&
                      user.preferences.dietaryRestrictions.length > 0 && (
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
                            {user.preferences.allergies.map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    {user.preferences.tastePreferences &&
                      user.preferences.tastePreferences.length > 0 && (
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
                        {user.preferences.notifications.email ? "Yes" : "No"},
                        Push:{" "}
                        {user.preferences.notifications.push ? "Yes" : "No"}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })()
      ) : (
        <p>No user data available</p>
      )}
    </main>
  );
}

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

// import { getAuth } from "firebase/auth";

export default function Profile() {
  const fileRef = useRef(null);
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [file, setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [userData, setUserData] = useState({});
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
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        password: user.password,
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
    setUserData({ ...userData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const userId = currentUser.user ? currentUser.user._id : currentUser._id;
      console.log("User ID: ", userId); // verify user id is available and accurate
      console.log("User Data: ", userData);
      if (userId) {
        const res = await fetch(` /api/user/update/${userId}`, {
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
    <section className="kh-profile">
      <h1>Profile Page</h1>
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
          <p className="text-red-700 mt-5">{error ? error : ""}</p>
          <p className="text-green-700 mt-5">
            {updateSuccess ? "User is updated successfully!" : ""}
          </p>
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
    </section>
  );
}

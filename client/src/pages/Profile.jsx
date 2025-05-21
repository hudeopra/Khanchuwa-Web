import { useSelector, useDispatch } from "react-redux";
import { useRef, useState, useEffect } from "react";
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
import UserRecipeFive from "../components/UserRecipeFive";
import UserBlogFive from "../components/UserBlogFIve";
import ProfileCard from "../components/ProfileCard";

export default function Profile() {
  const fileRef = useRef(null);
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [file, setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [uploading, setUploading] = useState(false);
  // userData now tracks additional fields
  const [userData, setUserData] = useState({});
  const [dobError, setDobError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [recentRecipes, setRecentRecipes] = useState([]);
  const [recentBlogs, setRecentBlogs] = useState([]);
  const dispatch = useDispatch();

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
        // Removed preferences field
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
            console.log("Recent Recipes: ", data.recipes);
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
      <div className="container py-5">
        <div className="row">
          <div className="col-3">
            <ProfileNav active="Dashboard" subActive={false} />
          </div>
          <div className="col-9">
            <div className="kh-profile__tab">
              {currentUser ? (
                (() => {
                  const user = currentUser.user || currentUser;
                  return <ProfileCard />;
                })()
              ) : (
                <p>No user data available</p>
              )}
            </div>
            <div className="row">
              <div className="col-6">
                <UserRecipeFive
                  recentRecipes={recentRecipes}
                  currentUser={currentUser}
                />
              </div>
              <div className="col-6">
                <UserBlogFive recentBlogs={recentBlogs} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

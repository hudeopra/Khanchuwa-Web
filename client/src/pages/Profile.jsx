import { useSelector } from "react-redux";
import { useRef, useState, useEffect } from "react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const { currentUser } = useSelector((state) => state.user);
  const [file, setFile] = useState(undefined);
  const [error, setError] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      navigate("/SignIn");
    }
  }, [navigate]);

  useEffect(() => {
    if (file) {
      handelFileUpload(file);
    }
  }, [file]);

  const handelFileUpload = (file) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
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
            setFormData({ ...formData, avatar: downloadURL });
          });
        }
      );
    } else {
      setError("Profile: User is not authenticated");
    }
  };

  useEffect(() => {
    console.log("Profile Upload Url: ", formData); //upload data url
    console.log("Profile upload Perc: ", filePerc); //file upload percentage
    console.log("Profile Upload Error: ", fileUploadError); //file upload error
  }, [formData, filePerc, fileUploadError]);

  return (
    <section className="kh-profile">
      <h1>Profile Page</h1>
      <div className="kh-profile__user">
        <form className="">
          <div className="kh-input-wrapper text-center">
            <input
              onChange={(e) => setFile(e.target.files[0])}
              type="file"
              ref={fileRef}
              hidden
              accept="image/*"
            />
            <img
              onClick={() => fileRef.current.click()}
              src={formData.avatar || currentUser.user.avatar}
              alt="User Profile Img"
            />
            <p className="self-center">
              {fileUploadError ? (
                <span className="text-red-700">
                  Error Image Upload (image must be less than 1 mb){" "}
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
            {/* // file upload error message */}
            {error && <p className="kh-profile__user--img-error">{error}</p>}
          </div>
          <div className="kh-input-wrapper">
            <input
              type="text"
              placeholder="Username"
              id="username"
              className="border p-3 rounded-lg"
            />
          </div>
          <div className="kh-input-wrapper">
            <input
              type="email"
              placeholder="Email"
              id="email"
              className="border p-3 rounded-lg"
            />
          </div>
          <div className="kh-input-wrapper">
            <input
              type="text"
              placeholder="password"
              id="password"
              className="border p-3 rounded-lg"
            />
          </div>
          <div className="kh-input-wrapper">
            <button className="bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95">
              update
            </button>
          </div>
          <div className="kh-profile__user--action-links">
            <span className="text-red-500 cursor-pointer">Delete Account</span>
            <span className="text-blue-500 cursor-pointer">Logout</span>
          </div>
        </form>
      </div>
    </section>
  );
}

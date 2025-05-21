import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateUserSuccess } from "../redux/user/userSlice";
import { useAlert } from "./AlertContext";

const AllUsers = () => {
  const allUsers = useSelector((state) => state.user.allUsers);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeUser, setActiveUser] = useState(null);
  const [editedFields, setEditedFields] = useState({});
  const [updatingUser, setUpdatingUser] = useState(false);
  const dispatch = useDispatch();
  const { showAlert } = useAlert();

  // Fetch users if not available in redux
  useEffect(() => {
    const fetchUsers = async () => {
      if (allUsers && allUsers.length > 0) {
        setActiveUser(allUsers[0]);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/user/all", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch users");
        }

        const data = await res.json();
        if (data && data.length > 0) {
          setActiveUser(data[0]);
        }
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUsers();
  }, [allUsers]);

  const handleInputChange = (field, value) => {
    if (!activeUser) return;

    setEditedFields((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpdateUser = async () => {
    if (!activeUser || Object.keys(editedFields).length === 0) {
      showAlert("warning", "No changes to update");
      return;
    }

    try {
      setUpdatingUser(true);
      const res = await fetch(`/api/user/update/${activeUser._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify(editedFields),
      });

      const data = await res.json();
      if (data.success) {
        showAlert(
          "success",
          `User ${activeUser.username} updated successfully!`
        );
        dispatch(updateUserSuccess(data.data));

        // Update the active user with new data
        setActiveUser({
          ...activeUser,
          ...editedFields,
        });

        // Clear edited fields
        setEditedFields({});
      } else {
        showAlert("error", `Failed to update user: ${data.message}`);
      }
    } catch (error) {
      showAlert("error", `Error updating user: ${error.message}`);
    } finally {
      setUpdatingUser(false);
    }
  };

  if (loading)
    return <div className="container mt-5 text-center">Loading users...</div>;
  if (error)
    return <div className="container mt-5 text-center">Error: {error}</div>;
  if (!allUsers || allUsers.length === 0)
    return (
      <div className="container mt-5 text-center">No users available.</div>
    );

  return (
    <main className="kh-cookshop-page kh-cookshop">
      <section className="container">
        <div className="row">
          <div className="col-12 mb-4">
            <h1 className="text-center">User Administration</h1>
          </div>
          <div className="col-12 col-md-6 col-lg-8">
            <div className="kh-cookshop__list">
              <ul className="kh-cookshop__list--items">
                {allUsers.map((user) => (
                  <li
                    key={user._id}
                    className={`kh-cookshop__list--item ${
                      activeUser?._id === user._id ? "active" : ""
                    }`}
                    onClick={() => {
                      setActiveUser(user);
                      setEditedFields({}); // Clear edited fields when switching users
                    }}
                  >
                    <img
                      src={user.avatar || "https://via.placeholder.com/50"}
                      alt={user.username}
                      width="50"
                      className="rounded-circle"
                    />
                    <p>{user.username}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="col-12 col-md-6 col-lg-4">
            {activeUser && (
              <div className="kh-cookshop__details">
                <div className="mb-4 text-center">
                  <img
                    src={activeUser.avatar || "https://via.placeholder.com/150"}
                    alt={activeUser.username}
                    className="rounded-circle w-50 h-auto"
                  />
                </div>
                <h3 className="text-center mb-4">{activeUser.username}</h3>
                <span className="text-center mb-4">{activeUser._id}</span>

                <form>
                  {/* Username, fullname, email, and user ID fields have been removed */}

                  <div className="mb-3">
                    <label className="form-label">
                      <strong>Role:</strong>
                    </label>
                    <select
                      className="form-select"
                      value={
                        editedFields.role !== undefined
                          ? editedFields.role
                          : activeUser.role
                      }
                      onChange={(e) =>
                        handleInputChange("role", e.target.value)
                      }
                    >
                      <option value="user">User</option>
                      <option value="creator">Creator</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      <strong>Status:</strong>
                    </label>
                    <select
                      className="form-select"
                      value={
                        editedFields.userStatus !== undefined
                          ? editedFields.userStatus
                          : activeUser.userStatus
                      }
                      onChange={(e) =>
                        handleInputChange("userStatus", e.target.value)
                      }
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                      <option value="WARNED">WARNED</option>
                      <option value="BANNED">BANNED</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      <strong>Recipe Limit:</strong>
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      value={
                        editedFields.recipelimit !== undefined
                          ? editedFields.recipelimit
                          : activeUser.recipelimit || 0
                      }
                      onChange={(e) =>
                        handleInputChange("recipelimit", e.target.value)
                      }
                    />
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary w-100"
                    onClick={handleUpdateUser}
                    disabled={
                      updatingUser || Object.keys(editedFields).length === 0
                    }
                  >
                    {updatingUser ? "Updating..." : "Update User"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default AllUsers;

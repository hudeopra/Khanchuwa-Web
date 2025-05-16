import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateUserSuccess } from "../redux/user/userSlice";

const AllUsers = () => {
  const allUsers = useSelector((state) => state.user.allUsers);
  const [updateMessage, setUpdateMessage] = useState(null);
  const [editedUsers, setEditedUsers] = useState({});
  const dispatch = useDispatch();

  const handleInputChange = (userId, field, value) => {
    setEditedUsers((prev) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [field]: value,
      },
    }));
  };

  const handleUpdateUser = async (userId) => {
    const updatedData = editedUsers[userId];
    if (!updatedData) {
      setUpdateMessage(`No changes made for user with ID ${userId}`);
      return;
    }

    try {
      const res = await fetch(`/api/user/update/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify(updatedData),
      });

      const data = await res.json();
      if (data.success) {
        setUpdateMessage(`User with ID ${userId} updated successfully!`);
        dispatch(updateUserSuccess(data.data)); // Update Redux state with new user data
      } else {
        setUpdateMessage(
          `Failed to update user with ID ${userId}: ${data.message}`
        );
      }
    } catch (error) {
      setUpdateMessage(
        `Error updating user with ID ${userId}: ${error.message}`
      );
    }
  };

  if (!allUsers) {
    return <div>No users available.</div>;
  }

  return (
    <main>
      <h1>All Users</h1>
      {updateMessage && <p>{updateMessage}</p>}
      <ul>
        {allUsers.map((user) => (
          <li key={user._id}>
            <p>Username: {user.username}</p>
            <p>Full Name: {user.fullname}</p>
            <p>Email: {user.email}</p>

            <label>Role:</label>
            <select
              value={editedUsers[user._id]?.role || user.role}
              onChange={(e) =>
                handleInputChange(user._id, "role", e.target.value)
              }
            >
              <option value="user">User</option>
              <option value="creator">Creator</option>
              <option value="admin">Admin</option>
            </select>

            <label>Status:</label>
            <select
              value={editedUsers[user._id]?.userStatus || user.userStatus}
              onChange={(e) =>
                handleInputChange(user._id, "userStatus", e.target.value)
              }
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="BANNED">BANNED</option>
            </select>

            <label>Recipe Limit:</label>
            <input
              type="number"
              value={editedUsers[user._id]?.recipelimit || user.recipelimit}
              onChange={(e) =>
                handleInputChange(user._id, "recipelimit", e.target.value)
              }
            />

            <button onClick={() => handleUpdateUser(user._id)}>
              Update User
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
};

export default AllUsers;

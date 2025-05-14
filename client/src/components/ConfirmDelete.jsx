import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ConfirmDelete = ({ deleteType, deleteId, deleteApi, redirectPath }) => {
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");
  const [deleteError, setDeleteError] = useState(null);
  const navigate = useNavigate();

  const handleDelete = async (e) => {
    e.preventDefault();
    if (deleteConfirmInput !== "DELETE") {
      setDeleteError('Please type "DELETE" to confirm.');
      return;
    }
    try {
      const res = await fetch(`${deleteApi}/${deleteId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) {
        setDeleteError(data.message || "Deletion failed");
      } else {
        navigate(redirectPath);
      }
    } catch (err) {
      setDeleteError(err.message);
    }
  };

  return (
    <form onSubmit={handleDelete} className="border p-4 my-4">
      <h3>Confirm Deletion</h3>
      <p>Type "DELETE" to permanently remove this {deleteType}.</p>
      <input
        type="text"
        value={deleteConfirmInput}
        onChange={(e) => setDeleteConfirmInput(e.target.value)}
        required
        className="border p-2 my-2 block"
      />
      {deleteError && <p className="text-red-700 text-sm">{deleteError}</p>}
      <div className="flex gap-4">
        <button
          type="submit"
          className="p-3 bg-red-600 text-white rounded-lg hover:opacity-90"
        >
          Confirm Delete
        </button>
        <button
          type="button"
          onClick={() => {
            setDeleteError(null);
            setDeleteConfirmInput("");
          }}
          className="p-3 bg-gray-400 text-white rounded-lg hover:opacity-90"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ConfirmDelete;

import React, { useState, useEffect } from "react";

const SingleTagSelector = ({ attribute, onSelect, value = [] }) => {
  const [selectedTags, setSelectedTags] = useState(value);
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [dbTags, setDbTags] = useState([]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/tag/${attribute}`);
        const data = await res.json();
        console.log("Fetched tags:", data); // Debugging line
        setDbTags(data);
      } catch (err) {
        console.error("Error fetching tags:", err);
      }
    };
    fetchTags();
  }, [attribute]);

  // Call onSelect after selectedTags state updates
  useEffect(() => {
    if (onSelect) onSelect(selectedTags);
  }, [selectedTags]); // Removed onSelect from dependency array

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    if (val.trim() === "") {
      setSuggestions([]);
      return;
    }
    const filtered = dbTags
      .filter((tag) => {
        if (!tag || !tag.name) return false;
        return (
          tag.name.toLowerCase().includes(val.toLowerCase()) &&
          !selectedTags.some(
            (sel) =>
              sel.tagId === tag._id ||
              sel.name.toLowerCase() === tag.name.toLowerCase()
          )
        );
      })
      .map((tag) => tag.name);
    setSuggestions(filtered);
  };

  const handleTagSelect = async (tagName) => {
    if (
      selectedTags.some((t) => {
        if (t && typeof t === "object" && t.name) {
          return t.name.toLowerCase() === tagName.toLowerCase();
        } else if (typeof t === "string") {
          return t.toLowerCase() === tagName.toLowerCase();
        }
        return false;
      })
    )
      return;
    let tagObj = dbTags.find(
      (t) => t.name.toLowerCase() === tagName.toLowerCase()
    );
    if (!tagObj) {
      try {
        const res = await fetch("http://localhost:3000/api/tag", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tagType: attribute, name: tagName }),
        });
        tagObj = await res.json();
        setDbTags((prev) => [...prev, tagObj]);
      } catch (err) {
        console.error("Error creating new tag:", err);
        return;
      }
    }
    setSelectedTags((prev) => [...prev, tagObj]);
    setInputValue("");
    setSuggestions([]);
  };

  const handleKeyDown = async (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (inputValue.trim() !== "") {
        if (suggestions.length > 0) {
          await handleTagSelect(suggestions[0]);
        } else {
          await handleTagSelect(inputValue.trim());
        }
      }
    }
  };

  const handleRemoveTag = (tagIdentifier) => {
    setSelectedTags((prev) =>
      prev.filter((t) =>
        // Compare by _id if available; otherwise, compare tag string's lower case.
        t && t._id
          ? t._id !== tagIdentifier
          : t.toLowerCase() !== tagIdentifier.toLowerCase()
      )
    );
  };

  // Use a safe array filtering out null or undefined values.
  const safeSelected = (selectedTags || []).filter((t) => t != null);

  return (
    <div className="tag-selector">
      <div className="selected-tags">
        {safeSelected.length > 0 ? (
          safeSelected.map((tag, index) => {
            const displayName = tag && tag.name ? tag.name : tag;
            const keyVal = (tag && tag._id) || `${displayName}-${index}`;
            return (
              <span key={keyVal} className="tag-badge">
                {typeof tag === "object" ? tag.tagName || tag.name : tag}
                <button
                  onClick={() => handleRemoveTag((tag && tag._id) || tag)}
                >
                  &times;
                </button>
              </span>
            );
          })
        ) : (
          <p>No tags selected.</p>
        )}
      </div>
      <div className="tag-input-wrapper">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={`Search or create a ${attribute}...`} // updated placeholder for equipmentTag support
        />
      </div>
      {suggestions.length > 0 && (
        <div className="suggestions">
          {suggestions.map((sug, index) => (
            <div
              key={`${sug}-${index}`}
              onClick={async () => await handleTagSelect(sug)}
            >
              {sug}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const TagSelector = (props) => {
  return <SingleTagSelector {...props} />;
};

export default TagSelector;

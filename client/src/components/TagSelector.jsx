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
      .filter(
        (tag) =>
          tag.name.toLowerCase().includes(val.toLowerCase()) &&
          !selectedTags.some(
            (sel) => sel.name.toLowerCase() === tag.name.toLowerCase()
          )
      )
      .map((tag) => tag.name);
    setSuggestions(filtered);
  };

  const handleTagSelect = async (tagName) => {
    if (
      selectedTags.some((t) => t.name.toLowerCase() === tagName.toLowerCase())
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

  const handleRemoveTag = (tagId) => {
    setSelectedTags((prev) => prev.filter((t) => t._id !== tagId));
  };

  return (
    <div className="tag-selector">
      <label>{attribute} Selector</label>
      <div className="selected-tags">
        {selectedTags.length > 0 ? (
          selectedTags.map((tag, index) => (
            <span key={tag._id || `${tag.name}-${index}`} className="tag-badge">
              {tag.name}
              <button onClick={() => handleRemoveTag(tag._id)}>&times;</button>
            </span>
          ))
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
          placeholder="Search or create a tag..."
        />
        {/* Removed non necessary Add button */}
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

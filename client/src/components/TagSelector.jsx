import React, { useState, useEffect, useRef } from "react";

const SingleTagSelector = ({ attribute, onSelect, onRemove, value = [] }) => {
  const [selectedTags, setSelectedTags] = useState(value);
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [dbTags, setDbTags] = useState([]);
  // Add a ref to track if we're handling internal changes
  const isInternalChange = useRef(false);

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

  // Update selected tags when value prop changes, but only if it's not from our internal change
  useEffect(() => {
    // Don't update if the change was triggered internally
    if (
      JSON.stringify(value) !== JSON.stringify(selectedTags) &&
      !isInternalChange.current
    ) {
      setSelectedTags(value);
    }
    // Reset the flag after each render
    isInternalChange.current = false;
  }, [value]);

  // Call onSelect after selectedTags state updates, but only for internal changes
  useEffect(() => {
    if (onSelect && isInternalChange.current) onSelect(selectedTags);
  }, [selectedTags, onSelect]); // Added onSelect back to dependency array

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
          !selectedTags.some((sel) => {
            if (sel && sel.name) {
              return sel.name.toLowerCase() === tag.name.toLowerCase();
            } else if (typeof sel === "string") {
              return sel.toLowerCase() === tag.name.toLowerCase();
            }
            return false;
          })
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

    // Set flag to indicate this is an internal change
    isInternalChange.current = true;

    // Update state and notify parent
    const newTags = [...selectedTags, tagObj];
    setSelectedTags(newTags);
    if (onSelect) onSelect(newTags);

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
    console.log("e - Tag removal initiated:", {
      tagIdentifier,
      allTags: [...selectedTags],
      attribute,
    });

    // Find the tag to be removed
    const tagToRemove = selectedTags.find((t) => {
      if (typeof t === "string") {
        return t === tagIdentifier;
      } else if (t && typeof t === "object") {
        // Check for both _id and tagId fields
        return t._id === tagIdentifier || t.tagId === tagIdentifier;
      }
      return false;
    });

    console.log("e - Found tag to remove:", tagToRemove);

    // Set flag to indicate this is an internal change
    isInternalChange.current = true;

    // Update state with filtered tags
    const newTags = selectedTags.filter((t) => {
      if (typeof t === "string") {
        return t !== tagIdentifier;
      } else if (t && typeof t === "object") {
        // Check for both _id and tagId fields
        return !(t._id === tagIdentifier || t.tagId === tagIdentifier);
      }
      return true;
    });

    // Update state and notify parent
    setSelectedTags(newTags);
    if (onSelect) onSelect(newTags);

    // Call the onRemove prop if provided
    if (onRemove) {
      console.log("e - Calling onRemove with tag:", tagToRemove);

      // Get the appropriate ID from the tag
      const tagId =
        tagToRemove && typeof tagToRemove === "object"
          ? tagToRemove._id || tagToRemove.tagId
          : tagIdentifier;

      onRemove(tagId);
    }
  };

  // Use a safe array filtering out null or undefined values.
  const safeSelected = (selectedTags || []).filter((t) => t != null);

  return (
    <div className="tag-selector">
      <div className="selected-tags">
        {safeSelected.length > 0 ? (
          safeSelected.map((tag, index) => {
            // Handle different tag object structures
            let displayName = "";
            let tagId = "";

            if (typeof tag === "string") {
              displayName = tag;
              tagId = tag;
            } else if (tag && typeof tag === "object") {
              // Handle both name and tagName formats
              displayName = tag.name || tag.tagName || "Unknown Tag";
              tagId = tag._id || tag.tagId || `tag-${index}`;
            }

            const keyVal = tagId || `tag-${index}`;

            return (
              <span key={keyVal} className="tag-badge">
                <span className="tag-name">{displayName}</span>
                <button
                  className="kh-btn kh-btn__x"
                  onClick={() => handleRemoveTag(tagId)}
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
          placeholder="Search or create a tag..."
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

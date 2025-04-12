import React from "react";

const TagList = ({ tags, tagType }) => {
  return (
    <div className="tag-list">
      <h2>{tagType}</h2> {/* Display the tagType */}
      {tags.map((tag, index) => (
        <span key={index} className="tag">
          {tag}
        </span>
      ))}
    </div>
  );
};

export default TagList;

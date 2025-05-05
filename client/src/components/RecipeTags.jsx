import React from "react";

const TagList = ({ tags, tagType, title }) => {
  return (
    <div className="kh-recipe-single__tags">
      <h5>{title}:</h5>
      <ul className="kh-recipe-single__tags--list">
        {tags && tags.length > 0 ? (
          tags
            .filter((tag) => {
              const tagName =
                typeof tag === "object" ? tag.tagName || "Unknown Tag" : tag;
              return tagName !== "Unknown"; // Exclude "Unknown" tags
            })
            .map((tag, index) => {
              const tagName =
                typeof tag === "object" ? tag.tagName || "Unknown Tag" : tag;
              const tagId = typeof tag === "object" ? tag.tagId : tag; // Use tagId instead of _id

              return (
                <li
                  className="kh-recipe-single__tags--item"
                  key={tagId || `${tagName}-${index}`} // Ensure a unique key
                >
                  <a href={`/cookshop/${tagType}/${tagId || index}`}>
                    {tagName}
                  </a>
                </li>
              );
            })
        ) : (
          <li>N/A</li>
        )}
      </ul>
    </div>
  );
};

export default TagList;

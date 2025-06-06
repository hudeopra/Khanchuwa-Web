import React, { useEffect, useState } from "react";
import { flavorTags as initialFlavorTags } from "../assets/js/dummyContent";
import { sortByPropertyDesc } from "../utilities/SortItems";

// Function to divide tags into 6 parts
const divideTags = (tags, parts) => {
  const divided = [];
  const partSize = Math.ceil(tags.length / parts);
  for (let i = 0; i < parts; i++) {
    divided.push(tags.slice(i * partSize, (i + 1) * partSize));
  }
  return divided;
};

const FlavorTagSlider = () => {
  const [flavorTags, setFlavorTags] = useState(initialFlavorTags);

  // Sort flavor tags by favorite count in descending order before rendering
  useEffect(() => {
    setFlavorTags((prevTags) => sortByPropertyDesc(prevTags, "recipeFav"));
  }, [initialFlavorTags]);

  const dividedTags = divideTags(flavorTags, 6);

  return (
    <div className="kh-flavor-tag-slider">
      {dividedTags.map((part, index) => (
        <div key={index} className="kh-flavor-tag-wrapper">
          <div
            className={`kh-flavor-tag-part ${
              index % 2 === 0 ? "left" : "right"
            } kh-scrolling-image1`}
          >
            {part.map((tag, idx) => (
              <div key={idx} className="kh-flavor-tag">
                {tag}
              </div>
            ))}
          </div>
          <div
            className={`kh-flavor-tag-part ${
              index % 2 === 0 ? "left" : "right"
            } kh-scrolling-image2`}
          >
            {part.map((tag, idx) => (
              <div key={idx} className="kh-flavor-tag">
                {tag}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FlavorTagSlider;

import React from "react";

export default function RecipeTagFilters({
  tags,
  selectedTags,
  setSelectedTags,
  logic,
  setLogic,
  showFilter,
  setShowFilter,
  filterTitle,
}) {
  return (
    <div className="kh-recipe-list__filter-wrapper--tags">
      <h3
        onClick={() => setShowFilter(!showFilter)}
        style={{ cursor: "pointer" }}
      >
        {filterTitle} {tags.length}
      </h3>
      <div
        className={`kh-recipe-list__filter ${showFilter ? "filter-popup" : ""}`}
      >
        <button className="close-button" onClick={() => setShowFilter(false)}>
          x
        </button>
        <button
          onClick={() => setLogic((prev) => (prev === "AND" ? "OR" : "AND"))}
        >
          Toggle Logic: {logic}
        </button>
        <div className="kh-recipe-list__filter--wrapper">
          {tags.map((tag) => (
            <div
              key={tag.name || tag._id}
              className="kh-recipe-form__checkbox--item"
            >
              <input
                type="checkbox"
                value={tag.name || tag._id}
                checked={selectedTags.includes(tag.name || tag._id)}
                onChange={(e) => {
                  e.target.checked
                    ? setSelectedTags((prev) => {
                        const updated = [...prev, e.target.value];
                        console.log("Selected Tags:", updated);
                        return updated;
                      })
                    : setSelectedTags((prev) => {
                        const updated = prev.filter(
                          (t) => t !== e.target.value
                        );
                        console.log("Selected Tags:", updated);
                        return updated;
                      });
                }}
              />
              <label>{tag.name}</label>
            </div>
          ))}
        </div>
      </div>
      <span
        className={`kh-recipe-list__filter-wrapper--overlay ${
          showFilter ? "filter-popup" : ""
        }`}
      ></span>
    </div>
  );
}

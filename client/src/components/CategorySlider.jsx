import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import { sortByPropertyDesc } from "../utilities/SortItems";
import ToggleFavorite from "./ToggleFavorite";

const CategorySlider = ({ keyParam, valueParam, tag }) => {
  const sliderRef = useRef(null);
  const [position, setPosition] = useState(0);
  const [sliderHeight, setSliderHeight] = useState(0);
  const expandedWidth = 200;
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [canSlideNext, setCanSlideNext] = useState(true);
  const [canSlidePrev, setCanSlidePrev] = useState(false);
  const [slideWidth, setSlideWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [items, setItems] = useState([]); // State for fetched recipes
  const [sortedItems, setSortedItems] = useState([]); // State for sorted recipes
  // Fetch recipes based on provided key and value props
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        // For "Popular Recipes" - no filter, just get all published recipes
        // For other categories - use filter-by-attributes endpoint
        let url;
        if (keyParam && valueParam) {
          url = `/api/recipe/filter-by-attributes?${keyParam}=${valueParam}`;
          console.log(`Fetching ${tag} recipes with ${keyParam}=${valueParam}`);
        } else {
          // If no filter parameters, fetch all published recipes (for Popular Recipes)
          url = "/api/recipe/published";
          console.log(`Fetching ${tag} recipes (all published)`);
        }

        const response = await fetch(url);
        const data = await response.json();
        console.log(`Fetched ${tag} recipes:`, data);

        if (data.success && Array.isArray(data.recipes)) {
          // For popular recipes, limit to 10 recipes and sort by views or date
          if (!keyParam && !valueParam) {
            // Sort by views or popularity for "Popular Recipes"
            const popularRecipes = [...data.recipes]
              .sort((a, b) => (b.views || 0) - (a.views || 0))
              .slice(0, 10); // Limit to 10 recipes

            setItems(popularRecipes);
            setSortedItems(sortByPropertyDesc(popularRecipes, "recipeFav"));
          } else {
            setItems(data.recipes);
            setSortedItems(sortByPropertyDesc(data.recipes, "recipeFav"));
          }
        }
      } catch (error) {
        console.error(`Error fetching ${tag} recipes:`, error);
      }
    };

    fetchRecipes();
  }, [keyParam, valueParam, tag]);

  // Calculate dimensions and update slider container height
  useLayoutEffect(() => {
    const updateDimensions = () => {
      const container = document.querySelector(".container");
      if (container && sliderRef.current) {
        const newContainerWidth = container.offsetWidth;
        setContainerWidth(newContainerWidth);
        const firstItem = sliderRef.current.children[0];
        if (firstItem) {
          const width =
            firstItem.offsetWidth +
            parseInt(getComputedStyle(firstItem).marginRight || 0, 10);
          setSlideWidth(width);
        }
        setSliderHeight(sliderRef.current.offsetHeight);
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Update buttons for slide navigation
  useEffect(() => {
    if (sliderRef.current) {
      const totalWidth = sliderRef.current.scrollWidth;
      const maxTranslate = Math.min(0, containerWidth - (totalWidth - 200)); // Ensure maxTranslate is negative or zero
      setCanSlidePrev(position < 0);
      setCanSlideNext(position > maxTranslate); // Correct condition for enabling "Next" button
    }
  }, [position, containerWidth, slideWidth]);

  // Slide to the next item or adjust slider to container's end
  const slideNext = () => {
    if (!sliderRef.current || slideWidth === 0) return;
    const totalWidth = sliderRef.current.scrollWidth;
    const maxTranslate = containerWidth - totalWidth;
    if (position - slideWidth <= maxTranslate) {
      slideToEnd();
      return;
    } else {
      setPosition(position - slideWidth);
      setActiveIndex(activeIndex + 1);
    }
  };

  // Adjust slider to container's end (offset by 48px)
  const slideToEnd = () => {
    const totalWidth = sliderRef.current.scrollWidth;
    const newPosition = containerWidth - totalWidth - 48;
    const visibleSlides = Math.floor(containerWidth / slideWidth);
    const lastActiveIndex = items.length - visibleSlides;
    setPosition(newPosition);
    setActiveIndex(lastActiveIndex >= 0 ? lastActiveIndex : 0);
    setCanSlideNext(false);
  };

  // Slide to the previous item or adjust slider to container's start
  const slidePrev = () => {
    if (!sliderRef.current || slideWidth === 0) return;
    let newPosition, newActiveIndex;
    if (position + slideWidth >= 0) {
      newPosition = 0;
      newActiveIndex = 0;
    } else {
      newPosition = position + slideWidth;
      newActiveIndex = activeIndex - 1;
    }
    setPosition(newPosition);
    setActiveIndex(Math.max(newActiveIndex, 0));
  };

  return (
    <div className="">
      {tag ? <h2>{tag}</h2> : <h2>Default Category Slider</h2>}
      <div
        className="slider-container"
        // style={{ height: `${sliderHeight || 350}px` }}
      >
        <div
          className="slider"
          ref={sliderRef}
          style={{
            transform: `translateX(${position}px)`,
            transition: "transform 0.3s ease-out",
          }}
        >
          {sortedItems.map((item, index) => (
            <div
              key={item._id || index} // Ensure unique key
              className={`kh-recipe-block__item ${
                hoveredIndex !== null
                  ? index === hoveredIndex
                    ? "activeSlide"
                    : ""
                  : index === activeIndex
                  ? "activeSlide"
                  : ""
              }`}
            >
              <ToggleFavorite recipeId={item._id} />

              <a
                href={`/recipes/${item._id}`} // Link to the recipe's page
                onMouseEnter={() => {
                  if (index !== activeIndex) {
                    setHoveredIndex(index);
                  }
                }}
                onMouseLeave={() => {
                  setHoveredIndex(null);
                }}
              >
                <div className="kh-recipe-block__item--img">
                  {item.imageUrls && item.imageUrls[0] && (
                    <img
                      src={item.imageUrls[0]}
                      alt={item.recipeName}
                      className="card-image"
                    />
                  )}
                </div>
                <div className="kh-recipe-block__content">
                  <h3>{item.recipeName}</h3>
                  <p>
                    {item.shortDescription && item.shortDescription.length > 150
                      ? `${item.shortDescription.slice(0, 110)}...`
                      : item.shortDescription}
                  </p>
                </div>
                <div className="kh-recipe-block__info">
                  <span>{item.cookTime} mins</span>
                  <span>{item.servings} servings</span>
                  <span>{item.difficulty}</span>
                </div>
              </a>
            </div>
          ))}
        </div>
        <div className="controls">
          <button
            onClick={slidePrev}
            disabled={!canSlidePrev}
            style={{ opacity: canSlidePrev ? 1 : 0 }}
          >
            ← Prev
          </button>
          <button
            onClick={slideNext}
            disabled={!canSlideNext}
            style={{ opacity: canSlideNext ? 1 : 0 }}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategorySlider;

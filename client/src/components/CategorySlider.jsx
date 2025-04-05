import React, { useState, useRef, useLayoutEffect, useEffect } from "react";

const CategorySlider = ({ keyParam, valueParam }) => {
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

  // Fetch recipes based on provided key and value props
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await fetch(
          `/api/recipe/filter-by-attributes?${keyParam}=${valueParam}`
        );
        const data = await response.json();
        console.log("Fetched recipes:", data);
        if (data.success && Array.isArray(data.recipes)) {
          setItems(data.recipes);
        }
      } catch (error) {
        console.error("Error fetching recipes:", error);
      }
    };
    fetchRecipes();
  }, [keyParam, valueParam]);

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
      const maxTranslate = containerWidth - totalWidth;
      setCanSlidePrev(position < 0);
      setCanSlideNext(position > maxTranslate);
    }
  }, [position, containerWidth]);

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
    <div className="container">
      <h2>Category Slider</h2>
      <div className="slider-container" style={{ height: `${sliderHeight}px` }}>
        <div
          className="slider"
          ref={sliderRef}
          style={{
            transform: `translateX(${position}px)`,
            transition: "transform 0.3s ease-out",
          }}
        >
          {items.map((item, index) => (
            <div
              key={item._id}
              className={`slider-item ${
                hoveredIndex !== null
                  ? index === hoveredIndex
                    ? "activeSlide"
                    : ""
                  : index === activeIndex
                  ? "activeSlide"
                  : ""
              }`}
              onMouseEnter={() => {
                if (index !== activeIndex) {
                  setHoveredIndex(index);
                }
              }}
              onMouseLeave={() => {
                setHoveredIndex(null);
              }}
            >
              <div className="card-content">
                <h3>{item.recipeName}</h3>
                {item.imageUrls && item.imageUrls[0] && (
                  <img
                    src={item.imageUrls[0]}
                    alt={item.recipeName}
                    className="card-image"
                  />
                )}
                <p>{item.shortDescription}</p>
                <p className="price">
                  {item.cookTime} mins | {item.servings} servings |{" "}
                  {item.difficulty}
                </p>
              </div>
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

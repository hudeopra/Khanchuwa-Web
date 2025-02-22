import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import { categorySliderData } from "../assets/js/dummyContent.js";

const CategorySlider = () => {
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

  // Use imported data for slider items.
  const items = categorySliderData;

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
        // Set the height of the slider (for absolute positioning)
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
              key={index}
              className={`slider-item ${
                hoveredIndex !== null
                  ? index === hoveredIndex
                    ? "activeSlide"
                    : ""
                  : index === activeIndex
                  ? "activeSlide"
                  : ""
              }`}
              // For active/hovered slide, set width as computed slideWidth + expandedWidth
              style={
                (hoveredIndex !== null && index === hoveredIndex) ||
                index === activeIndex
                  ? { width: `${slideWidth + expandedWidth}px` }
                  : {}
              }
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
                <h3>{item.name}</h3>
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="card-image"
                  />
                )}
                <p>{item.description}</p>
                <p className="price">
                  {item.cookTime} | {item.portion} | {item.difficulty}
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

import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import ToggleFavorite from "./ToggleFavorite";

const Recommendation = ({ userId, topN = 5, minSimilarity = 0.1 }) => {
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
  const [recommendedRecipes, setRecommendedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await fetch(
          `/api/recommendation/recommendations?userId=${userId}&topN=${topN}&minSimilarity=${minSimilarity}`
        );
        const data = await response.json();
        if (data.success && Array.isArray(data.recommendations)) {
          const recipeDetails = await Promise.all(
            data.recommendations.map(async (rec) => {
              try {
                const res = await fetch(`/api/recipe/${rec.id}`);
                const contentType = res.headers.get("content-type");
                let recipeData;
                if (contentType && contentType.includes("application/json")) {
                  recipeData = await res.json();
                } else {
                  const text = await res.text();
                  throw new Error(text);
                }
                if (res.ok) {
                  return recipeData;
                } else {
                  console.error("Error fetching recipe details:", recipeData);
                  return null;
                }
              } catch (err) {
                console.error("Error fetching recipe details:", err);
                return null;
              }
            })
          );
          setRecommendedRecipes(
            recipeDetails.filter((recipe) => recipe !== null)
          );
        }
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [userId, topN, minSimilarity]);

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

  useEffect(() => {
    if (sliderRef.current) {
      const totalWidth = sliderRef.current.scrollWidth;
      const maxTranslate = Math.min(0, containerWidth - (totalWidth - 200));
      setCanSlidePrev(position < 0);
      setCanSlideNext(position > maxTranslate);
    }
  }, [position, containerWidth, slideWidth]);

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

  const slideToEnd = () => {
    const totalWidth = sliderRef.current.scrollWidth;
    const newPosition = containerWidth - totalWidth - 48;
    const visibleSlides = Math.floor(containerWidth / slideWidth);
    const lastActiveIndex = recommendedRecipes.length - visibleSlides;
    setPosition(newPosition);
    setActiveIndex(lastActiveIndex >= 0 ? lastActiveIndex : 0);
    setCanSlideNext(false);
  };

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

  if (loading) return <p>Loading recommendations...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="">
      <h2>Recommended for You</h2>
      <div className="slider-container">
        <div
          className="slider"
          ref={sliderRef}
          style={{
            transform: `translateX(${position}px)`,
            transition: "transform 0.3s ease-out",
          }}
        >
          {recommendedRecipes.map((item, index) => (
            <div
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
                key={item._id}
                href={`/recipes/${item._id}`}
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

export default Recommendation;

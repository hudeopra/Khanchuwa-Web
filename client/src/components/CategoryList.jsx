import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import { Link } from "react-router-dom";
import { sortByPropertyDesc } from "../utilities/SortItems";

const CategoryList = ({ taglink }) => {
  const sliderRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [sortedCategories, setSortedCategories] = useState([]);
  const [position, setPosition] = useState(0);
  const [slideWidth, setSlideWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [canSlideNext, setCanSlideNext] = useState(true);
  const [canSlidePrev, setCanSlidePrev] = useState(false);
  const [publishedCounts, setPublishedCounts] = useState({});
  const [loading, setLoading] = useState(true);

  // Silently check if a recipe is published without displaying individual errors
  const checkRecipePublished = async (recipeId) => {
    try {
      const recipeResponse = await fetch(
        `http://localhost:3000/api/recipe/published/${recipeId}`
      );
      return recipeResponse.ok;
    } catch (error) {
      // Silently return false instead of logging the error
      return false;
    }
  };

  // Fetch categories from the API
  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:3000/api/tag/${taglink}`)
      .then((response) => response.json())
      .then(async (data) => {
        console.log(`Fetched ${taglink} categories:`, data);
        setCategories(data);

        // Calculate published recipe counts
        const counts = {};
        const missingRecipes = new Set(); // Use Set to track unique missing recipe IDs

        // Process each category
        for (const category of data) {
          let publishedCount = 0;

          // Check each recipe reference for published status
          if (category.recipeRefs && category.recipeRefs.length > 0) {
            // Use Promise.all to check all recipes in parallel
            const checkResults = await Promise.all(
              category.recipeRefs.map(async (recipeId) => {
                const isPublished = await checkRecipePublished(recipeId);

                // If not published, add to the set of missing recipes
                if (!isPublished) {
                  missingRecipes.add(recipeId);
                }

                return isPublished;
              })
            );

            // Count published recipes based on results
            publishedCount = checkResults.filter(Boolean).length;
          }

          // Store the count for this category
          counts[category._id] = publishedCount;
        }

        // Display a single summary message about missing recipes
        const missingCount = missingRecipes.size;
        if (missingCount > 0) {
          console.log(`${missingCount} more recipes are coming soon!`);
        }

        setPublishedCounts(counts);

        // Sort categories by published recipe count instead of total recipe count
        const sortedByPublished = [...data].sort((a, b) => {
          const countA = counts[a._id] || 0;
          const countB = counts[b._id] || 0;
          return countB - countA;
        });

        setSortedCategories(sortedByPublished);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
        setLoading(false);
      });
  }, [taglink]);

  // Calculate dimensions and update slider container
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
      const maxTranslate = Math.min(0, containerWidth - totalWidth);
      setCanSlidePrev(position < 0);
      setCanSlideNext(position > maxTranslate);
    }
  }, [position, containerWidth, slideWidth]);

  // Slide to the next item
  const slideNext = () => {
    if (!sliderRef.current || slideWidth === 0) return;
    const totalWidth = sliderRef.current.scrollWidth;
    const maxTranslate = containerWidth - totalWidth;
    if (position - slideWidth <= maxTranslate) {
      setPosition(maxTranslate);
    } else {
      setPosition(position - slideWidth);
    }
  };

  // Slide to the previous item
  const slidePrev = () => {
    if (!sliderRef.current || slideWidth === 0) return;
    if (position + slideWidth >= 0) {
      setPosition(0);
    } else {
      setPosition(position + slideWidth);
    }
  };

  return (
    <div className=" py-4">
      {loading ? (
        <div className="text-center">Loading categories...</div>
      ) : (
        <div className="slider-container">
          <div
            className="slider"
            ref={sliderRef}
            style={{
              transform: `translateX(${position}px)`,
              transition: "transform 0.3s ease-out",
            }}
          >
            {sortedCategories.map((item, index) => (
              <div key={index} className="kh-category__item">
                <div className="kh-category__item--img">
                  <Link to={`/cookshop/${taglink}/${item._id}`}>
                    {publishedCounts[item._id] > 0 ? (
                      <p>{publishedCounts[item._id]} Recipes</p>
                    ) : (
                      <p>Coming Soon</p>
                    )}
                    <img src={item.favImg} alt={item.name} />
                  </Link>
                </div>
                <h3>{item.name}</h3>
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
      )}
    </div>
  );
};

export default CategoryList;

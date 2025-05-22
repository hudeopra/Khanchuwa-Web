import React, { useEffect } from "react";
import HomeBanner from "../components/HomeBanner.jsx";
import CategoryList from "../components/CategoryList.jsx";
import RecipeCardBig from "../components/RecipeCardBig.jsx";
import FlavorTagSlider from "../components/FlavorTagSlider.jsx";
import CategorySlider from "../components/CategorySlider.jsx";

import CustomSelect from "../components/CustomSelect.jsx";

export default function Home() {
  // useEffect(() => {
  //   let next = document.querySelector(".next");
  //   let prev = document.querySelector(".prev");

  //   next.addEventListener("click", function () {
  //     let items = document.querySelectorAll(".kh-item");
  //     document.querySelector(".kh-slide").appendChild(items[0]);
  //   });

  //   prev.addEventListener("click", function () {
  //     let items = document.querySelectorAll(".kh-item");
  //     document.querySelector(".kh-slide").prepend(items[items.length - 1]);
  //   });
  // }, []);

  return (
    <main className="kh-homepage py-5">
      {/* <TestingComponent /> */}
      {/* <HomeBanner /> */}
      <div className="container pt-5 mt-5">
        <div className="kh-recipeList ">
          <h2>Food. Where Happiness Begins</h2>
          <CategoryList taglink="cuisineTag" />
        </div>
        <div className="kh-recipeList">
          <h2>Explore Flavours</h2>
          <CategoryList taglink="flavourTag" />
        </div>
        <div className="kh-recipeBlock">
          <h2>Top Picks</h2>
          <RecipeCardBig />
        </div>
      </div>
      <div className="kh-tag py-5 mt-5">
        <FlavorTagSlider />
      </div>{" "}
      <div className="container">
        <div className="kh-slider py-5">
          <CategorySlider key="popular-recipes" tag="Popular Recipes" />
        </div>
        <div className="kh-slider py-5">
          <CategorySlider
            key="dinner-ideas"
            tag="Dinner Ideas"
            keyParam="mealType"
            valueParam="Dinner"
          />
        </div>
        {/* <div className="kh-slider py-5">
          <CategorySlider
            key="vegan-recipes"
            tag="Vegan Recipes"
            keyParam="diet"
            valueParam="Vegan"
          />
        </div> */}
        {/* <div className="test">
        <CustomSelect />
      </div> */}
      </div>
    </main>
  );
}

import React, { useEffect } from "react";
import HomeBanner from "../components/HomeBanner.jsx";
import CategoryList from "../components/CategoryList.jsx";
import RecipeCardBig from "../components/RecipeCardBig.jsx";
import FlavorTagSlider from "../components/FlavorTagSlider.jsx";
import CategorySlider from "../components/CategorySlider.jsx";

import FavRecipeBlock from "../components/FavRecipeBlock.jsx";
import CustomSelect from "../components/CustomSelect.jsx";
import TestingComponent from "../components/TestingComponent.jsx";
import TagSelector from "../components/TagSelector.jsx";

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
    <main className="kh-homepage">
      <TestingComponent />
      {/* <TagSelector /> */}
      {/* <HomeBanner /> */}
      <div className="container py-5 mt-5">
        <div className="kh-recipeList">
          <h2>Food. Where Happiness Begins</h2>
          <CategoryList />
        </div>
        <div className="kh-recipeBlock">
          <RecipeCardBig />
        </div>
      </div>
      <div className="kh-tag py-5 mt-5">
        <FlavorTagSlider />
      </div>
      <div className="kh-recipe-fav py-5">
        <FavRecipeBlock />
      </div>
      <div className="kh-slider py-5">
        <CategorySlider keyParam="mealType" valueParam="Dinner" />
      </div>
      <div className="kh-slider py-5">
        <CategorySlider keyParam="diet" valueParam="Vegan" />
      </div>
      {/* <div className="test">
        <CustomSelect />
      </div> */}
      <div className="kh-recipe-fav py-5">
        <FavRecipeBlock variant="inverted" />
      </div>
    </main>
  );
}

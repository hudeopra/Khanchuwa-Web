import React, { useEffect } from "react";
import {
  bannerOne,
  bannerTwo,
  bannerThree,
  bannerFour,
  bannerFive,
  bannerSix,
} from "../assets/js/images.js";
import { homeBannerData } from "../assets/js/dummyContent.js";
import HomeBanner from "../components/HomeBanner.jsx";
import CategoryList from "../components/categoryList.jsx";
import RecipeCardBig from "../components/RecipeCardBig.jsx";
import FlavorTagSlider from "../components/FlavorTagSlider.jsx";
import Header from "../components/Header";

export default function Home() {
  useEffect(() => {
    let next = document.querySelector(".next");
    let prev = document.querySelector(".prev");

    next.addEventListener("click", function () {
      let items = document.querySelectorAll(".kh-item");
      document.querySelector(".kh-slide").appendChild(items[0]);
    });

    prev.addEventListener("click", function () {
      let items = document.querySelectorAll(".kh-item");
      document.querySelector(".kh-slide").prepend(items[items.length - 1]);
    });
  }, []);

  return (
    <main className="kh-homepage">
      <HomeBanner />
      <div className="container">
        <div className="kh-recipeList">
          <h2>Food. Where Happiness Begins</h2>
          <CategoryList />
        </div>
        <div className="kh-recipeBlock">
          <RecipeCardBig />
        </div>
        <div className="kh-tag">
          <FlavorTagSlider />
        </div>
      </div>
    </main>
  );
}

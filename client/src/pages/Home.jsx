import React, { useEffect } from "react";
import {
  bannerOne,
  bannerTwo,
  bannerThree,
  bannerFour,
  bannerFive,
  bannerSix,
} from "../assets/js/images.js";
import { homeBannerData } from "../assets/js/bannerContent.js";
import HomeBanner from "../components/HomeBanner.jsx";
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
    <div className="kh-homepage">
      <HomeBanner />
      <Header />
      <div className="containerCOmponent">
        <div className="kh-recipeList">
          <h2>Food. Where Happiness Begins</h2>
          <div className="kh-recipeList__wrapper">
            <div className="kh-recipeList__item">
              <img src="" alt="" />
              <h3>Recipe Name</h3>
            </div>
          </div>
        </div>
        <div className="kh-recipeBlock">
          <div className="kh-recipeBlock__item">
            <div className="kh-recipeBlock__item--btns">
              <button className="kh-recipeBlock__item--btn-more">M</button>
              <button className="kh-recipeBlock__item--btn-fav">W</button>
            </div>
            <img src="" alt="" />
            <div className="kh-recipeBlock__item--content">
              <h3>Recipe Name</h3>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

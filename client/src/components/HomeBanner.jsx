import React, { useState } from "react";
import { homeBannerData } from "../assets/js/dummyContent.js";

const HomeBanner = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const handleShowMoreClick = (index) => {
    setActiveIndex(index);
  };

  const handlePrevNextClick = () => {
    setActiveIndex(null);
  };

  return (
    <div className="">
      <div className="kh-slide">
        {homeBannerData.map((item, index) => (
          <div
            key={index}
            className="kh-item"
            style={{ backgroundImage: `url(${item.image})` }}
          >
            <div
              className={`kh-banner ${
                activeIndex === index ? "kh-show" : "kh-hide"
              }`}
            >
              <div className="kh-banner__recipe">
                <div className="kh-banner__recipe--wrapper container">
                  <div className="kh-banner__recipe--flavorTag">
                    <h4>Flavors</h4>
                    <ul>
                      <li>{item.tag[0]}</li>
                      <li>{item.tag[1]}</li>
                    </ul>
                  </div>
                  <div className="kh-banner__recipe--level">
                    <h4>Difficulty Level</h4>
                    <p>{item.level}</p>
                  </div>
                  <div className="kh-banner__recipe--pTime">
                    <h4>Preparation Time</h4>
                    <p>{item.pTime}</p>
                  </div>
                  <div className="kh-banner__recipe--cTime">
                    <h4>Cook Time</h4>
                    <p>{item.cTime}</p>
                  </div>
                  <div className="kh-banner__recipe--portion">
                    <h4>Servings</h4>
                    <p>{item.portion}</p>
                  </div>
                  <div className="kh-banner__recipe--type">
                    <h4>Food Type</h4>
                    <p>{item.type}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="kh-banner__recipe--title">
              <h2 className="name">{item.name}</h2>
              <a href="#" onClick={() => handleShowMoreClick(index)}>
                show more
              </a>
            </div>
          </div>
        ))}
      </div>
      <div className="button">
        <button className="prev" onClick={handlePrevNextClick}>
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <button className="next" onClick={handlePrevNextClick}>
          <i className="fa-solid fa-arrow-right"></i>
        </button>
      </div>
    </div>
  );
};

export default HomeBanner;

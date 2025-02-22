import React from "react";

export const FavRecipeBlock = () => {
  return (
    <div className="container">
      <div className="kh-recipe-fav__wrapper">
        <div className="kh-recipe-fav__content">
          <div className="kh-recipe-fav__img">
            <img src="" alt="Recipe image" />
          </div>
          <div className="kh-recipe-fav__content-detail">
            <h3 className="kh-recipe-fav__title">CAN’T DECIDE?</h3>
            <p className="kh-recipe-fav__description">
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ullam
              ratione est nesciunt quibusdam autem consequuntur aperiam
              quisquam? Aspernatur, molestias incidunt?
            </p>
            <div className="kh-recipe-fav__process">
              <div className="kh-recipe-fav__process-item">
                <img
                  className="kh-recipe-fav__process-item-icon"
                  src=""
                  alt="Process icon 1"
                />
                <span className="kh-recipe-fav__process-item-text">
                  Text Content
                </span>
              </div>
              <div className="kh-recipe-fav__process-item">
                <img
                  className="kh-recipe-fav__process-item-icon"
                  src=""
                  alt="Process icon 2"
                />
                <span className="kh-recipe-fav__process-item-text">
                  Text Content
                </span>
              </div>
              <div className="kh-recipe-fav__process-item">
                <img
                  className="kh-recipe-fav__process-item-icon"
                  src=""
                  alt="Process icon 3"
                />
                <span className="kh-recipe-fav__process-item-text">
                  Text Content
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="kh-recipe-fav__product">
          <div className="kh-recipe-fav__product--head">
            <div className="kh-recipe-fav__product---head-img">
              <img src="" alt="Product image" />
            </div>
            <p>
              Lorem ipsum, dolor sit amet consectetur adipisicing elit.
              Doloremque, ipsum?
            </p>
          </div>
          <div className="kh-recipe-fav__product--body">
            <div className="kh-recipe-fav__product--content">
              <div className="kh-product-fav__product--detail">
                <span className="kh-recipe-fav__product--price">$123</span>
                <h4 className="kh-recipe-fav__product--title">Product Title</h4>
              </div>
              <button className="kh-recipe-fav__action-button">
                Action Button
              </button>
            </div>
            <p className="kh-recipe-fav__product--description">
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ullam
              ratione est nesciunt quibusdam autem consequuntur aperiam
              quisquam? Aspernatur, molestias incidunt?
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FavRecipeBlock;

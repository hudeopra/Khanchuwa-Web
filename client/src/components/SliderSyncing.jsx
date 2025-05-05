import React, { useRef } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const SliderSyncing = ({ imageUrls }) => {
  const sliderForRef = useRef(null);
  const sliderNavRef = useRef(null);

  const sliderForSettings = {
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    infinite: true,
    fade: true,
    asNavFor: sliderNavRef.current,
  };

  const sliderNavSettings = {
    slidesToShow: 3,
    slidesToScroll: 1,
    asNavFor: sliderForRef.current,
    dots: true,
    infinite: true,
    centerMode: true,
    focusOnSelect: true,
  };

  return (
    <div className="kh-slider">
      <Slider {...sliderForSettings} ref={sliderForRef} className="slider-for">
        {imageUrls.map((url, index) => (
          <div key={index}>
            <img
              src={url}
              alt={`Recipe image ${index + 1}`}
              className="w-full h-auto object-cover rounded-lg"
            />
          </div>
        ))}
      </Slider>
      <Slider {...sliderNavSettings} ref={sliderNavRef} className="slider-nav">
        {imageUrls.map((url, index) => (
          <div key={index}>
            <img
              src={url}
              alt={`Thumbnail ${index + 1}`}
              className="w-20 h-20 object-cover rounded-lg"
            />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default SliderSyncing;

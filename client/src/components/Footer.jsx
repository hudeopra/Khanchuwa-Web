import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="kh-footer pt-5">
      <div className="container">
        <div className="kh-footer__wrapper pt-5 ">
          <nav className="kh-footer__nav-wrapper">
            <h4>Recipe Courses</h4>
            <ul>
              <li>
                <Link to="/appetizers">Appetizers</Link>
              </li>
              <li>
                <Link to="/main-course">Main Course</Link>
              </li>
              <li>
                <Link to="/side-dishes">Side Dishes</Link>
              </li>
              <li>
                <Link to="/desserts">Desserts</Link>
              </li>
              <li>
                <Link to="/snacks">Snacks</Link>
              </li>
              <li>
                <Link to="/breakfast">Breakfast</Link>
              </li>
              <li>
                <Link to="/brunch">Brunch</Link>
              </li>
              <li>
                <Link to="/lunch">Lunch</Link>
              </li>
              <li>
                <Link to="/dinner">Dinner</Link>
              </li>
              <li>
                <Link to="/beverages">Beverages</Link>
              </li>
            </ul>
          </nav>
          <nav className="kh-footer__nav-wrapper">
            <h4>Speed & Difficulty Levels</h4>
            <ul>
              <li>
                <Link to="/quick-easy">Quick & Easy</Link>
              </li>
              <li>
                <Link to="/30-minute-meals">30-Minute Meals</Link>
              </li>
              <li>
                <Link to="/beginner-friendly">Beginner-Friendly</Link>
              </li>
              <li>
                <Link to="/gourmet-fine-dining">Gourmet & Fine Dining</Link>
              </li>
            </ul>
          </nav>
          <nav className="kh-footer__nav-wrapper">
            <h4>Time-Based Recipes</h4>
            <ul>
              <li>
                <Link to="/5-minute-meals">5-Minute Meals</Link>
              </li>
              <li>
                <Link to="/slow-cooked-recipes">Slow-Cooked Recipes</Link>
              </li>
              <li>
                <Link to="/overnight-dishes">Overnight Dishes</Link>
              </li>
              <li>
                <Link to="/meal-prep-recipes">Meal Prep Recipes</Link>
              </li>
            </ul>
          </nav>
          <nav className="kh-footer__nav-wrapper">
            <h4>Cuisine Type</h4>
            <ul>
              <li>
                <Link to="/nepalese-cuisine">Nepalese Cuisine</Link>
              </li>
              <li>
                <Link to="/tibetan-cuisine">Tibetan Cuisine</Link>
              </li>
              <li>
                <Link to="/indian-cuisine">Indian Cuisine</Link>
              </li>
              <li>
                <Link to="/chinese-cuisine">Chinese Cuisine</Link>
              </li>
              <li>
                <Link to="/french-cuisine">French Cuisine</Link>
              </li>
              <li>
                <Link to="/italian-cuisine">Italian Cuisine</Link>
              </li>
              <li>
                <Link to="/mediterranean-cuisine">Mediterranean Cuisine</Link>
              </li>
              <li>
                <Link to="/middle-eastern-cuisine">Middle Eastern Cuisine</Link>
              </li>
              <li>
                <Link to="/thai-cuisine">Thai Cuisine</Link>
              </li>
              <li>
                <Link to="/korean-cuisine">Korean Cuisine</Link>
              </li>
            </ul>
          </nav>
          <nav className="kh-footer__nav-wrapper">
            <h4>Cooking Methods</h4>
            <ul>
              <li>
                <Link to="/grilled">Grilled</Link>
              </li>
              <li>
                <Link to="/baked">Baked</Link>
              </li>
              <li>
                <Link to="/boiled">Boiled</Link>
              </li>
              <li>
                <Link to="/fried">Fried</Link>
              </li>
              <li>
                <Link to="/roasting">Roasting</Link>
              </li>
              <li>
                <Link to="/steamed">Steamed</Link>
              </li>
              <li>
                <Link to="/simmering">Simmering</Link>
              </li>
              <li>
                <Link to="/raw">Raw</Link>
              </li>
            </ul>
          </nav>
          <nav className="kh-footer__nav-wrapper">
            <h4>Ingredient Based Recipes</h4>
            <ul>
              <li>
                <Link to="/vegetable-based-recipes">
                  Vegetable-Based Recipes
                </Link>
              </li>
              <li>
                <Link to="/dairy-free-recipes">Dairy-Free Recipes</Link>
              </li>
              <li>
                <Link to="/protein-based-recipes">Protein-Based Recipes</Link>
              </li>
              <li>
                <Link to="/seafood-recipes">Seafood Recipes</Link>
              </li>
            </ul>
          </nav>
          <nav className="kh-footer__nav-wrapper">
            <h4>Dietary Categories</h4>
            <ul>
              <li>
                <Link to="/vegan">Vegan</Link>
              </li>
              <li>
                <Link to="/vegetarian">Vegetarian</Link>
              </li>
              <li>
                <Link to="/non-veg">Non-Veg</Link>
              </li>
              <li>
                <Link to="/gluten-free">Gluten Free</Link>
              </li>
            </ul>
          </nav>
        </div>
        <div className="kh-footer__foot">
          <div className="kh-footer__foot--copyright">
            <p>Copyright © 2025 Khanchuwa. All rights reserved.</p>
          </div>
          <div className="kh-footer__foot--menu">
            <ul>
              <li>
                <Link to="/quick-easy">About Khanchuwa</Link>
              </li>
              <li>
                <Link to="/quick-easy">Terms of Use</Link>
              </li>
              <li>
                <Link to="/quick-easy">FAQ</Link>
              </li>
              <li>
                <Link to="/quick-easy">Contact Us</Link>
              </li>
              <li>
                <Link to="/sitemap">Site Map</Link>
              </li>
            </ul>
          </div>
          <div className="kh-footer__foot--nation">Nepal</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

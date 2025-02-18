import {
  bannerOne,
  bannerTwo,
  bannerThree,
  bannerFour,
  bannerFive,
  bannerSix,
} from "./images.js";

const homeBannerData = [
  {
    image: bannerOne,
    name: "Healthy Avocado Salad",
    description: "Fresh, vibrant, and packed with nutrients – a perfect start to clean eating!",
    tag: ["Herbaceous", "Citrusy"],
    level: "Easy",
    pTime: "10 mins",
    cTime: "0 mins",
    portion: "2 servings",
    type: "Vegetarian",
  },
  {
    image: bannerTwo,
    title: "Perfect Steak",
    name: "Juicy Steak",
    description:
      "Savor the bold flavors of a perfectly seared, mouthwatering steak.",
    tag: ["Umami", "Smoky"],
    level: "Medium",
    pTime: "15 mins",
    cTime: "10 mins",
    portion: "1 serving",
    type: "Non-Vegetarian",
  },
  {
    image: bannerThree,
    title: "French Delight",
    name: "Flaky Croissant",
    description:
      "Golden, buttery, and irresistibly crisp – indulge in every bite!",
    tag: ["Sweet", "Buttery"],
    level: "Hard",
    pTime: "20 mins",
    cTime: "30 mins",
    portion: "6 croissants",
    type: "Vegetarian",
  },
  {
    image: bannerFour,
    title: "Cheesy Bliss",
    name: "Cheesy Pizza",
    description:
      "Oozing with cheese and loaded with flavors – a slice of pure happiness!",
    tag: ["Savory", "Garlicky"],
    level: "Medium",
    pTime: "20 mins",
    cTime: "15 mins",
    portion: "8 slices",
    type: "Vegetarian",
  },
  {
    image: bannerFive,
    title: "Warm Comfort",
    name: "Classic Tomato Soup",
    description:
      "Rich, comforting, and full of warmth – the ultimate soul-soothing bowl.",
    tag: ["Savory", "Herbaceous"],
    level: "Easy",
    pTime: "10 mins",
    cTime: "15 mins",
    portion: "3 bowls",
    type: "Vegetarian",
  },
  {
    image: bannerSix,
    title: "Morning Boost",
    name: "Hearty Breakfast Set",
    description:
      "Power up your day with a wholesome and delicious breakfast spread!",
    tag: ["Sweet", "Savory"],
    level: "Easy",
    pTime: "15 mins",
    cTime: "10 mins",
    portion: "1 plate",
    type: "Vegetarian",
  },
];

export { homeBannerData };

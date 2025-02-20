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

const cuisineCategoryData = [
  { name: "Thai", recipeCount: 12 },
  { name: "Nepalese", recipeCount: 8 },
  { name: "Middle Eastern", recipeCount: 15 },
  { name: "Mediterranean", recipeCount: 10 },
  { name: "Korean", recipeCount: 9 },
  { name: "Italian", recipeCount: 20 },
  { name: "Indian", recipeCount: 25 },
  { name: "Fusion", recipeCount: 5 },
  { name: "French", recipeCount: 14 },
  { name: "Chinese", recipeCount: 18 },
  { name: "Tibetan", recipeCount: 7 }
];

const recipeCardBig = [
  {
    name: "Shrimp Scampi",
    description: "Succulent shrimp cooked in a garlic butter sauce, served over pasta.",
    cookTime: "25 mins",
    portion: "2 servings",
    difficulty: "Medium",
  },
  {
    name: "Mushroom Risotto",
    description: "Creamy risotto with sautéed mushrooms and Parmesan cheese.",
    cookTime: "35 mins",
    portion: "3 servings",
    difficulty: "Hard",
  },
  {
    name: "Grilled Cheese Sandwich",
    description: "A classic comfort food with melted cheese between crispy bread.",
    cookTime: "10 mins",
    portion: "1 serving",
    difficulty: "Easy",
  },
  {
    name: "Spaghetti Carbonara",
    description: "A classic Italian pasta dish made with eggs, cheese, pancetta, and pepper.",
    cookTime: "20 mins",
    portion: "2 servings",
    difficulty: "Medium",
  },
  {
    name: "Chicken Tikka Masala",
    description: "Tender chicken pieces in a creamy, spiced tomato sauce.",
    cookTime: "30 mins",
    portion: "4 servings",
    difficulty: "Hard",
  },
  {
    name: "Vegetable Stir Fry",
    description: "A quick and healthy mix of vegetables stir-fried with soy sauce.",
    cookTime: "15 mins",
    portion: "3 servings",
    difficulty: "Easy",
  },
  {
    name: "Beef Stroganoff",
    description: "A rich and creamy beef dish served over egg noodles.",
    cookTime: "40 mins",
    portion: "4 servings",
    difficulty: "Medium",
  },
];

const flavorTags = [
  "Sweet", "Spicy", "Salty", "Sour", "Bitter", "Umami", "Savory", "Tangy", "Creamy", "Cheesy",
  "Nutty", "Earthy", "Fruity", "Zesty", "Cool and Creamy", "Smoky", "Bold and Spicy", "Rich",
  "Pungent", "Buttery", "Citrusy", "Tart", "Fermented", "Crunchy", "Peppery", "Herbal",
  "Spicy-Sweet", "Tangy-Sweet", "Sweet-Savory", "Fishy", "Sweet and Sour", "Caramel", "Velvety",
  "Soft and Silky", "Chocolate", "Vanilla", "Tender", "Rich and Smoky", "Crunchy and Nutty",
  "Sweet and Zesty", "Warm and Spicy", "Refreshing", "Floral", "Woody", "Toasty", "Malty",
  "Briny", "Roasted", "Juicy", "Silky", "Aromatic", "Minty", "Honeyed", "Charred", "Grassy",
  "Milky", "Yeasty", "Jammy", "Lemony", "Coconutty", "Garlicky", "Onion-y", "Spicy and Floral",
  "Warm and Nutty", "Bright and Citrusy", "Deep and Earthy", "Savory and Herbal", "Sugary",
  "Frosty", "Spiced", "Vinegary", "Oily", "Brothy", "Meaty", "Tangy and Fruity", "Sweet and Floral",
  "Crisp and Green", "Smoky and Sweet", "Bitter and Citrusy", "Fresh and Spicy", "Creamy and Tart",
  "Nutty and Spicy", "Warm and Buttery", "Cool and Minty", "Rich and Fruity", "Savory and Smoky",
  "Zesty and Herbal", "Peppery and Sweet", "Sour and Spicy", "Fragrant", "Toasted and Sweet",
  "Mocha", "Berry-like", "Tropical", "Piney", "Savory and Rich", "Creamy and Sweet",
  "Spicy and Tangy", "Warm and Earthy", "Bright and Fruity"
];

export { homeBannerData, cuisineCategoryData, recipeCardBig, flavorTags };

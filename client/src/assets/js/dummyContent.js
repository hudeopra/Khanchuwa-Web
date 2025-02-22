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
    portion: "2 Portion",
    difficulty: "Medium",
  },
  {
    name: "Mushroom Risotto",
    description: "Creamy risotto with sautéed mushrooms and Parmesan cheese.",
    cookTime: "35 mins",
    portion: "3 Portion",
    difficulty: "Hard",
  },
  {
    name: "Grilled Cheese Sandwich",
    description: "A classic comfort food with melted cheese between crispy bread.",
    cookTime: "10 mins",
    portion: "1 Portion",
    difficulty: "Easy",
  },
  {
    name: "Spaghetti Carbonara",
    description: "A classic Italian pasta dish made with eggs, cheese, pancetta, and pepper.",
    cookTime: "20 mins",
    portion: "2 Portion",
    difficulty: "Medium",
  },
  {
    name: "Chicken Tikka Masala",
    description: "Tender chicken pieces in a creamy, spiced tomato sauce.",
    cookTime: "30 mins",
    portion: "4 Portion",
    difficulty: "Hard",
  },
  {
    name: "Vegetable Stir Fry",
    description: "A quick and healthy mix of vegetables stir-fried with soy sauce.",
    cookTime: "15 mins",
    portion: "3 Portion",
    difficulty: "Easy",
  },
  {
    name: "Beef Stroganoff",
    description: "A rich and creamy beef dish served over egg noodles.",
    cookTime: "40 mins",
    portion: "4 Portion",
    difficulty: "Medium",
  },
];

const categorySliderData = [
  {
    name: "Shrimp Scampi",
    description: "Succulent shrimp in garlic butter, perfect over pasta.",
    cookTime: "25 mins",
    portion: "2 servings",
    difficulty: "Medium",
    image: "",
  },
  {
    name: "Mushroom Risotto",
    description: "Creamy risotto with sautéed mushrooms and cheese.",
    cookTime: "35 mins",
    portion: "3 servings",
    difficulty: "Hard",
    image: "",
  },
  {
    name: "Grilled Cheese Sandwich",
    description: "Melted cheese on crispy toasted bread.",
    cookTime: "10 mins",
    portion: "1 serving",
    difficulty: "Easy",
    image: "",
  },
  {
    name: "Spaghetti Carbonara",
    description: "Classic pasta dish with egg, cheese, and pancetta.",
    cookTime: "20 mins",
    portion: "2 servings",
    difficulty: "Medium",
    image: "",
  },
  {
    name: "Chicken Tikka Masala",
    description: "Tender chicken in a spiced creamy tomato sauce.",
    cookTime: "30 mins",
    portion: "4 servings",
    difficulty: "Hard",
    image: "",
  },
  // Additional items to reach 10
  {
    name: "Beef Bourguignon",
    description: "A hearty French stew with tender beef simmered in red wine.",
    cookTime: "2 hrs",
    portion: "4 servings",
    difficulty: "Hard",
    image: "",
  },
  {
    name: "Caesar Salad",
    description: "Crisp romaine with creamy Caesar dressing and croutons.",
    cookTime: "15 mins",
    portion: "2 servings",
    difficulty: "Easy",
    image: "",
  },
  {
    name: "Veggie Burger",
    description: "A delicious alternative to beef burgers with a blend of vegetables.",
    cookTime: "20 mins",
    portion: "1 serving",
    difficulty: "Medium",
    image: "",
  },
  {
    name: "Pad Thai",
    description: "Traditional Thai stir-fried noodles with shrimp, tofu, and peanuts.",
    cookTime: "30 mins",
    portion: "2 servings",
    difficulty: "Medium",
    image: "",
  },
  {
    name: "Chocolate Lava Cake",
    description: "A warm cake with a gooey, melted chocolate center.",
    cookTime: "25 mins",
    portion: "1 serving",
    difficulty: "Hard",
    image: "",
  },
];

const flavorTags = [

  // Basic tastes
  "sweet", "sour", "salty", "bitter", "umami", "acidic", "pungent", "astringent", "metallic",

  // Spice-derived flavors (adjusted to descriptors)
  "cinnamony", "nutmeggy", "gingery", "peppery", "clovey", "cardamomy", "cuminy", "coriandery",
  "saffrony", "turmericy", , "fennelly", "carawayish",

  // Herb-derived flavors
  "thymey", "rosemary", "sagey", "marjoramy", "basilic", "tarragon", "dilly", "chervily",
  "oregano", "lavender", "chamomile", "jasminy", "herbaceous", "mentholated", "camphor",


  // Citrus and fruity flavors
  "lemony", "limey", "citrusy", "yuzu", "bergamot", "mandarin", "tamarind", "tropical", "fruity",

  // Fermented and umami flavors
  "fermented", "miso", "shoyu", "fishy", "mushroomy", "truffley", "yeasty", "kelpy", "nori",
  "sulfurous", "garumy", "worcester",

  // Roasted and smoky flavors
  "smoky", "charred", "roasted", "toasty", "caramel", "hickory", "mesquite", "burnt",

  // Sweet and aromatic flavors
  "vanillery", "honeyed", "cocoa", "mocha", "licorice", "floral", "rose", "elderflower",
  "hibiscus", "tonka", "sassafras", "aromatic", "fragrant",

  // Earthy and vegetal flavors
  "earthy", "grassy", "piney", "woody", "resinous", "mossy", "minerally", "vegetal", "marine",

  // Other taste qualities
  "tart", "tangy", "spicy", "sharp", "mellow", "robust", "delicate", "complex", "ethereal",
  "numbing", "cooling", "warming", "tingling", "acrid", "briny", "savory", "rich", "buttery",
  "creamy", "cheesy", "nutty", "milky", "oily", "vinegary", "zesty", "wasabi", "mustardy",

  // Unique or modern flavor notes
  "medicinal", "alkaline", "oceanic", "petrichor", "maltol", "glutamate", "skunky", "funky",
  "rancid", "moldy", "musky", "rusty",
  // Sweet-based combinations
  "Sweet and Floral", "Sweet and Smoky", "Sweet and Spicy", "Sweet and Tart",
  "Sweet and Salty", "Sweet and Nutty", "Sweet and Herbal", "Sweet and Citrusy",
  "Sweet and Creamy", "Sweet and Bitter", "Sweet and Umami", "Sweet and Roasted",
  "Sweet and Tropical", "Sweet and Berry", "Sweet and Fermented", "Sweet and Honeyed",
  "Sweet and Cinnamony", "Sweet and Caramel", "Sweet and Fruity", "Sweet and Zesty",

  // Savory-based combinations
  "Savory and Herbal", "Savory and Spicy", "Savory and Sweet", "Savory and Smoky",
  "Savory and Rich", "Savory and Tangy", "Savory and Earthy", "Savory and Citrusy",
  "Savory and Nutty", "Savory and Fermented", "Savory and Pungent", "Savory and Umami",
  "Savory and Mineral", "Savory and Woody", "Savory and Roasted", "Savory and Briny",
  "Savory and Garlicky", "Savory and Meaty",

  // Spicy-based combinations
  "Spicy and Sweet", "Spicy and Sour", "Spicy and Tangy", "Spicy and Nutty",
  "Spicy and Citrusy", "Spicy and Umami", "Spicy and Smoky", "Spicy and Fresh",
  "Spicy and Fermented", "Spicy and Fruity", "Spicy and Herbaceous", "Spicy and Warm",
  "Spicy and Peppery", "Spicy and Gingery", "Spicy and Harissay", "Spicy and Zesty",

  // Fresh/Bright combinations
  "Fresh and Herbal", "Fresh and Citrusy", "Fresh and Minty", "Fresh and Green",
  "Fresh and Floral", "Fresh and Fruity", "Fresh and Spicy", "Fresh and Crisp",
  "Fresh and Marine", "Fresh and Grassy", "Fresh and Cooling", "Fresh and Bright",
  "Fresh and Lemony", "Fresh and Tropical", "Fresh and Vegetal",

  // Earthy combinations
  "Earthy and Warm", "Earthy and Spicy", "Earthy and Rich", "Earthy and Nutty",
  "Earthy and Umami", "Earthy and Mineral", "Earthy and Roasted", "Earthy and Mushroomy",
  "Earthy and Herbal", "Earthy and Woody", "Earthy and Smoky", "Earthy and Resinous",
  "Earthy and Mossy", "Earthy and Funky", "Earthy and Truffley",

  // Nutty combinations
  "Nutty and Warm", "Nutty and Sweet", "Nutty and Spicy", "Nutty and Roasted",
  "Nutty and Chocolate", "Nutty and Caramel", "Nutty and Coffee", "Nutty and Buttery",
  "Nutty and Earthy", "Nutty and Rich", "Nutty and Toasty", "Nutty and Creamy",
  "Nutty and Savory",

  // Citrus combinations
  "Citrusy and Bright", "Citrusy and Spicy", "Citrusy and Floral", "Citrusy and Sweet",
  "Citrusy and Herbal", "Citrusy and Bitter", "Citrusy and Fresh", "Citrusy and Tangy",
  "Citrusy and Marine", "Citrusy and Zesty", "Citrusy and Cooling", "Citrusy and Fruity",
  "Citrusy and Astringent",

  // Creamy combinations
  "Creamy and Sweet", "Creamy and Tart", "Creamy and Spicy", "Creamy and Fruity",
  "Creamy and Nutty", "Creamy and Rich", "Creamy and Chocolate", "Creamy and Coffee",
  "Creamy and Vanilla", "Creamy and Caramel", "Creamy and Buttery", "Creamy and Milky",
  "Creamy and Savory", "Creamy and Floral",

  // Smoky combinations
  "Smoky and Sweet", "Smoky and Spicy", "Smoky and Rich", "Smoky and Earthy",
  "Smoky and Meaty", "Smoky and Tangy", "Smoky and Roasted", "Smoky and Chocolate",
  "Smoky and Coffee", "Smoky and Savory", "Smoky and Woody", "Smoky and Charred",
  "Smoky and Umami",

  // Rich/Deep combinations
  "Rich and Chocolate", "Rich and Coffee", "Rich and Caramel", "Rich and Spicy",
  "Rich and Fruity", "Rich and Nutty", "Rich and Roasted", "Rich and Umami",
  "Rich and Wine", "Rich and Smoky", "Rich and Creamy", "Rich and Earthy",
  "Rich and Mocha", "Rich and Robust",

  // Herbal combinations
  "Herbal and Fresh", "Herbal and Citrusy", "Herbal and Spicy", "Herbal and Floral",
  "Herbal and Green", "Herbal and Earthy", "Herbal and Marine", "Herbal and Minty",
  "Herbal and Woody", "Herbal and Savory", "Herbal and Tangy", "Herbal and Aromatic",
  "Herbal and Thymey",

  // Roasted combinations
  "Roasted and Sweet", "Roasted and Nutty", "Roasted and Spicy", "Roasted and Rich",
  "Roasted and Coffee", "Roasted and Chocolate", "Roasted and Caramel", "Roasted and Smoky",
  "Roasted and Earthy", "Roasted and Toasty", "Roasted and Warm", "Roasted and Savory",

  // Fermented combinations
  "Fermented and Spicy", "Fermented and Umami", "Fermented and Sour", "Fermented and Tangy",
  "Fermented and Funky", "Fermented and Earthy", "Fermented and Salty", "Fermented and Complex",
  "Fermented and Pungent", "Fermented and Skunky", "Fermented and Rich", "Fermented and Savory",

  // Umami combinations
  "Umami and Rich", "Umami and Earthy", "Umami and Smoky", "Umami and Fermented",
  "Umami and Salty", "Umami and Meaty", "Umami and Mushroom", "Umami and Marine",
  "Umami and Savory", "Umami and Nutty", "Umami and Briny", "Umami and Warm",

  // Temperature-based combinations
  "Warm and Spicy", "Warm and Sweet", "Warm and Nutty", "Warm and Rich",
  "Cool and Fresh", "Cool and Minty", "Cool and Herbal", "Cool and Citrusy",
  "Warm and Earthy", "Warm and Roasted", "Cool and Floral", "Warm and Aromatic",
  "Cool and Tangy",

];


export { homeBannerData, cuisineCategoryData, recipeCardBig, categorySliderData, flavorTags };

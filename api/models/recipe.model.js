import mongoose from 'mongoose';

// Define the Recipe Schema
const recipeSchema = new mongoose.Schema(
  {
    // Basic Recipe Information
    recipeName: { type: String },
    description: { type: String },
    diet: { type: String },
    chefName: { type: String },
    shortDescription: { type: String },

    // Time and Serving Details
    prepTime: { type: Number, default: 5 }, // Preparation time in minutes
    cookTime: { type: Number, default: 5 }, // Cooking time in minutes
    servings: { type: Number, default: 2 }, // Number of servings
    difficulty: { type: String, default: "Easy" }, // Difficulty level

    // Ingredients
    ingredients: [
      {
        name: { type: String }, // Ingredient name
        quantity: { type: String }, // Quantity of the ingredient
      },
    ],

    // Tags (References to RecipeTag model)
    cuisineTag: [
      {
        tagId: { type: mongoose.Schema.Types.ObjectId, ref: 'RecipeTag' }, // Reference to RecipeTag
        tagName: { type: String, default: "Unknown" }, // Default to "Unknown" if tagName is missing
      },
    ],
    flavourTag: [
      {
        tagId: { type: mongoose.Schema.Types.ObjectId, ref: 'RecipeTag' },
        tagName: { type: String, default: "Unknown" },
      },
    ],
    ingredientTag: [
      {
        tagId: { type: mongoose.Schema.Types.ObjectId, ref: 'RecipeTag' },
        tagName: { type: String, default: "Unknown" },
      },
    ],

    // Images and Media
    imageUrls: { type: [String] }, // Array of image URLs
    videoUrl: { type: String }, // Video URL
    bannerImgUrl: { type: String }, // Banner image URL
    favImgUrl: { type: String }, // Favorite image URL

    // Nutritional Information
    nutritionalInfo: { type: mongoose.Schema.Types.Mixed }, // Flexible structure for nutritional data

    // Instructions
    cookInstructions: { type: String }, // Cooking instructions
    prepInstructions: { type: String }, // Preparation instructions

    // User and Interaction Data
    userRef: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to the user who created the recipe
    rating: { type: Number }, // Average rating
    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to the user who left the review
        rating: { type: Number }, // Rating given by the user
        comment: { type: String }, // Review comment
      },
    ],
    recipeFav: { type: Number, default: 0 }, // Number of times the recipe is favorited
    recipeViews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Users who viewed the recipe
      },
    ],

    // Categorization
    mealCourse: { type: [String] }, // E.g., Appetizer, Main Course
    mealType: { type: [String] }, // E.g., Lunch, Dinner, Breakfast
    cookingMethod: { type: [String] }, // E.g., Baking, Frying
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Create and Export the Recipe Model
const Recipe = mongoose.model('Recipe', recipeSchema);
export default Recipe;

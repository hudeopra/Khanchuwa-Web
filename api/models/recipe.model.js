import mongoose from 'mongoose';

const recipeSchema = new mongoose.Schema({
  recipeName: { type: String },
  description: { type: String },
  diet: { type: String },
  ingredients: [{
    name: { type: String },
    quantity: { type: String }
  }],
  prepTime: { type: Number, default: 5 },
  cookTime: { type: Number },
  servings: { type: Number },
  difficulty: { type: String },
  chefName: { type: String },
  cuisineTag: [{
    tagId: { type: mongoose.Schema.Types.ObjectId, ref: 'RecipeTag' },
    tagName: { type: String, default: "Unknown" } // Default to "Unknown" if tagName is missing
  }],
  imageUrls: { type: [String] },
  flavourTag: [{
    tagId: { type: mongoose.Schema.Types.ObjectId, ref: 'RecipeTag' },
    tagName: { type: String, default: "Unknown" } // Default to "Unknown" if tagName is missing
  }],
  videoUrl: { type: String },
  bannerImgUrl: { type: String },
  favImgUrl: { type: String },
  userRef: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  shortDescription: { type: String },
  nutritionalInfo: { type: mongoose.Schema.Types.Mixed },
  cookInstructions: { type: String },
  prepInstructions: { type: String },
  ingredientTag: [{
    tagId: { type: mongoose.Schema.Types.ObjectId, ref: 'RecipeTag' },
    tagName: { type: String, default: "Unknown" } // Default to "Unknown" if tagName is missing
  }],
  equipmentTag: [{
    tagId: { type: mongoose.Schema.Types.ObjectId, ref: 'RecipeTag' },
    tagName: { type: String, default: "Unknown" } // Default to "Unknown" if tagName is missing
  }],
  rating: { type: Number },
  reviews: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      rating: { type: Number },
      comment: { type: String }
    }
  ],
  mealCourse: { type: String },
  mealType: { type: [String] },  // UPDATED: Now an array of meal types (e.g., Appetizer, Main Course, Dessert, Snack, Beverage, Lunch, Dinner, Breakfast)
  cookingMethod: { type: [String] }, // remains an array; UI updated to include +1 option
  recipeFav: { type: Number, default: 0 }, // NEW: recipeFav counter
  recipeViews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }]
}, {
  timestamps: true,
});

const Recipe = mongoose.model('Recipe', recipeSchema);
export default Recipe;

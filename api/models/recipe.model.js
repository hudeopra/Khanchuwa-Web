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
  cuisineTag: [{ type: mongoose.Schema.Types.ObjectId, ref: 'RecipeTag' }],
  imageUrls: { type: [String] },
  flavourTag: [{ type: mongoose.Schema.Types.ObjectId, ref: 'RecipeTag' }],
  videoUrl: { type: String },
  bannerImgUrl: { type: String },
  favImgUrl: { type: String },
  userRef: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  shortDescription: { type: String },
  nutritionalInfo: { type: mongoose.Schema.Types.Mixed },
  cookInstructions: { type: String },
  prepInstructions: { type: String },
  ingredientTag: [{ type: mongoose.Schema.Types.ObjectId, ref: 'RecipeTag' }],
  equipmentTag: [{ type: mongoose.Schema.Types.ObjectId, ref: 'RecipeTag' }],
  rating: { type: Number },
  reviews: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      rating: { type: Number },
      comment: { type: String }
    }
  ],
  mealType: { type: [String] }, // UPDATED: Now an array of meal types (e.g., Appetizer, Main Course, Dessert, Snack, Beverage, Lunch, Dinner, Breakfast)
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

import mongoose from 'mongoose';

const recipeSchema = new mongoose.Schema({
  recipeName: { type: String, required: true },
  description: { type: String, required: true },
  diet: { type: String, required: true },
  ingredients: [{
    name: { type: String, required: true },
    quantity: { type: String, required: true }
  }],
  prepTime: { type: Number, required: true },
  cookTime: { type: Number, required: true },
  servings: { type: Number, required: true },
  difficulty: { type: String, required: true },
  chefName: { type: String, required: true },
  // Updated: references now point to RecipeTag for all tag types
  cuisineTag: [{ type: mongoose.Schema.Types.ObjectId, ref: 'RecipeTag', required: true }],
  imageUrls: { type: [String], required: true },
  flavourTag: [{ type: mongoose.Schema.Types.ObjectId, ref: 'RecipeTag', required: true }],
  videoUrl: { type: String },
  bannerImgUrl: { type: String, required: true },
  favImgUrl: { type: String, required: true },
  userRef: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shortDescription: { type: String },
  nutritionalInfo: { type: mongoose.Schema.Types.Mixed },
  cookInstructions: { type: [String] },
  prepInstructions: { type: [String] },
  tags: { type: [String] },
  ingredientTag: [{ type: mongoose.Schema.Types.ObjectId, ref: 'RecipeTag', required: true }],
  rating: { type: Number },
  reviews: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      rating: { type: Number },
      comment: { type: String }
    }
  ]
}, {
  timestamps: true,
});

const Recipe = mongoose.model('Recipe', recipeSchema);
export default Recipe;

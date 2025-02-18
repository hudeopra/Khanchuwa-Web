import mongoose from 'mongoose';

const recipeSchema = new mongoose.Schema({
  recipeName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  diet: {
    type: String,
    required: true,
  },
  ingredients: {
    type: String,
    required: true,
  },
  prepTime: {
    type: String,
    required: true,
  },
  cookTime: {
    type: String,
    required: true,
  },
  servings: {
    type: Number,
    required: true,
  },
  difficulty: {
    type: String,
    required: true,
  },
  chefName: {
    type: String,
    required: true,
  },
  recipeTester: {
    type: String,
    required: true,
  },
  cuisine: {
    type: String,
    required: true,
  },
  imageUrls: {
    type: [String],
    required: true,
  },
  recipeTags: {
    type: [String],
    required: true,
  },
  videoUrls: {
    type: [String],
    required: false,
  },
  userRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

const Recipe = mongoose.model('Recipe', recipeSchema);

export default Recipe;

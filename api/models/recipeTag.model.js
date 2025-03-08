import mongoose from 'mongoose';

const recipeTagSchema = new mongoose.Schema({
  tagType: {
    type: String,
    required: true,
    enum: ['flavourTag', 'cuisineTag', 'ingredientTag']
  },
  name: { type: String, required: true, unique: true }
}, { timestamps: true });

const RecipeTag = mongoose.model('RecipeTag', recipeTagSchema, 'recipetags');

export default RecipeTag;

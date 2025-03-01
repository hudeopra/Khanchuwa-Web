import mongoose from 'mongoose';

const recipeSchema = new mongoose.Schema({
  recipeName: { type: String, required: true },
  description: { type: String, required: true },
  diet: { type: String, required: true },
  // Updated ingredients field:
  ingredients: [{
    name: { type: String, required: true },
    quantity: { type: String, required: true }
  }],
  prepTime: { type: Number, required: true },
  cookTime: { type: Number, required: true },
  servings: { type: Number, required: true },
  difficulty: { type: String, required: true },
  chefName: { type: String, required: true },
  cuisines: { type: [String], required: true },
  imageUrls: { type: [String], required: true },
  flavourTags: { type: [String], required: true },
  videoUrl: { type: String, required: false },
  bannerImgUrl: { type: String, required: true },
  favImgUrl: { type: String, required: true },
  userRef: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // new attributes below
  shortDescription: { type: String },
  nutritionalInfo: { type: mongoose.Schema.Types.Mixed },
  cookInstructions: { type: [String] },
  prepInstructions: { type: [String] },
  tags: { type: [String] },
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

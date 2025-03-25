import mongoose from 'mongoose';

const shopSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  images: { type: [String] },
  category: { type: String },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
  reviews: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      rating: { type: Number },
      comment: { type: String }
    }
  ],
  cuisineTag: [{ type: mongoose.Schema.Types.ObjectId, ref: 'RecipeTag' }],
  flavourTag: [{ type: mongoose.Schema.Types.ObjectId, ref: 'RecipeTag' }],
  ingredientTag: [{ type: mongoose.Schema.Types.ObjectId, ref: 'RecipeTag' }],
  equipmentTag: [{ type: mongoose.Schema.Types.ObjectId, ref: 'RecipeTag' }],
}, {
  timestamps: true,
});

const Shop = mongoose.model('Shop', shopSchema);
export default Shop;
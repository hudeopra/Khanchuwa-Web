import mongoose from 'mongoose';

const shopSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  images: { type: [String] },
  category: { type: String },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  rating: { type: Number, default: 0 },
  reviews: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      rating: { type: Number, required: true },
      comment: { type: String }
    }
  ],
  productViews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, {
  timestamps: true,
});

const Shop = mongoose.model('Shop', shopSchema);
export default Shop;

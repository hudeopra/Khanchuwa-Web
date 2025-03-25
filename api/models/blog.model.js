import mongoose from 'mongoose';
const Schema = mongoose.Schema;

// Create a blog schema
const blogSchema = new Schema({
  blogtitle: {
    type: String,
    required: true,
  },
  shortDescription: { type: String },
  blogquote: {
    type: String,
  },
  author: {
    type: String,
    required: true,
  },
  blogtype: {
    type: String,
    required: true,
    default: "Blog",
  },
  bannerImgUrl: {
    type: String,
    // required: true,
  },
  favImgUrl: {
    type: String,
    // required: true,
  },
  cuisineTag: [{ type: mongoose.Schema.Types.ObjectId, ref: 'RecipeTag' }],
  flavourTag: [{ type: mongoose.Schema.Types.ObjectId, ref: 'RecipeTag' }],
  ingredientTag: [{ type: mongoose.Schema.Types.ObjectId, ref: 'RecipeTag' }],
  equipmentTag: [{ type: mongoose.Schema.Types.ObjectId, ref: 'RecipeTag' }],
  userRef: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  recipeFav: { type: Number, default: 0 }, // NEW: recipeFav counter
  reviews: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      rating: { type: Number },
      comment: { type: String }
    }
  ],
  blogBody: {
    type: String,
    required: true, // This field will contain the rich text content of the blog
  },
}, {
  timestamps: true,
});

// Create a model based on the schema
const Blog = mongoose.model('Blog', blogSchema);

export default Blog;

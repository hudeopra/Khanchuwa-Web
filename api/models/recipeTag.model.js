import mongoose from 'mongoose';

const recipeTagSchema = new mongoose.Schema({
  tagType: {
    type: String,
    required: true,
    enum: [
      'flavourTag',
      'cuisineTag',
      'ingredientTag',
      'equipmentTag',
    ]
  },
  name: { type: String, required: true, unique: true },
  usedIn: {                 // tracks usage in recipes, blogs, and products
    recipe: { type: Number, default: 0 },
    blog: { type: Number, default: 0 },
    product: { type: Number, default: 0 } // NEW: Tracks usage in products
  },
  recipeRefs: {             // stores all recipe IDs where the tag is used
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Recipe',
    default: []
  },
  blogRefs: {               // stores all blog IDs where the tag is used
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Blog',
    default: []
  },
  productRefs: {            // NEW: stores all product IDs where the tag is used
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Shop',
    default: []
  },
  productLink: {            // stores product link
    type: String,
    default: ''
  }
}, { timestamps: true });

// New instance methods to update recipeRefs and usedIn count
recipeTagSchema.methods.addRecipeReference = async function (recipeId) {
  if (!this.recipeRefs.some(id => id.toString() === recipeId.toString())) {
    this.recipeRefs.push(recipeId);
    this.usedIn.recipe = this.recipeRefs.length;
    await this.save();
  }
};

recipeTagSchema.methods.removeRecipeReference = async function (recipeId) {
  if (this.recipeRefs.some(id => id.toString() === recipeId.toString())) {
    this.recipeRefs = this.recipeRefs.filter(id => id.toString() !== recipeId.toString());
    this.usedIn.recipe = this.recipeRefs.length;
    await this.save();
  }
};

// New instance methods to update blogRefs and usedIn count
recipeTagSchema.methods.addBlogReference = async function (blogId) {
  if (!this.blogRefs.some(id => id.toString() === blogId.toString())) {
    this.blogRefs.push(blogId);
    this.usedIn.blog = this.blogRefs.length;
    await this.save();
  }
};

recipeTagSchema.methods.removeBlogReference = async function (blogId) {
  if (this.blogRefs.some(id => id.toString() === blogId.toString())) {
    this.blogRefs = this.blogRefs.filter(id => id.toString() !== blogId.toString());
    this.usedIn.blog = this.blogRefs.length;
    await this.save();
  }
};

// New instance methods to update productRefs and usedIn count
recipeTagSchema.methods.addProductReference = async function (productId) {
  console.log('addProductReference called for tag:', this.name, 'with productId:', productId);
  if (!this.productRefs.some(id => id.toString() === productId.toString())) {
    this.productRefs.push(productId);
    this.usedIn.product = this.productRefs.length;
    console.log('Updated productRefs for tag:', this.name, this.productRefs);
    await this.save();
  } else {
    console.log('Product already referenced for tag:', this.name);
  }
};

recipeTagSchema.methods.removeProductReference = async function (productId) {
  console.log('removeProductReference called for tag:', this.name, 'with productId:', productId);
  if (this.productRefs.some(id => id.toString() === productId.toString())) {
    this.productRefs = this.productRefs.filter(id => id.toString() !== productId.toString());
    this.usedIn.product = this.productRefs.length;
    console.log('Updated productRefs after removal:', this.productRefs);
    await this.save();
  } else {
    console.log('Product reference not found for tag:', this.name);
  }
};

const RecipeTag = mongoose.model('RecipeTag', recipeTagSchema, 'recipetags');

export default RecipeTag;
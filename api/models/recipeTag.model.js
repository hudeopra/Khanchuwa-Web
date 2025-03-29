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


  // New: equipmentRefs field for equipment tags
  equipmentRefs: {            // stores all equipment IDs where the tag is used
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Equipment',         // adjust reference as needed
    default: []
  },
  favImg: {                 // favorite image for cuisine or flavor tags
    type: String,
    default: function () {
      return (this.tagType === 'cuisineTag' || this.tagType === 'flavourTag') ? '' : undefined;
    }
  },
  bannerImg: {              // banner image for cuisine or flavor tags
    type: String,
    default: function () {
      return (this.tagType === 'cuisineTag' || this.tagType === 'flavourTag') ? '' : undefined;
    }
  },
  mrkPrice: {               // market price for ingredient or equipment tags
    type: Number,
    default: function () {
      return (this.tagType === 'ingredientTag' || this.tagType === 'equipmentTag') ? 0 : undefined;
    }
  },
  stock: {                  // stock for ingredient or equipment tags
    type: Number,
    default: function () {
      return (this.tagType === 'ingredientTag' || this.tagType === 'equipmentTag') ? 0 : undefined;
    }
  },
  disPrice: {               // discounted price for ingredient or equipment tags
    type: Number,
    default: function () {
      return (this.tagType === 'ingredientTag' || this.tagType === 'equipmentTag') ? 0 : undefined;
    }
  },
  description: {            // description for ingredient or equipment tags
    type: String,
    default: function () {
      return (this.tagType === 'ingredientTag' || this.tagType === 'equipmentTag') ? '' : undefined;
    }
  },
  productLink: {            // description for ingredient or equipment tags
    type: String,
    default: function () {
      return (this.tagType === 'ingredientTag' || this.tagType === 'equipmentTag') ? '' : undefined;
    }
  },
  category: {               // category for ingredient or equipment tags
    type: [String],
    default: function () {
      return (this.tagType === 'ingredientTag' || this.tagType === 'equipmentTag') ? [] : undefined;
    }
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



// New instance methods for equipmentRefs
recipeTagSchema.methods.addEquipmentReference = async function (equipmentId) {
  if (!this.equipmentRefs.some(id => id.toString() === equipmentId.toString())) {
    this.equipmentRefs.push(equipmentId);
    await this.save();
  }
};

recipeTagSchema.methods.removeEquipmentReference = async function (equipmentId) {
  if (this.equipmentRefs.some(id => id.toString() === equipmentId.toString())) {
    this.equipmentRefs = this.equipmentRefs.filter(id => id.toString() !== equipmentId.toString());
    await this.save();
  }
};

const RecipeTag = mongoose.model('RecipeTag', recipeTagSchema, 'recipetags');

export default RecipeTag;
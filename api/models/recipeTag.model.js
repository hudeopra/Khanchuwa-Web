import mongoose from 'mongoose';

// Global functions for default values
function defaultFavImg() {
  return (this.tagType === 'cuisineTag' || this.tagType === 'flavourTag') ? '' : undefined;
}

function defaultBannerImg() {
  return (this.tagType === 'cuisineTag' || this.tagType === 'flavourTag') ? '' : undefined;
}

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
    default: "https://ih1.redbubble.net/image.5473466329.4258/st,small,507x507-pad,600x600,f8f8f8.jpg"
  },
  bannerImg: {              // banner image for cuisine or flavor tags
    type: String,
    default: "https://www.reddit.com/media?url=https%3A%2F%2Fpreview.redd.it%2F16p5m5rpubp51.jpg%3Fauto%3Dwebp%26s%3D5c80b9087003f15d9f174cbb94def1419ef41a83"
  },
  inStock: {                  // stock for ingredient or equipment tags
    type: Number,
    default: function () {
      return (this.tagType === 'ingredientTag' || this.tagType === 'equipmentTag') ? false : undefined;
    }
  },
  quantity: {                  // stock for ingredient or equipment tags
    type: Number,
    default: function () {
      return (this.tagType === 'ingredientTag' || this.tagType === 'equipmentTag') ? 0 : undefined;
    }
  },
  mrkPrice: {               // market price for ingredient or equipment tags
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
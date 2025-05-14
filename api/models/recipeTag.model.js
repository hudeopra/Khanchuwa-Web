import mongoose from 'mongoose';

// Global functions for default values
function defaultFavImg() {
  return (this.tagType === 'cuisineTag' || this.tagType === 'flavourTag') ? '' : undefined;
}

function defaultBannerImg() {
  return (this.tagType === 'cuisineTag' || this.tagType === 'flavourTag') ? '' : undefined;
}

// Define the schema
const recipeTagSchema = new mongoose.Schema(
  {
    // Core fields
    tagType: {
      type: String,
      required: true,
      enum: ['flavourTag', 'cuisineTag', 'ingredientTag', 'equipmentTag'],
    },
    name: { type: String, required: true, unique: true },
    description: { type: String },

    // References
    recipeRefs: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Recipe',
      default: [],
    },
    blogRefs: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Blog',
      default: [],
    },

    // Images
    favImg: {
      type: String,
      default: "https://ih1.redbubble.net/image.5473466329.4258/st,small,507x507-pad,600x600,f8f8f8.jpg",
    },
    bannerImg: {
      type: String,
      default: "https://www.reddit.com/media?url=https%3A%2F%2Fpreview.redd.it%2F16p5m5rpubp51.jpg%3Fauto%3Dwebp%26s%3D5c80b9087003f15d9f174cbb94def1419ef41a83",
    },

    // Fields specific to ingredient/equipment tags
    inStock: {
      type: Number,
      default: function () {
        return (this.tagType === 'ingredientTag' || this.tagType === 'equipmentTag') ? false : undefined;
      },
    },
    quantity: {
      type: Number,
      default: function () {
        return (this.tagType === 'ingredientTag' || this.tagType === 'equipmentTag') ? 10 : undefined;
      },
    },
    mrkPrice: {
      type: Number,
      default: function () {
        return (this.tagType === 'ingredientTag' || this.tagType === 'equipmentTag') ? 120 : undefined;
      },
    },
    disPrice: {
      type: Number,
      default: function () {
        return (this.tagType === 'ingredientTag' || this.tagType === 'equipmentTag') ? 100 : undefined;
      },
    },
    category: {
      type: [String],
      default: function () {
        return (this.tagType === 'ingredientTag' || this.tagType === 'equipmentTag') ? [] : undefined;
      },
    },
    rating: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

// Instance methods for recipe references
recipeTagSchema.methods.addRecipeReference = async function (recipeId) {
  if (!this.recipeRefs.some((id) => id.toString() === recipeId.toString())) {
    this.recipeRefs.push(recipeId);
    await this.save();
  }
};

recipeTagSchema.methods.removeRecipeReference = async function (recipeId) {
  if (this.recipeRefs.some((id) => id.toString() === recipeId.toString())) {
    this.recipeRefs = this.recipeRefs.filter((id) => id.toString() !== recipeId.toString());
    await this.save();
  }
};

// Instance methods for blog references
recipeTagSchema.methods.addBlogReference = async function (blogId) {
  if (!this.blogRefs.some((id) => id.toString() === blogId.toString())) {
    this.blogRefs.push(blogId);
    await this.save();
  }
};

recipeTagSchema.methods.removeBlogReference = async function (blogId) {
  if (this.blogRefs.some((id) => id.toString() === blogId.toString())) {
    this.blogRefs = this.blogRefs.filter((id) => id.toString() !== blogId.toString());
    await this.save();
  }
};

// Instance methods for equipment references
recipeTagSchema.methods.addEquipmentReference = async function (equipmentId) {
  if (!this.equipmentRefs.some((id) => id.toString() === equipmentId.toString())) {
    this.equipmentRefs.push(equipmentId);
    await this.save();
  }
};

recipeTagSchema.methods.removeEquipmentReference = async function (equipmentId) {
  if (this.equipmentRefs.some((id) => id.toString() === equipmentId.toString())) {
    this.equipmentRefs = this.equipmentRefs.filter((id) => id.toString() !== equipmentId.toString());
    await this.save();
  }
};

// Create and export the model
const RecipeTag = mongoose.model('RecipeTag', recipeTagSchema, 'recipetags');
export default RecipeTag;
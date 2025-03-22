import mongoose from 'mongoose';

const recipeTagSchema = new mongoose.Schema({
  tagType: {
    type: String,
    required: true,
    enum: [
      'flavourTag',
      'cuisineTag',
      'ingredientTag',
      'mealType',         // new tag type for Meal Type
      'cookingMethod'     // new tag type for Cooking Method
    ]
  },
  name: { type: String, required: true, unique: true },
  usedIn: {                 // tracks usage in recipes and blogs
    recipe: { type: Number, default: 0 },
    blog: { type: Number, default: 0 }
  },
  recipeRefs: {             // new field to store all recipe ids where the tag is used
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Recipe',
    default: []
  }, // <-- added comma here
  blogRefs: {             // new field to store all blog ids where the tag is used
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Blog',
    default: []
  }
}, { timestamps: true });

// New instance methods to update recipeRefs and usedIn count
recipeTagSchema.methods.addRecipeReference = async function (recipeId) {
  // If the recipeId is not already associated with this tag, add it.
  if (!this.recipeRefs.some(id => id.toString() === recipeId.toString())) {
    this.recipeRefs.push(recipeId);
    this.usedIn.recipe = this.recipeRefs.length;
    await this.save();
  }
};

recipeTagSchema.methods.removeRecipeReference = async function (recipeId) {
  // Remove the recipeId if present and update the count.
  if (this.recipeRefs.some(id => id.toString() === recipeId.toString())) {
    this.recipeRefs = this.recipeRefs.filter(id => id.toString() !== recipeId.toString());
    this.usedIn.recipe = this.recipeRefs.length;
    await this.save();
  }
};
// New instance methods to update blogRefs and usedIn count
recipeTagSchema.methods.addBlogReference = async function (blogId) {
  // If the blogId is not already associated with this tag, add it.
  if (!this.blogRefs.some(id => id.toString() === blogId.toString())) {
    this.blogRefs.push(blogId);
    this.usedIn.blog = this.blogRefs.length;
    await this.save();
  }
};

recipeTagSchema.methods.removeBlogReference = async function (blogId) {
  // Remove the blogId if present and update the count.
  if (this.blogRefs.some(id => id.toString() === blogId.toString())) {
    this.blogRefs = this.blogRefs.filter(id => id.toString() !== blogId.toString());
    this.usedIn.blog = this.blogRefs.length;
    await this.save();
  }
};
const RecipeTag = mongoose.model('RecipeTag', recipeTagSchema, 'recipetags');

export default RecipeTag;

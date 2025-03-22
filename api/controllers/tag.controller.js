import RecipeTag from '../models/recipeTag.model.js';

// GET /api/tag/:type -> fetches tags by type, e.g. "flavourTag"
export const getTagsByType = async (req, res, next) => {
  try {
    const { type } = req.params; // Expecting a tag type in the URL
    const tags = await RecipeTag.find({ tagType: type });
    console.log(`Fetched tags of type ${type}:`, tags);
    res.status(200).json(tags);
  } catch (error) {
    next(error);
  }
};

// POST /api/tag -> creates a new tag (expects { tagType, name } in request body)
export const createTag = async (req, res, next) => {
  try {
    const { tagType, name } = req.body;
    let tag = await RecipeTag.findOne({ tagType, name });
    if (!tag) tag = await RecipeTag.create({ tagType, name });
    res.status(201).json(tag);
  } catch (error) {
    next(error);
  }
};

// New endpoint: PATCH /api/tag/addRecipeRef
export const addRecipeRef = async (req, res, next) => {
  try {
    const { tagId, recipeId } = req.body;
    const tag = await RecipeTag.findById(tagId);
    if (!tag) return res.status(404).json({ message: 'Tag not found' });
    await tag.addRecipeReference(recipeId);
    res.status(200).json(tag);
  } catch (error) {
    next(error);
  }
};

// New endpoint: PATCH /api/tag/removeRecipeRef
export const removeRecipeRef = async (req, res, next) => {
  try {
    const { tagId, recipeId } = req.body;
    const tag = await RecipeTag.findById(tagId);
    if (!tag) return res.status(404).json({ message: 'Tag not found' });
    await tag.removeRecipeReference(recipeId);
    res.status(200).json(tag);
  } catch (error) {
    next(error);
  }
};

// New endpoint: PATCH /api/tag/addBlogRef
export const addBlogRef = async (req, res, next) => {
  try {
    const { tagId, blogId } = req.body;
    const tag = await RecipeTag.findById(tagId);
    if (!tag) return res.status(404).json({ message: 'Tag not found' });
    await tag.addBlogReference(blogId);
    res.status(200).json(tag);
  } catch (error) {
    next(error);
  }
};

// New endpoint: PATCH /api/tag/removeBlogRef
export const removeBlogRef = async (req, res, next) => {
  try {
    const { tagId, blogId } = req.body;
    const tag = await RecipeTag.findById(tagId);
    if (!tag) return res.status(404).json({ message: 'Tag not found' });
    await tag.removeBlogReference(blogId);
    res.status(200).json(tag);
  } catch (error) {
    next(error);
  }
};



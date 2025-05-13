import RecipeTag from '../models/recipeTag.model.js';

// GET /api/tag/:type -> fetches tags by type, e.g. "flavourTag"
export const getTagsByType = async (req, res, next) => {
  try {
    const { type } = req.params; // Expecting a tag type in the URL
    const filter = { tagType: type };



    const tags = await RecipeTag.find(filter);
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

// New endpoint: GET /api/tag -> fetches all tags
export const getAllTags = async (req, res, next) => {
  try {
    const tags = await RecipeTag.find({});
    res.status(200).json(tags);
  } catch (error) {
    next(error);
  }
};

// New endpoint: PATCH /api/tag/update/:id
export const updateTag = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Convert _id to a valid ObjectId if it exists in the request body
    if (updateData._id && updateData._id.$oid) {
      updateData._id = new mongoose.Types.ObjectId(updateData._id.$oid);
    }

    // Convert recipeRefs array to valid ObjectId instances if necessary
    if (Array.isArray(updateData.recipeRefs)) {
      updateData.recipeRefs = updateData.recipeRefs.map(ref =>
        ref.$oid ? new mongoose.Types.ObjectId(ref.$oid) : ref
      );
    }

    // Similarly, handle other fields like blogRefs,  etc., if needed
    if (Array.isArray(updateData.blogRefs)) {
      updateData.blogRefs = updateData.blogRefs.map(ref =>
        ref.$oid ? new mongoose.Types.ObjectId(ref.$oid) : ref
      );
    }

    const updatedTag = await RecipeTag.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedTag) return res.status(404).json({ message: 'Tag not found' });
    res.status(200).json(updatedTag);
  } catch (error) {
    next(error);
  }
};

// New endpoint: GET /api/tag/:type/:id -> fetches a tag by tagType and TagObjID
export const getTagByTypeAndId = async (req, res, next) => {
  try {
    const { id } = req.params; // Extract TagObjID from URL
    const tag = await RecipeTag.findById(id); // Fetch tag by ID
    if (!tag) return res.status(404).json({ message: 'Tag not found' });
    res.status(200).json(tag);
  } catch (error) {
    next(error);
  }
};

// New endpoint: GET /api/tag/ingredients/inStock -> fetches all ingredient tags with inStock = 1
export const getInStockIngredients = async (req, res, next) => {
  try {
    const filter = { tagType: 'ingredientTag', inStock: 1 };
    const tags = await RecipeTag.find(filter);
    res.status(200).json(tags);
  } catch (error) {
    next(error);
  }
};

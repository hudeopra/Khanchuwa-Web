import Blog from '../models/blog.model.js';

export const createBlog = async (req, res, next) => {
  try {
    const blog = await Blog.create(req.body);
    return res.status(201).json(blog);
  } catch (error) {
    next(error);
  }
};

export const updateBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    return res.status(200).json(blog);
  } catch (error) {
    next(error);
  }
};

export const addComment = async (req, res, next) => {
  try {
    const { userId, rating, comment } = req.body;
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    // Ensure reviews is an array (similar to recipe logic)
    if (!blog.reviews || !Array.isArray(blog.reviews)) {
      blog.reviews = [];
    }
    blog.reviews.push({ user: userId, rating, comment });
    await blog.save();
    return res.status(200).json({ reviews: blog.reviews });
  } catch (error) {
    next(error);
  }
};

export const deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    await blog.deleteOne();
    return res.status(200).json({ message: 'Blog deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getAllBlogs = async (req, res, next) => {
  try {
    const blogs = await Blog.find();
    return res.status(200).json(blogs);
  } catch (error) {
    next(error);
  }
};

export const filterBlogs = async (req, res, next) => {
  try {
    const { blogtitle, author, searchTerm } = req.query;
    let filter = {};

    if (blogtitle) {
      filter.blogtitle = new RegExp(blogtitle, "i");
    }
    if (author) {
      filter.author = new RegExp(author, "i");
    }
    if (searchTerm) {
      const words = searchTerm.toLowerCase().split(/\s+/).filter(Boolean);
      filter.$and = words.map(word => ({
        $or: [
          { blogtitle: new RegExp(word, "i") },
          { content: new RegExp(word, "i") },
          { author: new RegExp(word, "i") },
        ]
      }));
    }

    const blogs = await Blog.find(filter);
    return res.status(200).json(blogs);
  } catch (error) {
    next(error);
  }
};

export const getBlogById = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate("cuisineTag")
      .populate("flavourTag");
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    // If a user is provided (when available), record a view (similar to recipes)
    if (req.user) {
      if (!blog.views || !Array.isArray(blog.views)) {
        blog.views = [];
      }
      if (!blog.views.some(id => id.equals(req.user.id))) {
        blog.views.push(req.user.id);
        await blog.save();
      }
    }
    return res.status(200).json(blog);
  } catch (error) {
    next(error);
  }
};

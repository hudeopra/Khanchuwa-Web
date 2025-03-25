/**
 * @route POST /create
 * @description Create a new blog. Requires user authentication.
 * @access Private
 */

/**
 * @route PUT /:id
 * @description Update an existing blog by its ID. Requires user authentication.
 * @access Private
 */

/**
 * @route POST /comment/:id
 * @description Add a comment to a blog by its ID. Publicly accessible.
 * @access Public
 */

/**
 * @route DELETE /delete/:id
 * @description Delete a blog by its ID. Requires user authentication.
 * @access Private
 */

/**
 * @route GET /all
 * @description Retrieve all blogs. Publicly accessible.
 * @access Public
 */

/**
 * @route GET /filter
 * @description Retrieve blogs based on specific filter criteria. Publicly accessible.
 * @access Public
 */

/**
 * @route GET /:id
 * @description Retrieve a specific blog by its ID. Publicly accessible.
 * @access Public
 */

/**
 * @route GET /user/:userId
 * @description Retrieve blogs written by a specific user. Publicly accessible.
 * @access Public
 */
import express from 'express';
import { createBlog, getAllBlogs, getBlogById, updateBlog, addComment, deleteBlog, filterBlogs, getBlogsByUser } from '../controllers/blog.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.post('/create', verifyToken, createBlog);
router.put('/:id', verifyToken, updateBlog);
router.post('/comment/:id', addComment); // removed verifyToken so any user can comment
router.delete('/delete/:id', verifyToken, deleteBlog);
router.get('/all', getAllBlogs);
router.get('/filter', filterBlogs);
router.get('/:id', getBlogById);
router.get('/user/:userId', getBlogsByUser);

export default router;
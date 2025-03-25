import Shop from '../models/shop.model.js';
import User from '../models/user.model.js';
import mongoose from 'mongoose';

// Create a shop using properly formatted data from the client.
export const createShop = async (req, res, next) => {
  try {
    // Validate seller id
    if (req.body.seller && !mongoose.Types.ObjectId.isValid(req.body.seller)) {
      return res.status(400).json({ message: 'Invalid seller id' });
    }
    const shop = await Shop.create(req.body);
    return res.status(201).json(shop);
  } catch (error) {
    next(error);
  }
};

// Update a shop with new data from the client.
export const updateShop = async (req, res, next) => {
  try {
    const shop = await Shop.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    return res.status(200).json(shop);
  } catch (error) {
    next(error);
  }
};

export const getAllShops = async (req, res, next) => {
  try {
    const shops = await Shop.find();
    return res.status(200).json(shops);
  } catch (error) {
    next(error);
  }
};

export const getShopById = async (req, res, next) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }
    // Ensure shopViews is initialized as an array.
    if (!shop.shopViews || !Array.isArray(shop.shopViews)) {
      shop.shopViews = [];
    }
    if (req.user && !shop.shopViews.some(id => id.equals(req.user.id))) {
      shop.shopViews.push(req.user.id);
      await shop.save();
    }
    return res.status(200).json(shop);
  } catch (error) {
    next(error);
  }
};

export const addComment = async (req, res, next) => {
  try {
    const { userId, rating, comment } = req.body;
    const shop = await Shop.findById(req.params.id);
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    shop.reviews.push({ user: userId, rating, comment });
    await shop.save();
    return res.status(200).json({ reviews: shop.reviews });
  } catch (error) {
    next(error);
  }
};

export const deleteShop = async (req, res, next) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    await shop.deleteOne();
    return res.status(200).json({ message: 'Shop deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const filterShops = async (req, res, next) => {
  try {
    const { userId, category, rating, searchTerm } = req.query;
    let filter = {};

    if (userId) {
      filter.userRef = userId;
    }
    if (category) {
      const categories = category.split(",").map(tag => tag.trim());
      filter.category = { $in: categories };
    }
    if (rating) {
      filter.rating = rating;
    }
    if (searchTerm) {
      const words = searchTerm.toLowerCase().split(/\s+/).filter(Boolean);
      filter.$or = words.map(word => ({
        shopName: new RegExp(word, "i")
      }));
    }
    const shops = await Shop.find(filter);
    return res.status(200).json(shops);
  } catch (error) {
    next(error);
  }
};

export const getShopsByUser = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 0;
    // Change 'userRef' to 'seller' if shops are associated by seller.
    const shops = await Shop.find({ seller: req.params.userId }).limit(limit);
    return res.status(200).json({ success: true, shops });
  } catch (error) {
    next(error);
  }
};

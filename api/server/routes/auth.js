const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Assuming you have a User model

router.post('/google', async (req, res) => {
  try {
    const { name, email, photo } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({ name, email, photo });
      await user.save();
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error during Google authentication:", error);
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: error.message,
    });
  }
});

module.exports = router;

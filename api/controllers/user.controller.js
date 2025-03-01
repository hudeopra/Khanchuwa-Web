import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import { errorHandler } from '../utils/error.js';

export const test = (req, res) => {
  res.json({
    message: "api/user.controller: user.controller: World",
  });
};

// exporting to user.route.js
export const updateUserInfo = async (req, res, next) => {
  if (req.user.id !== req.params.id)
    return next(errorHandler(401, 'api/user.controller: you can only update your own account'));

  try {
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 12);
    }
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          avatar: req.body.avatar,
          fullname: req.body.fullname,
          dateOfBirth: req.body.dateOfBirth,
          gender: req.body.gender,
          emails: req.body.emails,
          phoneNumbers: req.body.phoneNumbers,
          addresses: req.body.addresses,
          socialMedia: req.body.socialMedia,
          preferences: {
            notifications: req.body.preferences.notifications,
            dietaryRestrictions: req.body.preferences.dietaryRestrictions,
            allergies: req.body.preferences.allergies,
            tastePreferences: req.body.preferences.tastePreferences,
            language: req.body.preferences.language,
          },
        },
      },
      { new: true }
    );

    const { password, ...rest } = updatedUser._doc; // remove password from the response
    res.status(200).json(rest);
  } catch (error) {
    next(errorHandler(500, 'api/user.controller: Internal Server Error'));
  }
};

export const deleteUser = async (req, res, next) => {
  if (req.user.id !== req.params.id)
    return next(errorHandler(401, 'You can only delete your own account!'));
  try {
    await User.findByIdAndDelete(req.params.id);
    res.clearCookie('access_token');
    res.status(200).json('User has been deleted!');
  } catch (error) {
    next(error);
  }
};

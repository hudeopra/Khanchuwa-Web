import User from '../models/user.model.js';
import bcryptjs from 'bcryptjs';

export const signup = async (req, res) => {
  // console.log("auth.controller: SIGNUP REQUEST DATA", req.body);

  const { username, email, password } = req.body;

  const hashedPassword = await bcryptjs.hash(password, 12);
  const newUser = new User({ username, email, password: hashedPassword });

  // Console for verification
  // console.log("auth.controller: NEW USER", newUser );
//  Output:{ username: 'test2',
//   email: 'test2@gmail.com',     
//   password: '$2a$12$BMHqYuAVfJHerJHosv9aWeHuf2hLDa1dAAGdXKM/qw4lf9FiSP7oS',
//   _id: new ObjectId('67729310683fcc57f909a773'),
//   createdAt: 2024-12-30T12:33:20.570Z,
//   updatedAt: 2024-12-30T12:33:20.570Z,
//   __v: 0
// }

  try {
    await newUser.save();
    res.status(201).json({ message: "auth.contoller: User created successfully" });
  } catch (error) {
    res.status(500).json({
        message: "auth.contoller: User creation failed", 
        error: error.message,
      });
  }
};



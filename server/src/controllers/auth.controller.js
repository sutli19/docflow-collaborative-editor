const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) return next(new AppError('Email and password are required', 400));

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) return next(new AppError('Invalid credentials', 401));

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) return next(new AppError('Invalid credentials', 401));

  const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });

  res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
});

module.exports = { login };
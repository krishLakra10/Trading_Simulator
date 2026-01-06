const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../Models/User');
const Portfolio = require('../Models/Portfolio');
const appError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.register = catchAsync(async (req, res,next) => {
  
    const { name, email, password, pan } = req.body;

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      throw new appError('Email already in use',400);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      passwordHash,
      pan
    });

    await Portfolio.create({
      userId: user._id,
      holdings: []
    });

    res.status(201).json({ message: 'User registered successfully' });
  
});


exports.login = catchAsync(async (req, res ,next) => {
  
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      throw new appError('Invalid credentials',401);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new appError('Invalid credentials',401);
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token });
  
});

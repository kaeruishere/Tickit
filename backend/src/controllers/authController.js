const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { setAuthCookies, clearAuthCookies } = require('../utils/authCookies');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const user = await User.create({ username, email, password });
    const token = generateToken(user._id);
    const csrfToken = setAuthCookies(res, token);
    res.status(201).json({
      success: true,
      csrfToken,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Bu email veya kullanıcı adı zaten kullanılıyor' });
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email ve şifre gerekli' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, message: 'Geçersiz kimlik bilgileri' });

    const token = generateToken(user._id);
    const csrfToken = setAuthCookies(res, token);
    res.json({
      success: true,
      csrfToken,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

exports.logout = async (req, res) => {
  clearAuthCookies(res);
  res.json({ success: true, message: 'Çıkış yapıldı' });
};

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const sanitizeRequest = require('./middleware/sanitizeRequest');
const csrfProtection = require('./middleware/csrf');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(sanitizeRequest);
app.use('/api', csrfProtection);

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: 'Çok fazla istek, 15 dakika sonra deneyin' });
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: 'Çok fazla giriş denemesi, 15 dakika sonra deneyin' });
const registerLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, message: 'Çok fazla kayıt denemesi, 15 dakika sonra deneyin' });
const authRoutes = require('./routes/auth');

if (process.env.NODE_ENV !== 'test') {
  app.use('/api', limiter);
}

if (process.env.NODE_ENV !== 'test') {
  app.use('/api/auth/login', loginLimiter);
  app.use('/api/auth/register', registerLimiter);
}

app.use('/api/auth', authRoutes);
app.use('/api/tasks', require('./routes/tasks'));

app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

app.use(errorHandler);

module.exports = app;

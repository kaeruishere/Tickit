const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];
const EXEMPT_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/logout',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
];

const csrfProtection = (req, res, next) => {
  if (SAFE_METHODS.includes(req.method)) return next();
  if (EXEMPT_PATHS.includes(req.path)) return next();

  const csrfCookie = req.cookies?.csrfToken;
  const csrfHeader = req.get('X-CSRF-Token');

  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    return res.status(403).json({
      success: false,
      message: 'CSRF doğrulaması başarısız',
    });
  }

  next();
};

module.exports = csrfProtection;

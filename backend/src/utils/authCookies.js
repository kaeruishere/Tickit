const crypto = require('crypto');

const parseDuration = (value = '7d') => {
  const match = String(value).match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000;

  const amount = Number(match[1]);
  const unit = match[2];
  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return amount * multipliers[unit];
};

const isProduction = () => process.env.NODE_ENV === 'production';
const shouldPartitionCookies = () =>
  process.env.COOKIE_PARTITIONED
    ? process.env.COOKIE_PARTITIONED === 'true'
    : isProduction();

const cookieOptions = (overrides = {}) => ({
  secure: process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === 'true' : isProduction(),
  sameSite: process.env.COOKIE_SAMESITE || (isProduction() ? 'none' : 'lax'),
  partitioned: shouldPartitionCookies(),
  path: '/',
  ...overrides,
});

const setAuthCookies = (res, token) => {
  const maxAge = parseDuration(process.env.JWT_EXPIRE);
  const csrfToken = crypto.randomBytes(32).toString('hex');

  res.cookie('token', token, cookieOptions({
    httpOnly: true,
    maxAge,
  }));

  res.cookie('csrfToken', csrfToken, cookieOptions({
    httpOnly: false,
    maxAge,
  }));

  return csrfToken;
};

const clearAuthCookies = (res) => {
  res.clearCookie('token', cookieOptions({ httpOnly: true }));
  res.clearCookie('csrfToken', cookieOptions({ httpOnly: false }));
};

module.exports = { setAuthCookies, clearAuthCookies };

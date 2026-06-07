const { sanitize } = require('express-mongo-sanitize');

const sanitizeRequest = (req, res, next) => {
  if (req.body) req.body = sanitize(req.body);
  if (req.params) req.params = sanitize(req.params);
  next();
};

module.exports = sanitizeRequest;

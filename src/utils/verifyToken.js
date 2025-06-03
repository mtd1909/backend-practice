const jwt = require('jsonwebtoken');
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { valid: true, decoded };
  } catch (err) {
    return { valid: false, message: err.message };
  }
};
module.exports = verifyToken;

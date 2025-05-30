const jwt = require("jsonwebtoken");
const { sendSuccess, sendError } = require("../helper/response")
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return sendError(res, 401, "Access token required");
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return sendError(res, 403, "Invalid or expired token");
    }
    req.user = decoded;
    next();
  });
}

module.exports = authenticateToken;
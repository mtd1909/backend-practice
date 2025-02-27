const jwt = require("jsonwebtoken");
require("dotenv").config();

const authMiddleware = (req, res, next) => {
  // Lấy token từ header
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      code: 401,
      message: "Không có token, từ chối truy cập",
    });
  }

  try {
    // Xác thực token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded; // Gán user vào request để sử dụng sau này
    next(); // Cho phép request tiếp tục
  } catch (error) {
    return res.status(403).json({
      code: 403,
      message: "Token không hợp lệ",
    });
  }
};

module.exports = authMiddleware;
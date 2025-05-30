const connectToDatabase = require("../config/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendSuccess, sendError } = require("../helper/response")

const register = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const db = await connectToDatabase();
    const users = db.collection("users");
    const existingUser = await users.findOne({ username });
    if (existingUser) {
      return sendError(res, 400, "Username already exists");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { email, username, password: hashedPassword };
    await users.insertOne(newUser);
    return sendSuccess(res, { message: "User registered successfully" });
  } catch (err) {
    console.error("Register error:", err);
    return sendError(res, 500, "Internal server error");
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const db = await connectToDatabase();
    const users = db.collection("users");
    const user = await users.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return sendError(res, 401, "Incorrect username or password");
    }
    const accessToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" } // 15 phút
    );
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET_RF,
      { expiresIn: "7d" } // 7 ngày
    );
    return sendSuccess(res, { accessToken, refreshToken });
  } catch (err) {
    console.error("Login error:", err);
    return sendError(res, 500, "Internal server error");
  }
};

module.exports = { register, login };

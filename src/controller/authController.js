const connectToDatabase = require("../config/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { sendSuccess, sendError } = require("../helper/response")
const { ObjectId } = require("mongodb");

require("dotenv").config();

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
    const result = await users.insertOne(newUser);
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

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const db = await connectToDatabase();
  const users = db.collection("users");
  const user = await users.findOne({ email });
  if (!user) return sendError(res, 400, "Email not found")
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });
  const resetLink = `http://localhost:3000/reset-password?token=${token}`;
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  await transporter.sendMail({
    from: process.env.EMAIL_USERNAME,
    to: email,
    subject: "Reset Your Password",
    html: `<p>Click the link below to reset your password:</p><a href="${resetLink}">${resetLink}</a>`,
  });
  return sendSuccess(res, { message: "Reset link sent to your email" });
};

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  console.log("Received token:", token);
  console.log("JWT_SECRET:", process.env.JWT_SECRET);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const db = await connectToDatabase();
    const users = db.collection("users");
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await users.updateOne(
      { _id: new ObjectId(decoded.id) },
      { $set: { password: hashedPassword } }
    );
    return sendSuccess(res, { message: "Password updated successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    return sendError(res, 400, "Invalid or expired token")
  }
};

module.exports = { register, login, forgotPassword, resetPassword };

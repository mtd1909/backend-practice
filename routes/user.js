const express = require('express');
const user = express.Router();

const connectToDatabase = require('../database')
require('dotenv').config()

user.get("/", async (req, res) => {
  try {
      const db = await connectToDatabase();
      const users = await db.collection("users").find().toArray();
      res.json(users);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

user.post("/", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const newEmployee = req.body;

    console.log("Dữ liệu gửi lên:", newEmployee);

    const result = await db.collection("employees").insertOne(newEmployee);
    console.log("Kết quả insert:", result);

    // Kiểm tra nếu insertedId không tồn tại
    if (!result.insertedId) {
        return res.status(500).json({ error: "Không thể thêm user, insertedId bị undefined" });
    }

    res.status(201).json({ _id: result.insertedId, ...newEmployee });
} catch (error) {
    console.error("Lỗi:", error);
    res.status(500).json({ error: error.message });
}
});

module.exports = user;
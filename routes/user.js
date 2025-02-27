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
    const newUser = req.body;
    const result = await db.collection("users").insertOne(newUser);

    res.status(201).json({
      code: 201, // Mã trạng thái HTTP
      message: "Tạo người dùng thành công",
      data: { _id: result.insertedId, ...newUser }
    });
  } catch (error) {
    console.error("Lỗi:", error);
    res.status(500).json({
      code: 500,
      message: "Lỗi server khi tạo người dùng",
      error: error.message
    });
  }
});


module.exports = user;
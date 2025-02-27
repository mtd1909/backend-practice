const express = require("express");
const { getUser, createUser } = require("../controller/userController");

const router = express.Router();

// 🟢 Route lấy danh sách users
router.get("/", getUser);

// Route tạo user mới
router.post("/", createUser);

module.exports = router;
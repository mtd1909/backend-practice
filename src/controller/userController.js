const connectToDatabase = require("../config/database"); // Kết nối DB

// 🟢 Hàm lấy danh sách users
const getUser = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const users = await db.collection("users").find().toArray();
    
    res.status(200).json({
      code: 200,
      message: "Lấy danh sách người dùng thành công",
      data: users
    });
  } catch (error) {
    console.error("Lỗi:", error);
    res.status(500).json({
      code: 500,
      message: "Lỗi server khi lấy danh sách người dùng",
      error: error.message
    });
  }
};

// 🟢 Hàm tạo user
const createUser = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const newUser = req.body;
    const result = await db.collection("users").insertOne(newUser);

    res.status(201).json({
      code: 201,
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
};

// 🟢 Xuất các function để dùng trong routes
module.exports = { getUser, createUser };
const connectToDatabase = require("../config/database"); // Kết nối DB
const { ObjectId } = require("mongodb");

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

// 🟢 Hàm cập nhật user
const updateUser = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const { id } = req.params;
    const updatedUser = req.body;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        code: 400,
        message: "ID không hợp lệ",
      });
    }
    delete updatedUser._id;
    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedUser }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({
        code: 404,
        message: "Không tìm thấy người dùng",
      });
    }
    res.json({
      code: 200,
      message: "Cập nhật người dùng thành công",
    });
  } catch (error) {
    console.error("Lỗi:", error);
    res.status(500).json({
      code: 500,
      message: "Lỗi server khi cập nhật người dùng",
      error: error.message,
    });
  }
};

// 🟢 Hàm xoá user
const deleteUser = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        code: 400,
        message: "ID không hợp lệ",
      });
    }
    const result = await db.collection("users").deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({
        code: 404,
        message: "Không tìm thấy người dùng",
      });
    }
    res.json({
      code: 200,
      message: "Xóa người dùng thành công",
    });
  } catch (error) {
    console.error("Lỗi:", error);
    res.status(500).json({
      code: 500,
      message: "Lỗi server khi xóa người dùng",
      error: error.message,
    });
  }
};

// 🟢 Xuất các function để dùng trong routes
module.exports = { getUser, createUser, updateUser, deleteUser };
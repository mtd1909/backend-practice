const connectToDatabase = require("../config/database"); 
const { sendSuccess, sendError } = require("../helper/response")
const fs = require("fs");
const path = require("path");
const multer = require("multer");
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

const getProfile = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const users = db.collection("users");
    const user = await users.findOne(
      { _id: new ObjectId(req.user.id) },
      { projection: { password: 0 } } // không trả password
    );
    if (!user) return sendError(res, 404, "User not found.");
    return sendSuccess(res, user);
  } catch (error) {
    console.error("Get profile error:", err);
    return sendError(res, 500, "Internal server error.");
  }
};

const storage = multer.diskStorage({
  destination: "public/uploads",
  filename: (req, file, cb) => {
    const filename = Date.now() + "-" + file.originalname;
    cb(null, filename);
  },
});
const upload = multer({ storage });

// Upload avatar (xoá avatar cũ nếu có)
const uploadAvatar = [
  upload.single("avatar"),
  async (req, res) => {
    const userId = req.body.userId;
    const db = await connectToDatabase();
    const users = db.collection("users");

    const user = await users.findOne({ _id: new require("mongodb").ObjectId(userId) });
    if (!user) return sendError(res, 404, "User not found");

    // Nếu có avatar cũ thì xóa đi
    if (user.avatar) {
      const oldPath = path.join("public/uploads", user.avatar);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Lưu avatar mới vào DB
    const newAvatar = req.file.filename;
    await users.updateOne(
      { _id: user._id },
      { $set: { avatar: newAvatar } }
    );
    const url = `${req.protocol}://${req.get("host")}/uploads/${newAvatar}`;
    return sendSuccess(res, { url });
  }
]
// 🟢 Xuất các function để dùng trong routes
module.exports = { getUser, createUser, updateUser, deleteUser, getProfile, uploadAvatar };
const connectToDatabase = require("../config/database");
const { sendSuccess, sendError } = require("../helper/response");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { ObjectId } = require("mongodb");

// 🟢 Hàm lấy danh sách users
const getUser = async (req, res) => {
	try {
		const db = await connectToDatabase();
		const users = await db.collection("users").find().project({ favorites: 0, block: 0 }).toArray();
		return sendSuccess(res, users);
	} catch (error) {
		console.error("Fetch users error:", error);
		return sendError(res, 400, "Failed to fetch user list.");
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
			data: { _id: result.insertedId, ...newUser },
		});
	} catch (error) {
		console.error("Lỗi:", error);
		res.status(500).json({
			code: 500,
			message: "Lỗi server khi tạo người dùng",
			error: error.message,
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
		const result = await db.collection("users").updateOne({ _id: new ObjectId(id) }, { $set: updatedUser });
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
		await users.updateOne({ _id: user._id }, { $set: { avatar: newAvatar } });
		const url = `${req.protocol}://${req.get("host")}/uploads/${newAvatar}`;
		return sendSuccess(res, { url });
	},
];

const getContacts = async (req, res) => {
	try {
		const db = await connectToDatabase();
		const users = db.collection("users");
		const currentUserId = req.user?.id;
		if (!currentUserId) return sendError(res, 401, "Unauthorized");
		const currentUser = await users.findOne({ _id: new ObjectId(currentUserId) });
		const favoriteIds = (currentUser?.favorites || []).map((id) => id.toString());
		const blockIds = (currentUser?.blocks || []).map((id) => id.toString());
		const contacts = await users
			.find({ _id: { $ne: new ObjectId(currentUserId) } })
			.project({ password: 0, favorites: 0, blocks: 0 })
			.toArray();
		const enrichedContacts = contacts.map((user) => {
			const userId = user._id.toString();
			return {
				...user,
				isFavorite: favoriteIds.includes(userId),
				isBlock: blockIds.includes(userId),
			};
		});
		return sendSuccess(res, enrichedContacts);
	} catch (error) {
		console.error("Fetch contacts error:", error);
		return sendError(res, 500, "Failed to fetch contacts.");
	}
};

const toggleFavoriteUser = async (req, res) => {
	try {
		const db = await connectToDatabase();
		const users = db.collection("users");
		const currentUserId = req.user?.id;
		const targetUserId = req.params.targetUserId;
		if (!currentUserId || !targetUserId) {
			return sendError(res, 400, "Missing user ID.");
		}
		const currentUser = await users.findOne({ _id: new ObjectId(currentUserId) });
		const isAlreadyFavorite = (currentUser?.favorites || []).some((id) => id.toString() === targetUserId);
		const update = isAlreadyFavorite
			? { $pull: { favorites: new ObjectId(targetUserId) } }
			: { $addToSet: { favorites: new ObjectId(targetUserId) } };
		await users.updateOne({ _id: new ObjectId(currentUserId) }, update);
		return sendSuccess(res, {
			message: isAlreadyFavorite ? "Removed from favorites." : "Added to favorites.",
			isFavorite: !isAlreadyFavorite,
		});
	} catch (error) {
		console.error("Toggle favorite error:", error);
		return sendError(res, 500, "Failed to toggle favorite.");
	}
};

const getFavoriteUsers = async (req, res) => {
	try {
		const db = await connectToDatabase();
		const users = db.collection("users");
		const currentUserId = req.user?.id;
		const currentUser = await users.findOne({ _id: new ObjectId(currentUserId) });
		const favoriteIds = currentUser?.favorites || [];
		const favoriteUsers = await users
			.find({ _id: { $in: favoriteIds } })
			.project({ password: 0 })
			.toArray();
		return sendSuccess(res, favoriteUsers);
	} catch (error) {
		console.error("Get favorites error:", error);
		return sendError(res, 500, "Failed to fetch favorite users.");
	}
};

const toggleBlockUser = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const users = db.collection("users");
    const currentUserId = req.user?.id;
    const targetUserId = req.params.targetUserId;
    if (!currentUserId || !targetUserId) {
      return sendError(res, 400, "Missing user ID.");
    }
    const currentUser = await users.findOne({ _id: new ObjectId(currentUserId) });
    const isAlreadyBlocks = (currentUser?.blocks || []).some(
      (id) => id.toString() === targetUserId
    );
    const update = isAlreadyBlocks
      ? { $pull: { blocks: new ObjectId(targetUserId) } }
      : { $addToSet: { blocks: new ObjectId(targetUserId) } };
    await users.updateOne({ _id: new ObjectId(currentUserId) }, update);
    return sendSuccess(res, {
      message: isAlreadyBlocks ? "Unblocks user." : "Blocked user.",
      isBlock: !isAlreadyBlocks,
    });
  } catch (error) {
    console.error("Toggle block error:", error);
    return sendError(res, 500, "Failed to toggle block.");
  }
};

const getBlockedUsers = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const users = db.collection("users");
    const currentUserId = req.user?.id;
    const currentUser = await users.findOne({ _id: new ObjectId(currentUserId) });
    const blockedIds = currentUser?.blocks || [];
    const blockedUsers = await users
      .find({ _id: { $in: blockedIds } })
      .project({ password: 0, favorites: 0, blocked: 0 }) // ẩn các trường không cần thiết
      .toArray();
    return sendSuccess(res, blockedUsers);
  } catch (error) {
    console.error("Get block error:", error);
    return sendError(res, 500, "Failed to fetch blocked users.");
  }
};
// 🟢 Xuất các function để dùng trong routes
module.exports = {
	getUser,
	createUser,
	updateUser,
	deleteUser,
	getProfile,
	uploadAvatar,
	getContacts,
	toggleFavoriteUser,
	getFavoriteUsers,
	toggleBlockUser,
	getBlockedUsers,
};

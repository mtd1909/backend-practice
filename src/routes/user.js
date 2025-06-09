const express = require("express");
const authenticateToken = require("../middleware/auth");
const {
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
} = require("../controllers/userController");
const router = express.Router();

router.get("/", authenticateToken, getUser);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.get("/info/profile", authenticateToken, getProfile);
router.post("/upload-avatar", authenticateToken, uploadAvatar);
router.get("/contacts", authenticateToken, getContacts);
router.post("/favorites/toggle/:targetUserId", authenticateToken, toggleFavoriteUser);
router.get("/favorites", authenticateToken, getFavoriteUsers);
router.post("/block/toggle/:targetUserId", authenticateToken, toggleBlockUser);
router.get("/block", authenticateToken, getBlockedUsers);

module.exports = router;

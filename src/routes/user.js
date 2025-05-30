const express = require("express");
const authenticateToken = require("../middleware/auth");
const { getUser, createUser, updateUser, deleteUser, getProfile } = require("../controller/userController");
const router = express.Router();

router.get("/", getUser);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.get("/info/profile", authenticateToken, getProfile);

module.exports = router;
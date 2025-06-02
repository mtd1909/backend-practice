const express = require("express");
const router = express.Router();
const { register, login, forgotPassword, resetPassword, getToken } = require("../controller/authController");

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/renew-token", getToken);

module.exports = router;
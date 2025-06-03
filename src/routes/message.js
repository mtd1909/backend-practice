const express = require("express");
const router = express.Router();
const {
  sendMessage,
  getPrivateMessages,
} = require("../controllers/messageController");

router.post("/", sendMessage);
router.get("/private/:user1/:user2", getPrivateMessages);

module.exports = router;

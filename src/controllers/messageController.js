const connectToDatabase = require("../config/database");
const { createMessageData, saveMessage } = require("../models/message");
const { ObjectId } = require("mongodb");
const { sendSuccess, sendError } = require("../helper/response");

const sendMessage = async (req, res) => {
  try {
    const { senderName, senderId, receiverId, text } = req.body;
    if (!senderName || !senderId || !receiverId || !text) {
      return sendError(res, 400, "Missing fields");
    }

    const db = await connectToDatabase();
    const messages = db.collection("messages");

    const newMessage = createMessageData({ senderName, senderId, receiverId, text });
    await messages.insertOne(newMessage);

    return sendSuccess(res, newMessage);
  } catch (error) {
    console.error("sendMessage error:", error);
    return sendError(res, 500, "Internal Server Error");
  }
};

const getPrivateMessages = async (req, res) => {
  try {
    const { user1, user2 } = req.params;

    if (!user1 || !user2) {
      return sendError(res, 400, "Missing user IDs");
    }

    const db = await connectToDatabase();
    const messages = db.collection("messages");
    const result = await messages
      .find({
        $or: [
          { senderId: new ObjectId(user1), receiverId: new ObjectId(user2) },
          { senderId: new ObjectId(user2), receiverId: new ObjectId(user1) },
        ],
      })
      .sort({ createdAt: 1 })
      .toArray();

    return sendSuccess(res, result);
  } catch (error) {
    console.error("getPrivateMessages error:", error);
    return sendError(res, 500, "Internal Server Error");
  }
};

const handlePrivateMessage = async (io, data, socket, onlineUsers) => {
  try {
    const { senderName, senderId, receiverId, text } = data;

    if (!senderName || !senderId || !receiverId || !text) return;

    const db = await connectToDatabase();
    const messages = db.collection("messages");

    const messageData = createMessageData({ senderName, senderId, receiverId, text });
    const savedMessage = await saveMessage(messageData);

    console.log("✅ Message saved:", savedMessage);
    socket.emit("message-sent", savedMessage);

    // Gửi thông báo tới người nhận nếu họ đang online
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("notify-message", savedMessage);
    } else {
      console.log(`⚠️ Người nhận (${receiverId}) hiện đang offline.`);
    }
  } catch (error) {
    console.error("handlePrivateMessage error:", error);
    socket.emit("error", { message: "Unable to send message" });
  }
};

const getMessageHistory = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, 401, "Unauthorized");
    }

    const db = await connectToDatabase();
    const messages = db.collection("messages");

    const result = await messages
      .find({
        $or: [
          { senderId: new ObjectId(userId) },
          { receiverId: new ObjectId(userId) },
        ],
      })
      .sort({ createdAt: -1 })
      .toArray();

    return sendSuccess(res, result);
  } catch (error) {
    console.error("getMessageHistory error:", error);
    return sendError(res, 500, "Internal Server Error");
  }
};

module.exports = {
	sendMessage,
	getPrivateMessages,
	handlePrivateMessage,
	getMessageHistory,
};

const connectToDatabase = require("../config/database");
const { createMessageData, saveMessage } = require("../models/message");
const { ObjectId } = require("mongodb");
// Gửi tin nhắn qua HTTP (API REST)
exports.sendMessage = async (req, res) => {
  try {
    const { senderName, senderId, receiverId, text } = req.body;
    if (!senderName || !senderId || !receiverId || !text) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const db = await connectToDatabase();
    const messages = db.collection("messages");

    const newMessage = createMessageData({ senderName, senderId, receiverId, text });
    await messages.insertOne(newMessage);

    return res.status(201).json(newMessage);
  } catch (error) {
    console.error("sendMessage error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Lấy tin nhắn riêng giữa 2 người dùng
exports.getPrivateMessages = async (req, res) => {
  try {
    const { user1, user2 } = req.params;

    if (!user1 || !user2) {
      return res.status(400).json({ message: "Missing user IDs" });
    }

    const db = await connectToDatabase();
    const messages = db.collection("messages");
    console.log(messages);
    
    const result = await messages
      .find({
        $or: [
          { senderId: new ObjectId(user1), receiverId: new ObjectId(user2) },
          { senderId: new ObjectId(user2), receiverId: new ObjectId(user1) },
        ],
      })
      .sort({ createdAt: 1 })
      .toArray();
      console.log(result);
      
    return res.json(result);
  } catch (error) {
    console.error("getPrivateMessages error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Xử lý gửi tin nhắn qua Socket.IO
exports.handlePrivateMessage = async (io, data, socket, onlineUsers) => {
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
    socket.emit("error", { message: "Không gửi được tin nhắn" });
  }
};

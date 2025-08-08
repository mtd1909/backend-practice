const privateChatSocket = require("./privateChatSocket");
const { addUser, removeUserBySocketId, getOnlineUsers, hasUser } = require("./onlineUsers");

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    socket.on("register", (userId) => {
      if (!userId) return;
      socket.userId = userId;
      if (!hasUser(userId)) {
        addUser(userId, socket.id);
        console.log(`✅ User ${userId} registered`);
      } else {
        console.log(`⚠️ User ${userId} already registered`);
      }
      socket.emit("online-users", getOnlineUsers());
      socket.broadcast.emit("user-online", userId);
      privateChatSocket(io, socket);
    });

    socket.on("get-online-users", () => {
      socket.emit("online-users", getOnlineUsers());
    });

    socket.on("disconnect", () => {
      removeUserBySocketId(socket.id);
      if (socket.userId) {
        console.log(`❌ User ${socket.userId} disconnected`);
        socket.broadcast.emit("user-offline", socket.userId);
      }
    });

    socket.on("manual-disconnect", () => {
      removeUserBySocketId(socket.id);
      if (socket.userId) {
        socket.broadcast.emit("user-offline", socket.userId);
      }
    });
  });
};

module.exports = socketHandler;

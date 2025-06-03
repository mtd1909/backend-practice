const { handlePrivateMessage } = require('../controllers/messageController');

const userSocketMap = new Map(); // Map userId => socket.id

module.exports = async function privateChatSocket(io, socket) {
  console.log('🟢 New client connected:', socket.id);

  // Khi người dùng kết nối, lưu userId vào map
  socket.on('user-connected', (userId) => {
    if (userId) {
      userSocketMap.set(userId, socket.id);
      console.log(`👤 User ${userId} connected with socket ${socket.id}`);
    }
  });

  // Gọi controller để xử lý gửi tin nhắn
  socket.on('private-message', (data) => {
    handlePrivateMessage(io, data, socket, userSocketMap);
  });

  // Khi người dùng ngắt kết nối, xoá user khỏi map
  socket.on('disconnect', () => {
    for (const [userId, id] of userSocketMap.entries()) {
      if (id === socket.id) {
        userSocketMap.delete(userId);
        break;
      }
    }
    console.log(`🔴 Client disconnected: ${socket.id}`);
  });
};

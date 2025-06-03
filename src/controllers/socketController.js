const socketController = (io, socket) => {
  console.log(`✅ ${socket.user.email} connected`);

  socket.on('send-message', ({ roomId, message }) => {
    // gửi cho những người trong cùng room (trừ người gửi)
    socket.to(roomId).emit('receive-message', {
      sender: socket.user.email,
      message,
    });
  });

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`${socket.user.email} joined room ${roomId}`);
  });

  socket.on('leave-room', (roomId) => {
    socket.leave(roomId);
    console.log(`${socket.user.email} left room ${roomId}`);
  });

  socket.on('disconnect', () => {
    console.log(`❌ ${socket.user.email} disconnected`);
  });
};

module.exports = socketController;

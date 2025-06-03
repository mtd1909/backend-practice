const privateChatSocket = require('./privateChatSocket');

module.exports = function registerSocket(io) {
  io.on('connection', (socket) => {
    console.log(`🔌 New socket connected: ${socket.id}`);

    privateChatSocket(io, socket);
  });
};

const verifyToken = require('../utils/verifyToken');

const socketAuth = (socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new Error('No token provided'));
  }

  const { valid, decoded, message } = verifyToken(token);
  if (!valid) {
    return next(new Error(`Token invalid: ${message}`));
  }

  socket.user = decoded; // đính kèm user vào socket
  next();
};

module.exports = socketAuth;

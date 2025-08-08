const onlineUsers = new Map(); // userId => socketId

function addUser(userId, socketId) {
  onlineUsers.set(userId, socketId);
}

function removeUserBySocketId(socketId) {
  for (const [userId, sId] of onlineUsers.entries()) {
    if (sId === socketId) {
      onlineUsers.delete(userId);
      break;
    }
  }
}

function getOnlineUsers() {
  return Array.from(onlineUsers.keys());
}

function hasUser(userId) {
  return onlineUsers.has(userId);
}

module.exports = {
  addUser,
  removeUserBySocketId,
  getOnlineUsers,
  hasUser,
};

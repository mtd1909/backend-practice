const { ObjectId } = require("mongodb");

const getMessageCollection = async () => {
  const db = await require("../config/database")();
  return db.collection("messages");
};

module.exports = {
  createMessageData({ senderName, senderId, receiverId, text, status }) {
    return {
      senderName,
      senderId: new ObjectId(senderId),
      receiverId: new ObjectId(receiverId),
      text,
      status,
      createdAt: new Date(),
    };
  },

  async saveMessage(messageData) {
    const messages = await getMessageCollection();
    const result = await messages.insertOne(messageData);
    messageData._id = result.insertedId;
    return messageData;
  },
};

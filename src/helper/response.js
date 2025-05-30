const sendSuccess = (res, data) => res.status(200).json({ data });
const sendError = (res, code, message) =>
  res.status(code).json({ error: { message } });

module.exports = { sendSuccess, sendError };

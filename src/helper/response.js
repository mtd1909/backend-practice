export const sendSuccess = (res, data) => res.status(200).json({ data });
export const sendError = (res, code, message) =>
  res.status(code).json({ error: { message } });

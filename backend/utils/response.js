const success = (res, data, message = 'ok', statusCode = 200) => {
  res.status(statusCode).json({ code: 200, message, data });
};

const fail = (res, code, message, statusCode = 400) => {
  res.status(statusCode).json({ code, message, data: null });
};

module.exports = { success, fail };

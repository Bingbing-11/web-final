class AppError extends Error {
  constructor(code, message, statusCode) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}

function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ code: err.code, message: err.message, data: null });
  }
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ code: 401, message: '未授权，请重新登录', data: null });
  }
  // MySQL errors
  if (err.code && err.code.startsWith('ER_')) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ code: 409, message: '数据已存在', data: null });
    }
    return res.status(500).json({ code: 500, message: '数据库操作失败', data: null });
  }
  console.error('Unhandled error:', err);
  return res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
}

module.exports = { AppError, errorHandler };

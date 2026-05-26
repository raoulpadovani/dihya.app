export const notFoundHandler = (req, _res, next) => {
  const error = new Error(`Route ${req.method} ${req.originalUrl} not found.`);
  error.statusCode = 404;
  next(error);
};

export function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

export function errorHandler(err, _req, res, _next) {
  if (err?.name === "MulterError") {
    const message = err.code === "LIMIT_FILE_SIZE"
      ? "Image exceeds the allowed size limit."
      : err.message;

    return res.status(400).json({
      success: false,
      message,
      errors: [],
    });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    errors: err.errors || [],
  });
}

export function notFoundHandler(app) {
  app.use((req, res) => {
    res.status(404).json({ message: `Cannot ${req.method} ${req.originalUrl}` });
  });
}

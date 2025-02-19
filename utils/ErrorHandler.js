export const globalErrorHandler = (error, req, res) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || "Internal Server Error";

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: error.errors || []
  });
};
export const globalErrorHandler = (error, req, res, next) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || "Internal Server Error";
  let errorsArray = error.errors || [];

  return res.status(statusCode).json({
    success: false,
    statusCode ,
    message,
    errors: errorsArray
  });
};
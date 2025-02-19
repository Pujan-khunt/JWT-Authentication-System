export const asyncHandler = (cb) => {
  return async (req, res, next) => {
    try {
      await cb(req, res);
    } catch (error) {
      next(error);
    }
  };
};
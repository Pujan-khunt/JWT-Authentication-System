import rateLimit from "express-rate-limit";

export const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 5 refresh requests per windowMs per user
  message: "Too many attempts. Please wait for 15 minutes before refreshing again",
});
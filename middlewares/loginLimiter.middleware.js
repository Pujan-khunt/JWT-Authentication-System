import rateLimit from "express-rate-limit";

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login requests per windowMs
  message: "Too many login attempts from this IP, please try again after 15 minutes",
  headers: true // include rate limit info in the `RateLimit-*` headers
});
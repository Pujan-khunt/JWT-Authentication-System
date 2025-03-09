import { ApiError } from "../utils/ApiError.util.js";
import { allowedOrigins } from "./allowedOrigins.js";

// Remove the "/" from the end, if any.
const normalizeOrigin = (origin) => {
  if(origin?.endsWith("/")) {
    return origin.slice(0, -1);
  }
  return origin;
};

const customOriginAllowing = (origin, cb) => {
  const normalizedOrigin = normalizeOrigin(origin);

  if (allowedOrigins.includes(normalizedOrigin) || !normalizedOrigin) {
    cb(null, true);
  } else {
    cb(new ApiError(`Origin ${normalizedOrigin} is not allowed by CORS`), false);
  }
};

// The allowed origins are decided based on customOriginAllowing function
export const corsOptions = {
  origin: customOriginAllowing,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};
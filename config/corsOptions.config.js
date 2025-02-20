import { ApiError } from "../utils/ApiError.util.js";
import { allowedOrigins } from "./allowedOrigins.js";

const normalizeOrigin = (origin) => {
  if(origin?.endsWith("/")) {
    return origin.slice(0, -1);
  }
  return origin;
};

const customOriginAllowing = (origin, callback) => {
  const normalizedOrigin = normalizeOrigin(origin);

  if (allowedOrigins.includes(normalizedOrigin) || !normalizedOrigin) {
    callback(null, true);
  } else {
    callback(new ApiError(`Origin ${normalizedOrigin} not allowed by CORS`), false);
  }
};

// The allowed origins are decided based on customOriginAllowing function
export const corsOptions = {
  origin: customOriginAllowing,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};
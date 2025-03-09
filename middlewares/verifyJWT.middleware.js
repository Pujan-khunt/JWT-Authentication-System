import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.util.js";

export const verifyJWT = (req, res, next) => {
  // Extracting the authorization header from the request
  const authHeader = req.headers.authorization || req.headers.Authorization;

  // Checking if the authorization header starts with "Bearer "
  if(!authHeader?.startsWith("Bearer ")) {
    throw new ApiError(401, "Authorization header is missing.");
  }

  // Extracting the token from the authorization header
  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  
  // Attaching the username and id from the decoded token to the request object (so controllers can get a direct access)
  req.username = decoded.username;
  req.userId = decoded.id;
  next();
};
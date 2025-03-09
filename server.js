import express from "express";
import "dotenv/config";
import { connectDB } from "./config/connectDB.js";
import cookieParser from "cookie-parser";

const app = express();
const PORT = process.env.PORT || 3000;

// Connect the database (stops the program on failure).
connectDB();

// Custom morgan middlwares for logging in console and log files.
import { consoleLogger, fileLogger } from "./middlewares/requestLogger.middleware.js";
app.use(consoleLogger);
app.use(fileLogger);

// Custom cors options with selected allowed origins.
import cors from "cors";
import { corsOptions } from "./config/corsOptions.config.js";
app.use(cors(corsOptions));

// Common middlewares which convert data into JS objects.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Import Routes
import registrationRoutes from "./routes/register.routes.js";
import authorizationRoutes from "./routes/authenticate.routes.js";
import refreshTokenRoutes from "./routes/refreshToken.routes.js";
import logoutRoutes from "./routes/logout.routes.js";

// Routes
app.use("/register", registrationRoutes);
app.use("/login", authorizationRoutes);
app.use("/refresh", refreshTokenRoutes);
app.use("/logout", logoutRoutes);

// Verification of JWT - middleware
import { verifyJWT } from "./middlewares/verifyJWT.middleware.js";
app.use(verifyJWT);

// Custom global error handling middleware.
import { globalErrorHandler } from "./middlewares/errorHandler.middleware.js";
app.use(globalErrorHandler);

app.listen(PORT, () => console.log(`Server Unfortunately Running At http://localhost:${process.env.PORT}/`));
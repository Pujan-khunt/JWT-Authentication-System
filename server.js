import express from "express";
import "dotenv/config";
import {connectDB} from "./config/connectDB.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Connect the database and stop the program on failure.
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

// Import Routes
import registrationRoutes from "./routes/register.routes.js";
import authorizationRoutes from "./routes/authenticate.routes.js";

// Routes
app.use("/register", registrationRoutes);
app.use("/login", authorizationRoutes);

// Custom global error handling middleware.
import { globalErrorHandler } from "./middlewares/errorHandler.middleware.js";
app.use(globalErrorHandler);

app.listen(PORT, () => console.log("Server Unfortunately Running At http://localhost:3000/"));
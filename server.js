import express from "express";
import "dotenv/config";
import {connectDB} from "./"

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

// Custom morgan middlwares for logging in console and log files
import { consoleLogger, fileLogger } from "./middlewares/requestLogger.middleware.js";
app.use(consoleLogger);
app.use(fileLogger);

// Custom cors options with selected allowed origins
import { corsOptions } from "./config/corsOptions.config.js";
import cors from "cors";
app.use(cors(corsOptions));

// Common middlewares which convert data into JS objects
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import Routes
import registrationRoute from "./routes/register.routes.js";

// Routes
app.post("/register", registrationRoute);

// Custom global error handling middleware
import { globalErrorHandler } from "./middlewares/errorHandler.middleware.js";
app.use(globalErrorHandler);

app.listen(PORT, () => console.log("Server Unfortunately Running At http://localhost:3000/"));
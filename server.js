import express from "express";
import "dotenv/config";
import { globalErrorHandler } from "./middlewares/errorHandler.middleware.js";
import { consoleLogger, fileLogger } from "./middlewares/requestLogger.middleware.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Custom morgan middlwares for logging in console and log files
app.use(consoleLogger);
app.use(fileLogger);

// Import Routes

// Routes
app.get("/", (req, res) => {
  res.send("hello world");
})

// Custom global error handling middleware
app.use(globalErrorHandler);

app.listen(PORT, () => console.log("Server Unfortunately Running At http://localhost:3000/"));
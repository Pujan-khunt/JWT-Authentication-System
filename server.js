import express from "express";
import "dotenv/config";
import { globalErrorHandler } from "./utils/ErrorHandler.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("hello world");
});

app.use(globalErrorHandler);

app.listen(PORT, () => console.log(`Server Unfortunately Running At http://localhost:3000/`));
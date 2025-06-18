import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { updateLastSeen } from "./middleware/updateLastSeen.js";

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Add updateLastSeen middleware after authentication middleware
app.use(updateLastSeen);

// ... rest of the app configuration ... 
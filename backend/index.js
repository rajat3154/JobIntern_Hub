import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import jobRoute from "./routes/job.route.js";
import internshipRoute from "./routes/internship.route.js";
import studentRoute from "./routes/student.route.js";
import applicationRoute from "./routes/application.route.js";
import adminRoute from "./routes/admin.route.js";
import messageRoute from "./routes/message.route.js";
import followRoute from "./routes/follow.routes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import { createServer } from "http";
import { initSocket } from "./socket/socket.js";


dotenv.config();
const PORT = process.env.PORT || 8000;
const app = express();
const server = createServer(app);

// Initialize Socket.IO immediately after creating the server
const io = initSocket(server);

const corsOptions = {
    origin: ["http://localhost:5173"],
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Make io accessible to routes if needed
app.set('io', io);

app.use("/api/v1/message", messageRoute);
app.use("/api/v1", studentRoute);
app.use("/api/v1/job", jobRoute);
app.use("/api/v1/application", applicationRoute);
app.use("/api/v1/internship", internshipRoute);
app.use("/api/v1/admin", adminRoute);
app.use("/api/v1/follow", followRoute);
app.use("/api/notifications", notificationRoutes);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
});
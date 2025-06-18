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
import jwt from "jsonwebtoken";


dotenv.config();
const PORT = process.env.PORT || 8000;
const app = express();
const server = createServer(app);

// Initialize Socket.IO immediately after creating the server
const io = initSocket(server);

// Comprehensive CORS configuration for production
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            "http://localhost:5173",
            "https://job-intern-hub.vercel.app",
            "https://thejobinternhub.vercel.app"
        ];
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log("CORS blocked origin:", origin);
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
        "Content-Type", 
        "Authorization", 
        "X-Requested-With",
        "Accept",
        "Origin",
        "Access-Control-Request-Method",
        "Access-Control-Request-Headers"
    ],
    exposedHeaders: ["Set-Cookie", "Authorization"],
    preflightContinue: false,
    optionsSuccessStatus: 200
};

// Apply CORS before other middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// Make io accessible to routes if needed
app.set('io', io);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        cors: 'enabled'
    });
});

// Test endpoint without authentication
app.get('/test', (req, res) => {
    res.status(200).json({
        message: 'Test endpoint working',
        timestamp: new Date().toISOString(),
        headers: req.headers
    });
});

// Test token endpoint (for debugging)
app.get('/test-token', (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(400).json({
                message: 'No Bearer token provided',
                success: false
            });
        }

        const token = authHeader.substring(7);
        console.log("Test token endpoint - Token received:", token ? "Yes" : "No");
        console.log("Test token endpoint - Token length:", token.length);
        console.log("Test token endpoint - SECRET_KEY exists:", process.env.SECRET_KEY ? "Yes" : "No");

        if (!process.env.SECRET_KEY) {
            return res.status(500).json({
                message: 'SECRET_KEY not configured',
                success: false
            });
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        res.status(200).json({
            message: 'Token decoded successfully',
            decoded: decoded,
            success: true
        });
    } catch (error) {
        console.error("Test token endpoint error:", error.message);
        res.status(400).json({
            message: 'Token verification failed',
            error: error.message,
            success: false
        });
    }
});

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
    console.log(`CORS enabled for origins: http://localhost:5173, https://job-intern-hub.vercel.app, https://thejobinternhub.vercel.app`);
    
    // Check environment variables
    console.log("Environment check:");
    console.log("- SECRET_KEY exists:", process.env.SECRET_KEY ? "Yes" : "No");
    console.log("- MONGODB_URI exists:", process.env.MONGODB_URI ? "Yes" : "No");
    console.log("- NODE_ENV:", process.env.NODE_ENV || "Not set");
    
    connectDB();
});
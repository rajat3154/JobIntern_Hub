import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Authentication Middleware
const isAuthenticated = async (req, res, next) => {
      try {
            // Retrieve token from cookies first, then from Authorization header
            let token = req.cookies.token;
            
            // If no token in cookies, check Authorization header
            if (!token && req.headers.authorization) {
                  const authHeader = req.headers.authorization;
                  if (authHeader.startsWith('Bearer ')) {
                        token = authHeader.substring(7);
                  }
            }
            
            console.log("Auth middleware - Token from cookies:", req.cookies.token ? "Token exists" : "No token");
            console.log("Auth middleware - Token from header:", req.headers.authorization ? "Token exists" : "No token");
            console.log("Auth middleware - Final token:", token ? "Token exists" : "No token");
            console.log("Auth middleware - All cookies:", req.cookies);
            
            // Check if token exists
            if (!token) {
                  console.log("Auth middleware - No token found in cookies or headers");
                  return res.status(401).json({
                        message: "User not authenticated, token missing",
                        success: false,
                  });
            }

            // Check if SECRET_KEY is set
            if (!process.env.SECRET_KEY) {
                  console.error("Auth middleware - SECRET_KEY not set in environment");
                  return res.status(500).json({
                        message: "Server configuration error",
                        success: false,
                  });
            }

            // Verify the token
            const decoded = jwt.verify(token, process.env.SECRET_KEY);
            console.log("Auth middleware - Token decoded successfully:", decoded);

            // Ensure the decoded token has the required userId
            if (!decoded || !decoded.userId) {
                  console.log("Auth middleware - Invalid token or missing userId");
                  return res.status(401).json({
                        message: "Invalid token or missing userId",
                        success: false,
                  });
            }

            // Attach the user info to the request
            req.user = {
                  _id: decoded.userId, // Changed to _id for consistency
                  role: decoded.role, // Assuming role exists in the token
            };

            // Debug log for verification
            console.log("Authenticated User:", req.user);

            // Proceed to the next middleware or route handler
            next();

      } catch (error) {
            console.error("Authentication Error:", error.message);
            return res.status(500).json({
                  message: "Internal server error",
                  success: false,
            });
      }
};


export default isAuthenticated;

export const isAdmin = (req, res, next) => {
      if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Only admins can perform this action." });
      }
      next();
};
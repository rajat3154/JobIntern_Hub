import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Authentication Middleware
const isAuthenticated = async (req, res, next) => {
      try {
            // Retrieve token from cookies
            const token = req.cookies.token;
            console.log(token)
            // Check if token exists
            if (!token) {
                  return res.status(401).json({
                        message: "User not authenticated, token missing",
                        success: false,
                  });
            }

            // Verify the token
            const decoded = jwt.verify(token, process.env.SECRET_KEY);

            // Ensure the decoded token has the required userId
            if (!decoded || !decoded.userId) {
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
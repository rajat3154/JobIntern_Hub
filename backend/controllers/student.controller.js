import { Recruiter } from "../models/recruiter.model.js";
import { Student } from "../models/student.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import { getIO, getOnlineUserIds } from "../socket/socket.js";


export const sregister = async (req, res) => {
      try {
            const { fullname, email, phonenumber, password, role, status } = req.body;

            // Check required fields
            if (!fullname || !email || !phonenumber || !password || !status || !role) {
                  return res.status(400).json({
                        message: "All fields are required",
                        success: false
                  });
            }

            // Role validation
            if (role !== "student") {
                  return res.status(400).json({
                        message: "Invalid role",
                        success: false
                  });
            }

            // Check if student already exists
            const existingStudent = await Student.findOne({ email });
            if (existingStudent) {
                  return res.status(400).json({
                        message: "Email already exists",
                        success: false
                  });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Prepare student data
            const studentData = {
                  fullname,
                  email,
                  phonenumber,
                  password: hashedPassword,
                  role: "student",
                  status,
                  profile: {}
            };

            // Handle optional profile photo
            if (req.files && req.files.profilePhoto && req.files.profilePhoto.length > 0) {
                  const file = req.files.profilePhoto[0];
                
                  const fileUri = getDataUri(file);
                  const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
                  studentData.profile.profilePhoto = cloudResponse.secure_url;
            }

            // Create student
            await Student.create(studentData);

            return res.status(201).json({
                  message: "Account created successfully",
                  success: true,
            });

      } catch (error) {
            console.error("Error in sregister:", error);
            return res.status(500).json({
                  message: "Internal server error",
                  success: false,
                  error: error.message,
            });
      }
};
    
    



export const login = async (req, res) => {
      try {
            const { email, password, role } = req.body;

            if (!email || !password || !role) {
                  return res.status(400).json({
                        message: "All fields are required",
                        success: false,
                  });
            }

            // 🔐 Admin login
            if (role === "admin") {
                  if (email !== "admin@gmail.com" || password !== "admin") {
                        return res.status(400).json({
                              message: "Invalid admin credentials",
                              success: false,
                        });
                  }

                  const adminUser = {
                        _id: "admin_default_id",
                        email,
                        role,
                        fullname: "Admin",
                  };

                  const token = jwt.sign(
                        { userId: adminUser._id, role: "admin" },
                        process.env.SECRET_KEY,
                        { expiresIn: "1d" }
                  );

                  return res
                        .status(200)
                        .cookie("token", token, {
                              maxAge: 24 * 60 * 60 * 1000,
                              httpOnly: true,
                              secure: true,
                              sameSite: "none",
                        })
                        .json({
                              message: "Welcome Admin",
                              success: true,
                              user: adminUser,
                              token,
                        });
            }

            // 🔍 Determine model based on role
            const userModel = role === "student" ? Student : Recruiter;
            const user = await userModel.findOne({ email });

            if (!user) {
                  return res.status(400).json({
                        message: "Incorrect email or password",
                        success: false,
                  });
            }

            const isPasswordMatch = await bcrypt.compare(password, user.password);
            if (!isPasswordMatch) {
                  return res.status(400).json({
                        message: "Incorrect email or password",
                        success: false,
                  });
            }

            if (role !== user.role) {
                  return res.status(400).json({
                        message: "Account does not exist with current role",
                        success: false,
                  });
            }

            // Set user to online and save
            user.isOnline = true;
            await user.save();

            // ✅ INCLUDE role in token!
            const token = jwt.sign(
                  { userId: user._id, role: user.role },
                  process.env.SECRET_KEY,
                  { expiresIn: "1d" }
            );

            console.log("=== LOGIN DEBUG ===");
            console.log("Login - User ID:", user._id);
            console.log("Login - User role:", user.role);
            console.log("Login - Token generated:", token ? "Token created" : "No token");
            console.log("Login - Token length:", token ? token.length : 0);
            console.log("Login - SECRET_KEY exists:", process.env.SECRET_KEY ? "Yes" : "No");
            console.log("Login - SECRET_KEY length:", process.env.SECRET_KEY ? process.env.SECRET_KEY.length : 0);

            const userResponse =
                  role === "student"
                        ? {
                              _id: user._id,
                              fullname: user.fullname,
                              email: user.email,
                              phonenumber: user.phonenumber,
                              role: user.role,
                              status: user.status,
                              profile: user.profile,
                        }
                        : {
                              _id: user._id,
                              companyname: user.companyname,
                              email: user.email,
                              cinnumber: user.cinnumber,
                              role: user.role,
                              status: user.status,
                              profile: user.profile,
                        };

            const welcomeMessage =
                  role === "student"
                        ? `Welcome back ${user.fullname}`
                        : `Welcome back ${user.companyname}`;

            console.log("Login - Setting cookie with token");
            return res
                  .status(200)
                  .cookie("token", token, {
                        maxAge: 24 * 60 * 60 * 1000,
                        httpOnly: true,
                        secure: true,
                        sameSite: "none",
                  })
                  .json({
                        message: welcomeMessage,
                        success: true,
                        user: userResponse,
                        token,
                        debugCookies: req.cookies,
                  });
      } catch (error) {
            console.error("Login Error:", error.message);
            return res.status(500).json({
                  message: "Internal server error",
                  success: false,
            });
      }
};
export const logout = async (req, res) => {
      try {
            // Clear the cookie first with same configuration
            res.clearCookie("token", {
                  httpOnly: true,
                  secure: true,
                  sameSite: "none",
            });

            // Only try to update lastSeen and emit socket event if we have user info
            if (req.user && req.user._id) {
                  const userId = req.user._id;
                  const userRole = req.user.role;

                  // Update lastSeen timestamp and set isOnline to false
                  const userModel = userRole === 'student' ? Student : Recruiter;
                  await userModel.findByIdAndUpdate(userId, { lastSeen: new Date(), isOnline: false });

                  // Emit offline status through socket
                  const io = getIO();
                  io.emit("user:status", { userId, isOnline: false });
            }

            return res.status(200).json({
                  message: "Logged out successfully",
                  success: true,
            });
      } catch (error) {
            console.error("Logout error:", error);
            return res.status(500).json({
                  message: "Error during logout",
                  success: false,
            });
      }
};
export const updateProfile = async (req, res) => {
      try {
            const { fullname, email, phonenumber, bio, skills } = req.body;
            const resumeFile = req.files?.file?.[0];
            const photoFile = req.files?.profilePhoto?.[0];

            const user = await Student.findById(req.user._id);
            if (!user) {
                  return res.status(400).json({ message: "User not found", success: false });
            }

            if (fullname) user.fullname = fullname;
            if (email) user.email = email;
            if (phonenumber) user.phonenumber = phonenumber;
            if (bio) user.profile.bio = bio;
            if (skills) user.profile.skills = skills.split(",");

            if (resumeFile) {
                  const fileUri = getDataUri(resumeFile);
                  const cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
                        resource_type: "raw",
                  });
                  user.profile.resume = cloudResponse.secure_url;
                  user.profile.resumeOriginalName = resumeFile.originalname;
            }

            if (photoFile) {
                  const photoUri = getDataUri(photoFile);
                  const photoUpload = await cloudinary.uploader.upload(photoUri.content, {
                        folder: "profile_photos",
                  });
                  user.profile.profilePhoto = photoUpload.secure_url;
            }

            await user.save();

            return res.status(200).json({
                  message: "Profile updated successfully",
                  user,
                  success: true,
            });
      } catch (error) {
            console.error("Update Profile Error:", error.message);
            return res.status(500).json({
                  message: "Internal server error",
                  success: false,
            });
      }
    };
export const getAllStudents = async (req, res) => {
      try {
            const students = await Student.find().sort({ createdAt: -1 });

            return res.status(200).json({
                  success: true,
                  students,
            });
      } catch (error) {
            console.error("Error fetching students:", error);
            return res.status(500).json({
                  success: false,
                  message: "Failed to fetch students",
            });
      }
};
export const isAdmin = (req, res, next) => {
      if (!req.user || req.user.role !== "admin") {
            return res.status(403).json({
                  success: false,
                  message: "Access denied. Admins only.",
            });
      }
      next();
};

// controllers/studentController.js



// DELETE /api/v1/students/:id
export const deleteStudent = async (req, res) => {
      try {
            const studentId = req.params.id;

            // Optional: Only admin can delete, check if user is admin
            if (req.user.role !== "admin") {
                  return res.status(403).json({ message: "Access denied. Admins only." });
            }

            const deletedStudent = await Student.findByIdAndDelete(studentId);

            if (!deletedStudent) {
                  return res.status(404).json({ message: "Student not found." });
            }

            res.status(200).json({ message: "Student deleted successfully." });
      } catch (error) {
            console.error("Error deleting student:", error);
            res.status(500).json({ message: "Server error while deleting student." });
      }
};

export const getOtherUsers = async (req, res) => {
      try {
            const loggedInUserId = req.id;

            const students = await Student.find({}).select("-password");
            const recruiters = await Recruiter.find({}).select("-password");
            
            const onlineUserIds = getOnlineUserIds();

            // Combine students and recruiters and include isOnline status based on active sockets
            const allUsers = [
              ...students.map(user => ({
                ...user.toObject(),
                isOnline: onlineUserIds.includes(user._id.toString())
              })),
              ...recruiters.map(user => ({
                ...user.toObject(),
                isOnline: onlineUserIds.includes(user._id.toString())
              }))
            ];

            // Filter out the logged-in user
            const otherUsers = allUsers.filter(user => user._id.toString() !== loggedInUserId.toString());
            
            return res.status(200).json({ success: true, otherUsers });
      } catch (error) {
            console.error("Error in getOtherUsers:", error);
            return res.status(500).json({ message: "Internal server error", success: false });
      }
  }

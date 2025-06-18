import { deleteRecruiter, getAllRecruiters, getRecruiterJobs, getRecruiterProfile, recregister } from "../controllers/recruiter.controller.js";
import { deleteStudent, getAllStudents, isAdmin, login, logout, sregister, updateProfile } from "../controllers/student.controller.js";
import express, { Router } from "express";
import {  upload } from "../middlewares/multer.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import isaAdmin from "../middlewares/isAuthenticated.js";
import { Student } from "../models/student.model.js";
import { Recruiter } from "../models/recruiter.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const router = Router();

// Auth routes
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/check-auth").get(isAuthenticated, async (req, res) => {
    try {
        let userData;        if (req.user.role === "student") {
            userData = await Student.findById(req.user._id).select("-password");
            if (!userData) {
                return res.status(401).json({
                    success: false,
                    message: "Student not found",
                });
            }
        } else if (req.user.role === "recruiter") {
            userData = await Recruiter.findById(req.user._id).select("-password");
            if (!userData) {
                return res.status(401).json({
                    success: false,
                    message: "Recruiter not found",
                });
            }
        } else if (req.user.role === "admin") {
            // Hardcoded admin user
            if (req.user.userId !== "admin_default_id") {
                return res.status(401).json({
                    success: false,
                    message: "Invalid admin token",
                });
            }

            userData = {
                _id: "admin_default_id",
                email: "admin@gmail.com",
                fullname: "Admin",
                role: "admin",
            };
        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid user role",
            });
        }

        return res.status(200).json({
            success: true,
            data: userData,
        });
    } catch (error) {
        console.error("Check Auth Error:", error);
        return res.status(500).json({
            success: false,
            message: "Error checking authentication",
        });
    }
});

  

// Student specific routes
router.route("/student/signup").post(upload, sregister);
router.route("/student/profile/update").post(isAuthenticated, upload, updateProfile);
router.route('/student/students').get(isAuthenticated, getAllStudents);
router.delete("/student/:id", isAuthenticated, isaAdmin, deleteStudent);

// Get single student profile - moved after specific routes
router.get("/student/:id", isAuthenticated, async (req, res) => {
    try {
        const student = await Student.findById(req.params.id).select("-password");
        if (!student) {
            throw new ApiError(404, "Student not found");
        }
        return res.status(200).json(
            new ApiResponse(200, student, "Student profile fetched successfully")
        );
    } catch (error) {
        throw new ApiError(500, error.message || "Error fetching student profile");
    }
});

// Recruiter routes
router.route("/recruiter/signup").post(upload, recregister);
router.route("/recruiter/recruiters").get(isAuthenticated, getAllRecruiters);
router.delete("/recruiter/:id", isAuthenticated, isaAdmin, deleteRecruiter);

// Get all students - moved to the end
router.get("/students", isAuthenticated, async (req, res) => {
    try {
        const students = await Student.find()
            .select("-password")
            .select("fullname email profile role");

        return res.status(200).json(
            new ApiResponse(200, students, "Students fetched successfully")
        );
    } catch (error) {
        throw new ApiError(500, error.message || "Error fetching students");
    }
});
router.get('/recruiter/profile/:id', isAuthenticated, getRecruiterProfile);
router.get('/recruiter/:id/jobs', isAuthenticated, getRecruiterJobs);

// Save/Unsave job route
router.post("/save-job/:jobId", isAuthenticated, async (req, res) => {
  try {
    const { jobId } = req.params;
    const studentId = req.user._id;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    const jobIndex = student.savedJobs.indexOf(jobId);
    const isSaved = jobIndex === -1;

    if (isSaved) {
      student.savedJobs.push(jobId);
    } else {
      student.savedJobs.splice(jobIndex, 1);
    }

    await student.save();

    res.status(200).json({
      success: true,
      isSaved,
      message: isSaved ? "Job saved successfully" : "Job removed from saved jobs"
    });

  } catch (error) {
    console.error("Save job error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save job"
    });
  }
});

export default router;

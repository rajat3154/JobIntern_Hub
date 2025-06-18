import { Student } from "../models/student.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Recruiter } from "../models/recruiter.model.js";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import RecruiterRequest from "../models/recruiterrequest.model.js";
import { Job } from "../models/job.model.js";
import { ApiError } from "../utils/ApiError.js";
export const recregister = async (req, res) => {
      try {
            const { companyname, email, cinnumber, password, companyaddress, role } = req.body;
            if (!companyname || !email || !cinnumber || !password || !companyaddress) {
                  return res.status(400).json({
                        message: "All fields are required",
                        success: false
                  });
            }
            if (!req.files || !req.files.file || req.files.file.length === 0) {
                  return res.status(400).json({
                        message: "Profile photo is required",
                        success: false,
                  });
            }

            // ✅ Access the file
            const file = req.files.file[0];
            const fileUri = getDataUri(file);
            const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
            if (role !== "recruiter") {
                  return res.status(400).json({
                        message: "Invalid role",
                        success: false
                  });
            }
            // Check for existing recruiters
            const existingRequest = await RecruiterRequest.findOne({ email });
            const recruiterExists = await Recruiter.findOne({ email });
            if (recruiterExists) {
                  return res.status(400).json({
                        message: "Email already exists",
                        success: false
                  });
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            await RecruiterRequest.create({
                  companyname,
                  email,
                  cinnumber,
                  password: hashedPassword,
                  companyaddress,
                  role: "recruiter",
                  profile: {
                        profilePhoto: cloudResponse.secure_url,
                  }
            });
            return res.status(201).json({
                  message: "Registration submitted for approval",
                  success: true,
            });

      } catch (error) {
            console.error("Error in register", error);
            return res.status(500).json({
                  message: "Internal server error",
                  success: false,
                  error: error.message,
            });
      }
};
export const getAllRecruiters = async (req, res) => {
      try {
            const recruiters = await Recruiter.find().sort({ createdAt: -1 });

            return res.status(200).json({
                  success: true,
                  recruiters,
            });
      } catch (error) {
            console.error("Error fetching recruiters:", error);
            return res.status(500).json({
                  success: false,
                  message: "Failed to fetch recruiters",
            });
      }
};

export const deleteRecruiter = async (req, res) => {
      try {
            const recruiterId = req.params.id;
            if (req.user.role !== "admin") {
                  return res.status(403).json({ message: "Access denied. Admins only." });
            }

            const deletedRecruiter = await Recruiter.findByIdAndDelete(recruiterId);

            if (!deletedRecruiter) {
                  return res.status(404).json({ message: "Recruiter not found." });
            }

            res.status(200).json({ message: "Recruiter deleted successfully." });
      } catch (error) {
            console.error("Error deleting recruiter:", error);
            res.status(500).json({ message: "Server error while deleting recruiter." });
      }
};


export const getRecruiterJobs = async (req, res) => {
      try {
            // Validate the recruiter ID
            if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
                  throw new ApiError(400, 'Invalid recruiter ID format');
            }

            // Find all jobs posted by this recruiter
            const jobs = await Job.find({ created_by: req.params.id })
               
                  .sort({ createdAt: -1 }); // Newest first

            if (!jobs || jobs.length === 0) {
                  return res.status(200).json(
                        new ApiResponse(200, { jobs: [] }, 'No jobs found for this recruiter')
                  );
            }

            return res.status(200).json(
                  new ApiResponse(200, { jobs }, 'Recruiter jobs fetched successfully')
            );
      } catch (error) {
            console.error('Error fetching recruiter jobs:', error);
            throw new ApiError(
                  error.statusCode || 500,
                  error.message || 'Failed to fetch recruiter jobs'
            );
      }
    };

export const getRecruiterProfile = async (req, res) => {
      try {
            const recruiter = await Recruiter.findById(req.params.id)
                  .select('-password -__v');

            if (!recruiter) {
                  return res.status(404).json({
                        success: false,
                        message: 'Recruiter not found'
                  });
            }

            res.status(200).json({
                  success: true,
                  data: recruiter
            });
      } catch (error) {
            res.status(500).json({
                  success: false,
                  message: error.message
            });
      }
};
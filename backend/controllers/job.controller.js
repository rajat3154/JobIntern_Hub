import { Job } from "../models/job.model.js";
import { Recruiter } from "../models/recruiter.model.js";
import { Student } from "../models/student.model.js";
import { Application } from "../models/application.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// Post a new job
export const postJob = asyncHandler(async (req, res) => {
    const { title, description, requirements, salary, experience, location, jobType, position, company } = req.body;
    const recruiterId = req.user._id;

    const recruiter = await Recruiter.findById(recruiterId);
    if (!recruiter) {
        throw new ApiError(404, "Recruiter not found");
    }

    const job = await Job.create({
        title,
        description,
        requirements,
        salary,
        experience,
        location,
        jobType,
        position,
        company,
        created_by: recruiterId
    });

    return res.status(201).json(new ApiResponse(201, job, "Job posted successfully"));
});

// Get all jobs with search functionality
export const getAllJobs = async (req, res) => {
    try {
        console.log("=== GET ALL JOBS DEBUG ===");
        console.log("User authenticated:", req.user);
        console.log("Query parameters:", req.query);
        
        const { search } = req.query;
        const query = search ? {
            $or: [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { company: { $regex: search, $options: 'i' } },
                { location: { $regex: search, $options: 'i' } }
            ]
        } : {};

        console.log("Database query:", query);

        const jobs = await Job.find(query)
            .populate('created_by', 'companyName companyLogo')
            .sort({ createdAt: -1 });

        console.log("Jobs found:", jobs.length);

        return res.status(200).json({
            success: true,
            data: jobs,
            message: jobs.length > 0 ? "Jobs fetched successfully" : "No jobs found"
        });
    } catch (error) {
        console.error("Get all jobs error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Error fetching jobs"
        });
    }
};

// Get job by ID
export const getJobById = asyncHandler(async (req, res) => {
    const { jobId } = req.params;

    const job = await Job.findById(jobId)
        .populate('created_by', 'companyName companyLogo')
        .populate('applications');

    if (!job) {
        throw new ApiError(404, "Job not found");
    }

    return res.status(200).json(new ApiResponse(200, job, "Job fetched successfully"));
});

// Get jobs posted by a specific recruiter
export const getRecruiterJobs = async (req, res) => {
    try {
        console.log("=== GET RECRUITER JOBS DEBUG ===");
        console.log("User authenticated:", req.user);
        
        const recruiterId = req.user._id;

        const jobs = await Job.find({ created_by: recruiterId })
            .populate('created_by', 'companyName companyLogo')
            .sort({ createdAt: -1 });

        console.log("Recruiter jobs found:", jobs.length);

        return res.status(200).json({
            success: true,
            data: jobs,
            message: jobs.length > 0 ? "Recruiter jobs fetched successfully" : "No jobs found for this recruiter"
        });
    } catch (error) {
        console.error("Get recruiter jobs error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Error fetching recruiter jobs"
        });
    }
};

// Get latest jobs (for homepage)
export const getLatestJobs = async (req, res) => {
    try {
        console.log("=== GET LATEST JOBS DEBUG ===");
        
        const jobs = await Job.find()
            .populate('created_by', 'companyName companyLogo')
            .sort({ createdAt: -1 })
            .limit(5);

        console.log("Latest jobs found:", jobs.length);

        return res.status(200).json({
            success: true,
            data: jobs,
            message: "Latest jobs fetched successfully"
        });
    } catch (error) {
        console.error("Get latest jobs error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Error fetching latest jobs"
        });
    }
};

// Check if a job is saved by a student
export const isJobSaved = async (req, res) => {
    try {
        console.log("=== IS JOB SAVED DEBUG ===");
        console.log("User authenticated:", req.user);
        console.log("Job ID:", req.params.id);
        
        const { id: jobId } = req.params;
        const studentId = req.user._id;

        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        const isSaved = student.savedJobs.includes(jobId);
        console.log("Job saved status:", isSaved);
        
        return res.status(200).json({
            success: true,
            data: { isSaved },
            message: "Job save status checked"
        });
    } catch (error) {
        console.error("Is job saved error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Error checking job save status"
        });
    }
};

// Save/unsave a job
export const saveJob = async (req, res) => {
    try {
        console.log("=== SAVE JOB DEBUG ===");
        console.log("User authenticated:", req.user);
        console.log("Job ID:", req.params.id);
        
        const { id: jobId } = req.params;
        const studentId = req.user._id;

        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        const jobIndex = student.savedJobs.indexOf(jobId);
        if (jobIndex === -1) {
            // Save job
            student.savedJobs.push(jobId);
            await student.save();
            console.log("Job saved successfully");
            return res.status(200).json({
                success: true,
                data: { isSaved: true },
                message: "Job saved successfully"
            });
        } else {
            // Unsave job
            student.savedJobs.splice(jobIndex, 1);
            await student.save();
            console.log("Job unsaved successfully");
            return res.status(200).json({
                success: true,
                data: { isSaved: false },
                message: "Job unsaved successfully"
            });
        }
    } catch (error) {
        console.error("Save job error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Error saving/unsaving job"
        });
    }
};

// Delete a job
export const deleteJobById = asyncHandler(async (req, res) => {
    const { jobId } = req.params;
    const recruiterId = req.user._id;

    const job = await Job.findById(jobId);
    if (!job) {
        throw new ApiError(404, "Job not found");
    }

    // Check if the job belongs to the recruiter
    if (job.created_by.toString() !== recruiterId.toString()) {
        throw new ApiError(403, "You are not authorized to delete this job");
    }

    // Delete all applications associated with this job
    await Application.deleteMany({ job: jobId });

    // Delete the job
    await Job.findByIdAndDelete(jobId);

    return res.status(200).json(new ApiResponse(200, null, "Job deleted successfully"));
});
    
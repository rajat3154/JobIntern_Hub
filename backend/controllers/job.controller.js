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
export const getAllJobs = asyncHandler(async (req, res) => {
    const { search } = req.query;
    const query = search ? {
        $or: [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { company: { $regex: search, $options: 'i' } },
            { location: { $regex: search, $options: 'i' } }
        ]
    } : {};

    const jobs = await Job.find(query)
        .populate('created_by', 'companyName companyLogo')
        .sort({ createdAt: -1 });

    if (!jobs.length) {
        return res.status(200).json(new ApiResponse(200, [], "No jobs found"));
    }

    return res.status(200).json(new ApiResponse(200, jobs, "Jobs fetched successfully"));
});

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
export const getRecruiterJobs = asyncHandler(async (req, res) => {
    const recruiterId = req.user._id;

    const jobs = await Job.find({ created_by: recruiterId })
        .populate('created_by', 'companyName companyLogo')
        .sort({ createdAt: -1 });

    if (!jobs.length) {
        return res.status(200).json(new ApiResponse(200, [], "No jobs found for this recruiter"));
    }

    return res.status(200).json(new ApiResponse(200, jobs, "Recruiter jobs fetched successfully"));
});

// Get latest jobs (for homepage)
export const getLatestJobs = asyncHandler(async (req, res) => {
    const jobs = await Job.find()
        .populate('created_by', 'companyName companyLogo')
        .sort({ createdAt: -1 })
        .limit(5);

    return res.status(200).json(new ApiResponse(200, jobs, "Latest jobs fetched successfully"));
});

// Check if a job is saved by a student
export const isJobSaved = asyncHandler(async (req, res) => {
    const { jobId } = req.params;
    const studentId = req.user._id;

    const student = await Student.findById(studentId);
    if (!student) {
        throw new ApiError(404, "Student not found");
    }

    const isSaved = student.savedJobs.includes(jobId);
    return res.status(200).json(new ApiResponse(200, { isSaved }, "Job save status checked"));
});

// Save/unsave a job
export const saveJob = asyncHandler(async (req, res) => {
    const { jobId } = req.params;
    const studentId = req.user._id;

    const student = await Student.findById(studentId);
    if (!student) {
        throw new ApiError(404, "Student not found");
    }

    const jobIndex = student.savedJobs.indexOf(jobId);
    if (jobIndex === -1) {
        // Save job
        student.savedJobs.push(jobId);
        await student.save();
        return res.status(200).json(new ApiResponse(200, null, "Job saved successfully"));
    } else {
        // Unsave job
        student.savedJobs.splice(jobIndex, 1);
        await student.save();
        return res.status(200).json(new ApiResponse(200, null, "Job unsaved successfully"));
    }
});

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
    
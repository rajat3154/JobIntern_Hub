import express from "express"; 
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { deleteJobById, getAllJobs, getJobById, getLatestJobs, getRecruiterJobs, isJobSaved, postJob, saveJob } from "../controllers/job.controller.js";
import { Job } from "../models/job.model.js";
import { Student } from "../models/student.model.js";

const router = express.Router();

// Test endpoint to check if jobs exist
router.route("/test").get(async (req, res) => {
  try {
    console.log("=== TEST JOBS ENDPOINT ===");
    const jobs = await Job.find().limit(5);
    console.log("Jobs found:", jobs.length);
    console.log("Job IDs:", jobs.map(job => job._id));
    
    return res.status(200).json({
      success: true,
      data: {
        totalJobs: jobs.length,
        jobs: jobs.map(job => ({ id: job._id, title: job.title }))
      },
      message: "Test endpoint working"
    });
  } catch (error) {
    console.error("Test endpoint error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.route("/post").post(isAuthenticated, postJob);
router.route("/get").get(isAuthenticated, getAllJobs);
router.route("/get/:id").get(getJobById);
router.route("/recruiter-jobs").get(isAuthenticated, getRecruiterJobs);
router.route("/latest").get(getLatestJobs); 
router.route("/is-saved/:id").get(isAuthenticated, isJobSaved);
router.route("/save-job/:id").post(isAuthenticated, saveJob);
router.route("/delete/:id").delete(isAuthenticated, deleteJobById);

// Get all saved jobs for a student
router.route("/saved").get(isAuthenticated, async (req, res) => {
  try {
    const student = await Student.findById(req.user._id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    // Get all saved jobs with populated recruiter information
    const savedJobs = await Job.find({ _id: { $in: student.savedJobs } })
      .populate({
        path: 'created_by',
        select: 'companyName companyLogo'
      });

    res.status(200).json({
      success: true,
      savedJobs
    });
  } catch (error) {
    console.error("Error fetching saved jobs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch saved jobs"
    });
  }
});

export default router;
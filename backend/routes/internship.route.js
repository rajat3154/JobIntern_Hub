import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { getAllInternships, getInternshipById, getInternshipsByRecruiter, postInternship, getLatestInternships, isInternshipSaved, saveInternship, deleteInternship} from "../controllers/internship.controller.js";
import { Internship } from "../models/internship.model.js";
import { Student } from "../models/student.model.js";

const router = express.Router();
router.route("/post").post(isAuthenticated, postInternship);
router.route("/recruiter").get(isAuthenticated, getInternshipsByRecruiter);
router.route("/get").get(async (req, res) => {
  try {
    const internships = await Internship.find()
      .populate("recruiter", "companyname email profile")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      internships
    });
  } catch (error) {
    console.error("Error fetching internships:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch internships"
    });
  }
});
router.route("/latest").get(async (req, res) => {
  try {
    const internships = await Internship.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("created_by", "companyname profile.profilePhoto");

    res.status(200).json({
      success: true,
      internships
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch internships"
    });
  }
});

router.route("/get/:id").get(isAuthenticated,getInternshipById);
router.route("/is-saved-internship/:id").get(isAuthenticated, isInternshipSaved);
router.route("/save-internship/:id").post(isAuthenticated, saveInternship);
router.route("/delete/:id").delete(isAuthenticated, deleteInternship);

// Get all saved internships for a student
router.route("/saved").get(isAuthenticated, async (req, res) => {
  try {
    const student = await Student.findById(req.user._id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    // Get all saved internships with populated recruiter information
    const savedInternships = await Internship.find({ _id: { $in: student.savedInternships } })
      .populate({
        path: 'recruiter',
        select: 'companyname profile.profilePhoto'
      });

    res.status(200).json({
      success: true,
      savedInternships
    });
  } catch (error) {
    console.error("Error fetching saved internships:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch saved internships"
    });
  }
});

export default router;

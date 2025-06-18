import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
      applyInternship,
      applyJob,
      getApplicants,
      getAppliedInternships,
      getAppliedJobs,
      getInternshipApplicants,

      updateStatus,

      updateInternshipApplicationStatus,
} from "../controllers/application.controller.js";
const router = express.Router();
router.route("/apply/:id").post(isAuthenticated, applyJob);
router.route("/apply/intern/:id").post(isAuthenticated, applyInternship);
router.route("/get").get(isAuthenticated, getAppliedJobs);
router.route("/internships/get").get(isAuthenticated, getAppliedInternships);
router.route("/status/:id/update").post(isAuthenticated, updateStatus);
router.route("/internship/status/:id/update").post(isAuthenticated, updateInternshipApplicationStatus);
// router.route("/internship/update-status/:id").post(isAuthenticated, updateInternshipApplicationStatus);
router.route("/:id/applicants").get(isAuthenticated, getApplicants);
router.route("/internship/:id/applicants").get(isAuthenticated, getInternshipApplicants);

export default router;

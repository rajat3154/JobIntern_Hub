// routes/admin.routes.js
import express from "express";
import {
      getRecruiterRequests,
      approveRecruiter,
      rejectRecruiter,
} from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/recruiter-requests", getRecruiterRequests);
router.post("/recruiter-requests/:id/approve", approveRecruiter);
router.delete("/recruiter-requests/:id/reject", rejectRecruiter);

export default router;

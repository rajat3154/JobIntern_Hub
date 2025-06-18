import { Router } from "express";
import { Recruiter } from "../models/recruiter.model.js";

const router = Router();

// Get all recruiters
router.get("/", async (req, res) => {
    try {
        console.log("Recruiters route - Fetching all recruiters");
        
        const recruiters = await Recruiter.find()
            .select("-password")
            .select("companyname email profile role");

        console.log("Recruiters route - Found recruiters:", recruiters.length);

        return res.status(200).json({
            success: true,
            data: recruiters,
            message: "Recruiters fetched successfully"
        });
    } catch (error) {
        console.error("Recruiters route error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Error fetching recruiters"
        });
    }
});

export default router; 
import { Router } from "express";
import { Recruiter } from "../models/recruiter.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const router = Router();

// Get all recruiters
router.get("/", async (req, res) => {
    try {
        const recruiters = await Recruiter.find()
            .select("-password")
            .select("companyname email profile role");

        return res.status(200).json(
            new ApiResponse(200, recruiters, "Recruiters fetched successfully")
        );
    } catch (error) {
        throw new ApiError(500, error.message || "Error fetching recruiters");
    }
});

export default router; 
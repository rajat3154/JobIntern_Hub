// controllers/admin.controller.js
import { Recruiter } from "../models/recruiter.model.js";
import RecruiterRequest from "../models/recruiterrequest.model.js";
import bcrypt from "bcryptjs";

export const getRecruiterRequests = async (req, res) => {
      try {
            const requests = await RecruiterRequest.find({ status: "pending" });
            res.status(200).json({ success: true, requests });
      } catch (error) {
            res.status(500).json({ success: false, message: "Failed to fetch requests" });
      }
};

export const approveRecruiter = async (req, res) => {
      try {
            const request = await RecruiterRequest.findById(req.params.id);
            if (!request) {
                  return res
                        .status(404)
                        .json({ success: false, message: "Request not found" });
            }

            const existing = await Recruiter.findOne({ email: request.email });
            if (existing) {
                  return res
                        .status(400)
                        .json({ success: false, message: "Recruiter already exists" });
            }

            const recruiter = new Recruiter({
                  companyname: request.companyname,
                  email: request.email,
                  cinnumber: request.cinnumber,
                  companyaddress: request.companyaddress,
                  companystatus: request.companystatus || "Active",
                  role: "recruiter",
                  password: request.password,
                  profile: {
                        profilePhoto: request.profile?.profilePhoto || "" // Include profile photo
                  }
            });

            await recruiter.save();

            await RecruiterRequest.findByIdAndDelete(req.params.id);

            res.status(200).json({
                  success: true,
                  message: "Recruiter approved",
                  recruiter: {
                        _id: recruiter._id,
                        companyname: recruiter.companyname,
                        email: recruiter.email,
                        profile: {
                              profilePhoto: recruiter.profile?.profilePhoto || ""
                        }
                  }
            });
      } catch (error) {
            console.error("Error approving recruiter:", error);
            res.status(500).json({ success: false, message: "Internal Server Error" });
      }
};


export const rejectRecruiter = async (req, res) => {
      try {
            await RecruiterRequest.findByIdAndDelete(req.params.id, {
                  status: "rejected",
            });
            res.status(200).json({ success: true, message: "Recruiter rejected" });
      } catch (error) {
            res.status(500).json({ success: false, message: "Failed to reject recruiter" });
      }
};

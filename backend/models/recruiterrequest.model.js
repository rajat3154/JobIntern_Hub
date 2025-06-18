// models/recruiterrequest.model.js
import mongoose from "mongoose";

const recruiterRequestSchema = new mongoose.Schema(
      {
            companyname: {
                  type: String,
                  required: true,
            },
            email: {
                  type: String,
                  required: true,
                  unique: true,
            },
            cinnumber: {
                  type: Number,
                  required: true,
            },
            companyaddress: {
                  type: String,
                  required: true,
            },
            companystatus: {
                  type: String,
                  default: "Active",
            },
            password: {
                  type: String,
                  required: true,
            },
            status: {
                  type: String,
                  enum: ["pending", "approved", "rejected"],
                  default: "pending",
            },
            profile: {
                  profilePhoto: {
                        type: String,
                        default: ""
                  }
            },
      },
      { timestamps: true }
);

export default mongoose.model("RecruiterRequest", recruiterRequestSchema);

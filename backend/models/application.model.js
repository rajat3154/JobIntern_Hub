import mongoose, { Mongoose } from "mongoose";
const applicationSchema = new mongoose.Schema({
      applicant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student', // ✅ FIXED: Match the populate model
            required: true
      },
      job: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
            required: false
      },
      internship: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Internship",
            required: false // ✅ New field
          },
      status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending'
      }
}, { timestamps: true });
export const Application = mongoose.model("Application", applicationSchema);
import mongoose from "mongoose";

const internshipSchema = new mongoose.Schema({
      title: { type: String, required: true },
      description: { type: String, required: true },
      duration: { type: String, required: true },      
      stipend: { type: String, required: true },        
      location: { type: String, required: true },
      type: { type: String, enum: ["Remote", "In-office", "Hybrid"], default: "Remote" },
      skills: [{ type: String }],                         
      recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'Recruiter', required: true },
      applications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Application' }],
      created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Recruiter",
        required: true
      }
}, { timestamps: true });

export const Internship = mongoose.model("Internship", internshipSchema);

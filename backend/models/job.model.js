import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
      title: { type: String, required: true },
      description: { type: String, required: true },
      requirements: [{ type: String }],
      salary: { type: String, required: true },
      experience: { type: String, required: true },
      location: { type: String, required: true },
      jobType: { type: String, required: true },
      position: { type: Number, required: true },
      created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Recruiter', required: true },
      company: { type: String, required: true },
      applications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Application' }]
}, { timestamps: true });

export const Job = mongoose.model("Job", jobSchema);

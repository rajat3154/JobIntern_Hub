import mongoose from "mongoose"
const studentSchema = new mongoose.Schema({
      fullname: {
            type: String,
            required: true
      },
      email: {
            type: String,
            required: true,
            unique: true
      },
      phonenumber: {
            type: Number,
            required: true
      },
      password: {
            type: String,
            required: true
      },
      role: {
            type: String,
            default: "student",
      },
      lastSeen: {
            type: Date,
            default: Date.now
      },
      status: {
            type: String,
            enum: ['fresher', 'experienced'],
            required: true
      },
      following: [{
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'followingType'
      }],
      followingType: [{
            type: String,
            enum: ['Student', 'Recruiter']
      }],
      followers: [{
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'followersType'
      }],
      followersType: [{
            type: String,
            enum: ['Student', 'Recruiter']
      }],
      profile: {
            bio: { type: String },
            skills: [{ type: String }],
            resume: { type: String },
            resumeOriginalName: { type: String },
            company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
            profilePhoto: {
                  type: String,
                  default: "PP"
            }
      },
      savedJobs: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Job'
      }],
      savedInternships: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Internship'
      }]
}, { timestamps: true })

export const Student = mongoose.model('Student', studentSchema);
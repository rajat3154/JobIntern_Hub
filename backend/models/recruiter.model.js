import mongoose from "mongoose";

const recruiterSchema = new mongoose.Schema(
      {
            companyname: {
                  type: String,
                  required: true
            },
            email: {
                  type: String,
                  required: true,
                  unique: true,
            },
            cinnumber: {
                  type: String,
                  required: true
            },
            companyaddress: {
                  type: String,
                  required: true
            },

            role: {
                  type: String,
                  default: "recruiter",
                  immutable: true,
            },
            lastSeen: {
                  type: Date,
                  default: Date.now
            },
            password: {
                  type: String,
                  required: true
            },            profile: {
                  profilePhoto: {
                        type: String,
                        default: ""
                  },
                  bio: { type: String },
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
      },
      {
            timestamps: true,
      }
);
export const Recruiter = mongoose.model("Recruiter", recruiterSchema);
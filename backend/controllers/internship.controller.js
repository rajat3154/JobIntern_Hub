import { Internship } from "../models/internship.model.js"; // Adjust path if needed
import { Student } from "../models/student.model.js";




export const postInternship = async (req, res) => {
      try {
            const {
                  title,
                  description,
                  duration,
                  stipend,
                  location,
                  type,
                  skills,
            } = req.body;

            const recruiterId = req.user._id; // Use _id, not id

            if (!title || !description || !duration || !stipend || !location || !type || !skills) {
                  return res.status(400).json({
                        message: "Please fill in all fields",
                        success: false,
                  });
            }

            const skillsArray = Array.isArray(skills)
                  ? skills
                  : skills.split(",").map(skill => skill.trim());

            const internship = await Internship.create({
                  title,
                  description,
                  duration,
                  stipend,
                  location,
                  type,
                  skills: skillsArray,
                  recruiter: recruiterId,
                  created_by: recruiterId,  // << Add this line!
            });

            return res.status(201).json({
                  message: "Internship posted successfully",
                  success: true,
                  internship,
            });
      } catch (error) {
            console.error("Error posting internship:", error);
            return res.status(500).json({
                  message: "Server error",
                  success: false,
            });
      }
};
    
export const getAllInternships = async (req, res) => {
      try {
            const internships = await Internship.find({})
                  .populate({
                        path: "recruiter",
                        select: "companyname email companyaddress companystatus"
                  })
                  .sort({ createdAt: -1 });

            if (!internships || internships.length === 0) {
                  return res.status(404).json({
                        message: "No internships found",
                        success: false,
                  });
            }

            return res.status(200).json({
                  message: "Internships fetched successfully",
                  internships,
                  success: true,
            });

      } catch (error) {
            console.log(error);
            return res.status(500).json({
                  message: "Server error",
                  success: false,
            });
      }
};

export const getInternshipById = async (req, res) => {
      try {
            const internshipId = req.params.id;
            const userId = req.user?._id;

            console.log("Received internshipId:", internshipId);

            const internship = await Internship.findById(internshipId).populate({
                  path: "applications",
                  populate: {
                        path: "applicant",
                        model: "Student",
                        select: "fullname email resumeUrl"
                  }
            });

            if (!internship) {
                  return res.status(404).json({
                        message: "Internship not found",
                        success: false
                  });
            }

            let currentUserApplication = null;
            if (userId) {
                  const userApp = internship.applications.find(
                        (app) =>
                              app.applicant &&
                              app.applicant._id.toString() === userId.toString()
                  );
                  if (userApp) {
                        currentUserApplication = {
                              status: userApp.status,
                              appliedDate: userApp.createdAt
                        };
                  }
            }

            return res.status(200).json({
                  internship,
                  currentUserId: userId || null,
                  currentUserApplication,
                  success: true
            });
      } catch (error) {
            console.log(error);
            return res.status(500).json({
                  message: "Failed to fetch internship",
                  success: false,
                  error: error.message
            });
      }
};
    


export const getInternshipsByRecruiter = async (req, res) => {
      try {
            const recruiterId = req.user._id;
            const internships = await Internship.find({ recruiter: recruiterId })
                  .populate({
                        path: "recruiter",
                        select: "companyname email companyaddress companystatus",
                  })
                  .sort({ createdAt: -1 });

            if (!internships || internships.length === 0) {
                  return res.status(404).json({
                        message: "No internships found for this recruiter",
                        success: false,
                        internships: [],
                  });
            }

            return res.status(200).json({
                  message: "Internships posted by recruiter",
                  internships,
                  success: true,
            });
      } catch (error) {
            console.error("Error fetching internships:", error);
            return res.status(500).json({
                  message: "Server error",
                  success: false,
            });
      }
};

export const getLatestInternships = async (req, res) => {
      try {
            const internships = await Internship.find()
                  .sort({ createdAt: -1 })
                  .limit(5)
                  .populate('created_by', 'companyname profile.profilePhoto');

            res.status(200).json({
                  success: true,
                  internships
            });
      } catch (error) {
            console.error("Failed to fetch latest internships:", error);
            res.status(500).json({
                  success: false,
                  message: "Failed to fetch latest internships"
            });
      }
};
export const isInternshipSaved = async (req, res) => {
      try {
            const internshipId = req.params.id;
            const userId = req.user._id;

            const student = await Student.findById(userId);
            if (!student) {
                  return res.status(404).json({
                        success: false,
                        message: "Student not found"
                  });
            }

            const isSaved = student.savedInternships.includes(internshipId);
            return res.status(200).json({
                  success: true,
                  isSaved
            });
      } catch (error) {
            console.error("Error checking saved internship status:", error);
            return res.status(500).json({
                  success: false,
                  message: "Error checking saved status"
            });
      }
};

export const saveInternship = async (req, res) => {
      try {
            const internshipId = req.params.id;
            const userId = req.user._id;

            const student = await Student.findById(userId);
            if (!student) {
                  return res.status(404).json({
                        success: false,
                        message: "Student not found"
                  });
            }

            const isAlreadySaved = student.savedInternships.includes(internshipId);
            if (isAlreadySaved) {
                  // If already saved, remove it (unsave)
                  student.savedInternships = student.savedInternships.filter(id => id.toString() !== internshipId);
                  await student.save();
                  return res.status(200).json({
                        success: true,
                        isSaved: false,
                        message: "Internship unsaved successfully"
                  });
            } else {
                  // If not saved, add it
                  student.savedInternships.push(internshipId);
                  await student.save();
                  return res.status(200).json({
                        success: true,
                        isSaved: true,
                        message: "Internship saved successfully"
                  });
            }
      } catch (error) {
            console.error("Error saving/unsaving Internship:", error);
            return res.status(500).json({
                  success: false,
                  message: "Error saving/unsaving Internship"
            });
      }
};
export const deleteInternship = async (req, res) => {
      try {
            const internshipId = req.params.id;
            const userId = req.user._id;

            // Check if the internship exists and belongs to the recruiter
            const internship = await Internship.findOne({ _id: internshipId, recruiter: userId });

            if (!internship) {
                  return res.status(404).json({
                        success: false,
                        message: "Internship not found or unauthorized to delete",
                  });
            }

            await Internship.findByIdAndDelete(internshipId);

            return res.status(200).json({
                  success: true,
                  message: "Internship deleted successfully",
            });
      } catch (error) {
            console.error("Error deleting internship:", error);
            return res.status(500).json({
                  success: false,
                  message: "Failed to delete internship",
            });
      }
};
    
import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import { Student } from "../models/student.model.js"; 
import { Notification } from "../models/Notification.js";
import { getIO } from "../socket/socket.js";
import { Internship } from "../models/internship.model.js";

export const applyJob = async (req, res) => {
      try {
            const jobId = req.params.id;
            const userId = req.user._id;

            // Check if already applied
            const existingApplication = await Application.findOne({
                  job: jobId,
                  applicant: userId
            });

            if (existingApplication) {
                  return res.status(400).json({
                        success: false,
                        message: "You have already applied for this job"
                  });
            }

            const job = await Job.findById(jobId).populate('created_by');
            if (!job) {
                  return res.status(404).json({
                        success: false,
                        message: "Job not found"
                  });
            }

            const student = await Student.findById(userId);
            if (!student) {
                  return res.status(404).json({
                        success: false,
                        message: "Student not found"
                  });
            }

            const application = await Application.create({
                  job: jobId,
                  applicant: userId,
                  status: 'pending',
                  ...req.body
            });

            await Job.findByIdAndUpdate(jobId, {
                  $addToSet: { applications: application._id }
            });

            const notification = await Notification.create({
                  recipient: job.created_by._id,
                  sender: userId,
                  senderModel: 'Student',
                  type: 'application',
                  title: 'New Job Application',
                  message: `${student.fullname} applied for "${job.title}"`,
                  read: false
            });

            const io = getIO();
            if (io) {
                  io.to(job.created_by._id.toString()).emit('newNotification', notification);
            }

            return res.status(201).json({
                  success: true,
                  message: "Application submitted successfully",
                  application
            });
      } catch (error) {
            console.error("Application error:", error);
            return res.status(500).json({
                  success: false,
                  message: "Failed to submit application",
                  error: error.message
            });
      }
    };
export const applyInternship = async (req, res) => {
      try {
            const internshipId = req.params.id;
            const userId = req.user._id;
            console.log("USER:", req.user);
            console.log("Internship ID:", internshipId);
            console.log("Creating application...");

            const internship = await Internship.findById(internshipId).populate('created_by');
            if (!internship) {
                  return res.status(404).json({
                        success: false,
                        message: "Internship not found"
                  });
            }

            const student = await Student.findById(userId);
            if (!student) {
                  return res.status(404).json({
                        success: false,
                        message: "Student not found"
                  });
            }

            // ✅ Check for duplicate application
            const existingApplication = await Application.findOne({
                  internship: internshipId,
                  applicant: userId
            });

            if (existingApplication) {
                  return res.status(400).json({
                        success: false,
                        message: "You have already applied to this internship"
                  });
            }

            const application = await Application.create({
                  internship: internshipId,
                  applicant: userId,
                  status: 'pending',
                  ...req.body
            });

            await Internship.findByIdAndUpdate(internshipId, {
                  $addToSet: { applications: application._id }
            });

            const notification = await Notification.create({
                  recipient: internship.created_by._id,
                  sender: userId,
                  senderModel: 'Student',
                  type: 'application',
                  title: 'New Internship Application',
                  message: `${student.fullname} applied for "${internship.title}"`,
                  read: false
            });

            console.log("Application created:", application);

            const io = req.app.get('io');
            if (io) {
                  io.to(internship.created_by._id.toString()).emit('newNotification', notification);
            } else {
                  console.warn("Socket.io not available for notification");
            }

            return res.status(201).json({
                  success: true,
                  message: "Application submitted successfully",
                  application
            });

      } catch (error) {
            console.log(error);
            return res.status(500).json({
                  success: false,
                  message: "Failed to submit application",
                  error: error.message
            });
      }
};
    
export const getAppliedJobs = async (req, res, next) => {
      try {
            const userId = req.user._id;
            console.log("Fetching applications for userId:", userId);

            const applications = await Application.find({ applicant: userId })
                  .populate({
                        path: 'job',
                        model: 'Job',
                        populate: {
                              path: 'created_by',
                              model: 'Recruiter',
                              select: 'companyname'
                        }
                  })
                  .sort({ createdAt: -1 });

            // Filter out applications with missing or null job reference
            const filteredApplications = applications.filter(app => app.job);

            console.log("Filtered applications:", JSON.stringify(filteredApplications, null, 2));

            return res.status(200).json({
                  success: true,
                  appliedJobs: filteredApplications
            });
      } catch (error) {
            console.error("Error in getAppliedJobs:", error);
            next(error);
      }
};
    
export const getAppliedInternships = async (req, res, next) => {
      try {
            const userId = req.user._id;

            const applications = await Application.find({ applicant: userId })
                  .populate({
                        path: 'internship',
                        populate: {
                              path: 'recruiter',
                              select: 'companyname email profilePhoto'
                        }
                  })
                  .sort({ createdAt: -1 });

            // Filter applications with valid internship
            const filteredApplications = applications.filter(app => app.internship);

            // Format the response data
            const formattedApplications = filteredApplications.map(app => ({
                  _id: app._id,
                  status: app.status,
                  appliedAt: app.createdAt,
                  internship: {
                        _id: app.internship._id,
                        title: app.internship.title,
                        location: app.internship.location,
                        duration: app.internship.duration,
                        salary: app.internship.salary,
                        recruiter: {
                              _id: app.internship.recruiter?._id,
                              companyname: app.internship.recruiter?.companyname,
                              profilePhoto: app.internship.recruiter?.profilePhoto
                        }
                  }
            }));

            return res.status(200).json({
                  success: true,
                  applications: formattedApplications
            });
      } catch (error) {
            console.error("Error fetching applied internships:", error);
            next(error);
      }
};
    

export const getApplicants = async (req, res) => {
      const job = await Job.findById(req.params.id)
            .populate({
                  path: "applications",
                  populate: {
                        path: "applicant",
                        model: "Student",
                  },
            });

      return res.status(200).json({
            job,
            applicants: job.applications.map(app => app.applicant),
            success: true,
      });
};
export const getInternshipApplicants = async (req, res) => {
      const internship = await Internship.findById(req.params.id)
            .populate({
                  path: "applications",
                  populate: {
                        path: "applicant",
                        model: "Student",
                  },
            });
      return res.status(200).json({
            internship,
            applicants: internship.applications.map(app => app.applicant),
            success: true,
      });
};
export const updateStatus = async (req, res) => {
      try {
            const { status } = req.body;
            const applicationId = req.params.id;

            if (!status) {
                  return res
                        .status(400)
                        .json({ message: "Status is required", success: false });
            }

            // Find the application
            const application = await Application.findById(applicationId)
                  .populate("job")
                  .populate("applicant");

            if (!application) {
                  return res
                        .status(404)
                        .json({ message: "Application not found", success: false });
            }

            // Update status
            application.status = status.toLowerCase();
            await application.save();

            // Create notification to send to the student
            const notification = await Notification.create({
                  recipient: application.applicant._id, // Send to student
                  sender: application.job.created_by,   // Recruiter (assuming this is populated)
                  senderModel: 'Recruiter',
                  type: 'application',
                  title: 'Application Status Updated',
                  message: `Your application for "${application.job.title}" has been ${status.toLowerCase()}.`,
                  read: false,
            });

            // Send notification through socket
            const io = getIO();
            if (io) {
                  io.to(application.applicant._id.toString()).emit('newNotification', notification);
            }

            return res
                  .status(200)
                  .json({ message: "Status updated successfully", success: true });

      } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Server error", success: false });
      }
};

// New controller function for internship application status update
export const updateInternshipApplicationStatus = async (req, res) => {
  try {
    console.log("Received updateInternshipApplicationStatus request");
    console.log("Request params:", req.params);
    console.log("Request body:", req.body);

    const { status } = req.body;
    const applicationId = req.params.id;
    if (!status) {
      console.log("Status missing in request body");
      return res.status(400).json({ message: "Status is required", success: false });
    }

    const application = await Application.findById(applicationId)
      .populate("internship")
      .populate("applicant");

    if (!application) {
      console.log("Application not found for ID:", applicationId);
      return res.status(404).json({ message: "Application not found", success: false });
    }

    application.status = status.toLowerCase();
    await application.save();

    const notification = await Notification.create({
      recipient: application.applicant._id,
      sender: application.internship.created_by,
      senderModel: 'Recruiter',
      type: 'application',
      title: 'Application Status Updated',
      message: `Your application for "${application.internship.title}" has been ${status.toLowerCase()}.`,
      read: false,
    });

    const io = getIO();
    if (io) {
      io.to(application.applicant._id.toString()).emit('newNotification', notification);
    }

    console.log("Status updated successfully for application ID:", applicationId);
    return res.status(200).json({ message: "Status updated successfully", success: true });
  } catch (error) {
    console.error("Error in updateInternshipApplicationStatus:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

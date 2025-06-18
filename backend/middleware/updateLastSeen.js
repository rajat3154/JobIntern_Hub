import { Student } from "../models/student.model.js";
import { Recruiter } from "../models/recruiter.model.js";

export const updateLastSeen = async (req, res, next) => {
  try {
    if (!req.user) {
      return next();
    }

    const { _id, role } = req.user;
    const Model = role === 'student' ? Student : Recruiter;

    await Model.findByIdAndUpdate(_id, {
      lastSeen: new Date()
    });

    next();
  } catch (error) {
    console.error('Error updating last seen:', error);
    next();
  }
}; 
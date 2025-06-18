import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Button } from "./ui/button";
import {
  Bookmark,
  Briefcase,
  Clock,
  IndianRupee,
  MapPin,
  Zap,
} from "lucide-react";
import { Avatar } from "@radix-ui/react-avatar";
import { AvatarImage } from "./ui/avatar";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Job = ({ job }) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const handleViewDetails = () => {
    console.log("Current user role:", user.role); // Add logging to debug
    if (user?.role?.toLowerCase() === "student") {
      navigate(`/job-description/${job._id}`);
    } else if (user?.role?.toLowerCase() === "recruiter") {
      navigate(`/job-details/${job._id}`);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative bg-white/5 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/10 hover:border-blue-400/30 transition-all duration-300 group overflow-hidden"
    >
      {/* Hover effect overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
          isHovered ? "pointer-events-none" : ""
        }`}
      />

      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3 text-blue-100/80">
          <div className="flex items-center gap-1.5 text-sm">
            <Clock className="w-4 h-4" />
            <span>{job?.postedDate || "2d ago"}</span>
          </div>
          {job?.featured && (
            <span className="px-2 py-1 bg-amber-400/10 text-amber-400 rounded-full text-xs font-medium flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Featured
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSaved(!isSaved)}
          className="text-blue-100/60 hover:text-blue-400 hover:bg-white/5 rounded-xl"
        >
          <Bookmark
            className={`w-5 h-5 transition-all ${
              isSaved ? "fill-blue-400" : "fill-transparent"
            }`}
          />
        </Button>
      </div>

      {/* Company Section */}
      <div className="flex items-center gap-4 mb-8">
        <Avatar className="relative">
          <AvatarImage
            src={job?.company?.logo}
            className="w-12 h-12 rounded-xl bg-white/5 border border-white/10"
          />
        </Avatar>
        <div>
          <h1 className="font-semibold text-xl text-blue-50">
            {job?.company?.name}
          </h1>
          <div className="flex items-center gap-2 text-blue-100/60 text-sm">
            <MapPin className="w-4 h-4" />
            <span>{job?.location || "Remote"}</span>
          </div>
        </div>
      </div>

      {/* Job Content */}
      <div className="space-y-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          {job?.title}
        </h1>

        <p className="text-blue-100/70 leading-relaxed">{job?.description}</p>

        {/* Highlights */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
            <Briefcase className="w-6 h-6 text-cyan-400" />
            <div>
              <p className="text-sm text-blue-100/60">Type</p>
              <p className="font-medium text-blue-50">{job?.jobType}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
            <IndianRupee className="w-6 h-6 text-purple-400" />
            <div>
              <p className="text-sm text-blue-100/60">Package</p>
              <p className="font-medium text-blue-50">{job?.salary} LPA</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="mt-8 pt-6 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-blue-100/60">Open Positions:</span>
            <span className="font-medium text-blue-50">{job?.position}</span>
          </div>

          <Button
            onClick={handleViewDetails}
            className="bg-blue-500/90 hover:bg-blue-400 text-white rounded-xl px-6 py-4 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all"
          >
            View Details
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default Job;

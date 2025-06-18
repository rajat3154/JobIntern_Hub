import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import profilePic from "./assets/a.jpg";
import { toast } from "sonner";
import { Bookmark, BookmarkCheck } from "lucide-react";

const LatestInternshipCards = ({ internship }) => {
  const navigate = useNavigate();
  const { user } = useSelector((store) => store.auth);
  const [isSaved, setIsSaved] = useState(false);

  // Check saved status on mount
  useEffect(() => {
    const checkSavedStatus = async () => {
      if (!user) return;
      try {
        const res = await fetch(
          `http://localhost:8000/api/v1/internship/is-saved-internship/${internship._id}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );

        if (res.ok) {
          const data = await res.json();
          setIsSaved(data.isSaved);
        }
      } catch (error) {
        console.error("Error checking saved internship:", error);
      }
    };

    checkSavedStatus();
  }, [internship._id, user]);

  const handleSaveInternship = async (e) => {
    e.stopPropagation();
    if (!user) {
      navigate("/signup");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:8000/api/v1/internship/save-internship/${internship._id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const data = await res.json();
      if (res.ok && data.success) {
        setIsSaved(data.isSaved);
        toast.success(data.message);
      } else {
        toast.error("Could not save internship");
      }
    } catch (err) {
      console.error("Error saving internship:", err);
      toast.error("Failed to save internship");
    }
  };

  const handleViewDetails = (e) => {
    e.stopPropagation();
    if (!user) {
      navigate("/signup");
      return;
    }
    navigate(`/internship/description/${internship._id}`);
  };

  return (
    <div
      className="w-full p-5 rounded-xl shadow-md bg-black text-white border border-blue-500 hover:bg-gray-900 transition duration-300 flex flex-col h-full relative group cursor-pointer"
      onClick={handleViewDetails}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleViewDetails(e)}
    >
      {/* Action Buttons */}
      <div className="absolute top-3 right-3 flex gap-2 z-10">
        <Button
          onClick={handleViewDetails}
          className="px-3 py-1 bg-purple-800 border-purple-500 text-white text-sm font-bold rounded-md hover:bg-purple-600 cursor-pointer"
        >
          View Details
        </Button>
        <Button
                 onClick={handleSaveInternship}
                 variant="outline"
                 className={`px-3 py-1 text-sm font-bold rounded-md flex items-center gap-2 ${
                   isSaved
                     ? "bg-blue-500 hover:bg-blue-600 text-black "
                     : "bg-black hover:bg-gray-700"
                 }`}
               >
                 {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                 {isSaved ? "Saved" : "Save Internship"}
               </Button>
      </div>

      {/* Card Content */}
      <div className="mt-10 flex flex-col h-full">
        {/* Date - Left aligned */}
        <p className="text-xs text-gray-400 mb-3 text-left">
          {new Date(internship.createdAt).toLocaleDateString()}
        </p>

        {/* Company Info */}
        <div className="flex gap-3 mb-4">
          <img
            src={internship?.recruiter?.profile?.profilePhoto || profilePic}
            alt="Company Logo"
            className="w-10 h-10 rounded-full object-cover border border-gray-600"
          />
          <div className="text-left">
            <h2 className="text-base font-semibold line-clamp-1">
              {internship?.recruiter?.companyname || "Company Name"}
            </h2>
            <p className="text-xs text-gray-400">
              {internship.location || "Location not specified"}
            </p>
          </div>
        </div>

        {/* Internship Title & Description */}
        <div className="mb-4 text-left">
          <h1 className="text-lg font-bold line-clamp-1 mb-2">
            {internship.title || "Internship Title"}
          </h1>
          {internship.description && (
            <p className="text-sm text-gray-300 line-clamp-2">
              {internship.description}
            </p>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-2.5 py-1 bg-orange-400 text-black text-xs font-medium rounded-md">
            {internship.duration || "Duration N/A"}
          </span>
          <span className="px-2.5 py-1 bg-blue-500 text-black text-xs font-medium rounded-md">
            {internship.stipend || "Stipend N/A"}
          </span>
          <span
            className={`px-2.5 py-1 text-xs font-medium rounded-md ${
              internship.type === "Remote"
                ? "bg-yellow-400 text-black"
                : "bg-purple-600 text-white"
            }`}
          >
            {internship.type || "Type N/A"}
          </span>
        </div>

        {/* Skills - Left aligned */}
        {internship.skills?.length > 0 && (
          <div className="mt-auto text-left">
            <p className="text-xs font-medium text-gray-400 mb-2">
              Required Skills:
            </p>
            <div className="flex flex-wrap gap-2">
              {internship.skills.slice(0, 4).map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-700 text-white text-xs rounded-md"
                >
                  {skill.length > 12 ? `${skill.substring(0, 10)}...` : skill}
                </span>
              ))}
              {internship.skills.length > 4 && (
                <span className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded-md">
                  +{internship.skills.length - 4}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LatestInternshipCards;

import React from "react";
import { Button } from "./ui/button";
import { Bookmark, BookmarkCheck } from "lucide-react";

const LatestJobCards = ({ job, onDetails, onSave, isSaved }) => {
  const handleSaveClick = (e) => {
    e.stopPropagation();
    if (onSave) {
      onSave();
    }
  };

  const handleViewDetailsClick = (e) => {
    e.stopPropagation();
    if (onDetails) {
      onDetails();
    }
  };

  return (
    <div
      className="w-fit p-6 rounded-lg shadow-lg bg-black text-white border border-blue-500 hover:bg-gray-800 cursor-pointer transition duration-300 flex flex-col h-full relative"
      onClick={handleViewDetailsClick}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === "Enter") handleViewDetailsClick(e);
      }}
    >
      {/* Action Buttons */}
      <div className="absolute top-3 right-3 right-4 flex gap-2">
        <Button
          onClick={handleViewDetailsClick}
          variant="outline"
          className="px-3 py-1 bg-purple-800 border-purple-500 text-white text-sm font-bold rounded-md hover:bg-purple-600 cursor-pointer"
        >
          View Details
        </Button>
        <Button
          onClick={handleSaveClick}
          variant="outline"
          className={`px-3 py-1 text-sm font-bold rounded-md flex items-center gap-2 ${
            isSaved
              ? "bg-blue-500 hover:bg-blue-600 text-black"
              : "bg-black hover:bg-gray-700"
          }`}
        >
          {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
          {isSaved ? "Saved" : "Save Job"}
        </Button>
      </div>

      {/* Card Content */}
      <div className="mt-12 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-400">
            {job.createdAt ? new Date(job.createdAt).toDateString() : "N/A"}
          </p>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <img
            src={
              job.created_by?.profile?.profilePhoto ||
              "https://via.placeholder.com/50"
            }
            alt="Company Logo"
            className="w-12 h-12 rounded-full"
          />
          <div>
            <h1 className="font-semibold text-lg">
              {job.company || "Company"}
            </h1>
            <p className="text-sm text-gray-400">
              {job.location || "Location not specified"}
            </p>
          </div>
        </div>

        <div className="mb-4 flex-grow">
          <h1 className="font-bold text-xl mb-3">{job.title || "Job Title"}</h1>
          <p className="text-sm text-gray-300 line-clamp-3">
            {job.description || "No description available."}
          </p>
        </div>

        <div className="mt-auto space-y-4">
          <div className="flex flex-wrap gap-2">
            <span className="px-4 py-1 bg-blue-400 text-black text-sm font-bold rounded-md">
              {job.position || 1} Position{job.position > 1 ? "s" : ""}
            </span>
            <span className="px-2 py-1 bg-red-600 text-white text-sm font-bold rounded-md">
              {job.jobType || "Type N/A"}
            </span>
            <span className="px-2 py-1 bg-yellow-400 text-black text-sm font-bold rounded-md">
              {job.salary ? `${job.salary} ` : "Salary N/A"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LatestJobCards;

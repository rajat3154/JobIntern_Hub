import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import LatestJobCards from "./LatestJobCards";
import { toast } from "sonner";
import { useSearch } from "../context/SearchContext";

const LatestJobs = () => {
  const [latestJobs, setLatestJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState({});
  const navigate = useNavigate();
  const { user } = useSelector((store) => store.auth);
  const { searchQuery } = useSearch();

  const fetchLatestJobs = async () => {
    try {
      console.log("Fetching latest jobs...");
      const response = await fetch("http://localhost:8000/api/v1/job/latest", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      console.log("Latest jobs response:", data);
      if (data.success && Array.isArray(data.data)) {
        setLatestJobs(data.data);
        // Initialize saved status for each job
        const savedStatus = {};
        data.data.forEach(job => {
          savedStatus[job._id] = false;
        });
        setSavedJobs(savedStatus);
        console.log("Latest jobs set in state:", data.data);
      } else {
        console.warn("No jobs found or response unsuccessful", data);
      }
    } catch (error) {
      console.error("Error fetching latest jobs:", error);
    }
  };

  useEffect(() => {
    fetchLatestJobs();
  }, []);

  console.log("Rendering LatestJobs component", { latestJobs, savedJobs });

  const filteredJobs = latestJobs.filter((job) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      job.title.toLowerCase().includes(query) ||
      (job.description && job.description.toLowerCase().includes(query)) ||
      (job.company?.name && job.company.name.toLowerCase().includes(query)) ||
      (job.company &&
        typeof job.company === "string" &&
        job.company.toLowerCase().includes(query)) ||
      (job.location && job.location.toLowerCase().includes(query)) ||
      (job.jobType && job.jobType.toLowerCase().includes(query)) ||
      (job.skills &&
        job.skills.some((skill) => skill.toLowerCase().includes(query)))
    );
  });

  const handleJobClick = (jobId) => {
    if (!user) {
      navigate("/signup");
      return;
    }
    navigate(`/job/description/${jobId}`);
  };

  const handleSaveClick = async (jobId) => {
    if (!user) {
      navigate("/signup");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/job/save-job/${jobId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Failed to save job");

      const data = await response.json();
      if (data.success) {
        setSavedJobs(prev => ({
          ...prev,
          [jobId]: !prev[jobId]
        }));
        toast.success(data.message || (savedJobs[jobId] ? "Job unsaved" : "Job saved"));
      }
    } catch (error) {
      console.error("Error saving job:", error);
      toast.error("Failed to save job");
    }
  };

  return (
    <div className="bg-black text-white py-16">
      <div className="container mx-auto text-center px-4">
        <h1 className="text-5xl font-bold mb-10">
          <span className="text-blue-500 text-3xl">Latest and Top </span>Job
          Openings
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mx-4">
          {filteredJobs.length <= 0 ? (
            <span className="col-span-full text-gray-400 text-lg">
              {searchQuery ? "No jobs match your search" : "No jobs available"}
            </span>
          ) : (
            filteredJobs.map((job) => (
              <LatestJobCards
                key={job._id}
                job={job}
                onDetails={() => handleJobClick(job._id)}
                onSave={() => handleSaveClick(job._id)}
                isSaved={savedJobs[job._id] || false}
              />
            ))
          )}

          <Link
            to="/jobs"
            className="w-full p-6 rounded-lg shadow-lg bg-black text-white border border-blue-500 hover:bg-gray-800 cursor-pointer transition duration-300 flex flex-col items-center justify-center"
          >
            <h2 className="text-2xl font-bold text-blue-400">View More Jobs</h2>
            <p className="mt-2 text-gray-300 text-lg">
              Explore all job openings
            </p>
            <div className="mt-6 flex justify-center">
              <button className="w-12 h-12 flex items-center justify-center rounded-full border border-blue-500 text-blue-400 text-2xl cursor-pointer hover:text-white transition duration-300">
                ➡️
              </button>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LatestJobs;

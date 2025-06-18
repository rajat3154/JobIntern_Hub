import React, { useEffect, useState } from "react";
import Navbar from "./shared/Navbar";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setAllJobs } from "@/redux/jobSlice";
import PostJob from "./recruiter/PostJob";
import { Bookmark, BookmarkCheck, Search } from "lucide-react";
import { toast } from "sonner";

const Jobs = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.auth);
  const { allJobs } = useSelector((store) => store.job);
  const [filteredJobs, setFilteredJobs] = useState(allJobs);
  const [showPostJob, setShowPostJob] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [currentJobId, setCurrentJobId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Check if job is saved when component mounts or job changes
    const checkIfJobSaved = async () => {
      if (!user || !currentJobId) return;
      try {
        const response = await fetch(
          `http://localhost:8000/api/v1/job/is-saved/${currentJobId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (response.ok) {
          const data = await response.json();
          setIsSaved(data.isSaved);
        }
      } catch (error) {
        console.error("Error checking saved status:", error);
      }
    };

    checkIfJobSaved();
  }, [currentJobId, user]);

  const handleSaveJob = async (e, jobId) => {
    e.stopPropagation();
    if (!user) {
      navigate("/signup");
      return;
    }

    setCurrentJobId(jobId);

    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/job/save-job/${jobId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save job");
      }

      const data = await response.json();
      if (data.success) {
        setIsSaved(data.isSaved);
        toast.success(data.message);
      }
    } catch (error) {
      console.error("Error saving job:", error);
      toast.error("Failed to save job");
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/api/v1/job/recruiter/get",
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const data = await response.json();

      if (data.success && Array.isArray(data.jobs)) {
        dispatch(setAllJobs(data.jobs));
        setFilteredJobs(data.jobs);
      }
    } catch (error) {
      console.error("Error fetching recruiter jobs:", error);
    }
  };

  useEffect(() => {
    if (user?.role === "recruiter") {
      fetchJobs();
    } else {
      fetchAllJobs();
    }
  }, [user]);

  const fetchAllJobs = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/v1/job/get", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await response.json();

      if (data.success && Array.isArray(data.jobs)) {
        dispatch(setAllJobs(data.jobs));
        setFilteredJobs(data.jobs);
      }
    } catch (error) {
      console.error("Error fetching all jobs:", error);
    }
  };

  // Apply search filter whenever search term or jobs change
  useEffect(() => {
    if (!searchTerm) {
      setFilteredJobs(allJobs);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = allJobs.filter((job) => {
      return (
        job.title.toLowerCase().includes(searchLower) ||
        job.description.toLowerCase().includes(searchLower) ||
        job.company?.toLowerCase().includes(searchLower) ||
        job.location.toLowerCase().includes(searchLower) ||
        (job.skills &&
          job.skills.some((skill) => skill.toLowerCase().includes(searchLower)))
      );
    });

    setFilteredJobs(filtered);
  }, [searchTerm, allJobs]);

  const handleJobPosted = () => {
    if (user?.role === "recruiter") {
      fetchJobs();
    } else {
      fetchAllJobs();
    }
    setShowPostJob(false);
  };

  const handleJobClick = (jobId, e) => {
    e.preventDefault();
    if (!user) {
      navigate("/signup");
      return;
    }

    navigate(
      user?.role === "student"
        ? `/job/description/${jobId}`
        : `/job/details/${jobId}`
    );
  };

  return (
    <div className="bg-black text-white min-h-screen flex flex-col">
      <Navbar />

      <div className="container mx-auto text-center py-10">
        <h1 className="text-4xl font-bold mb-3 text-blue-500">
          {user?.role === "recruiter" ? "Your Job " : "Browse Job "}
          <span className="text-white text-4xl">Listings</span>
        </h1>
        <p className="text-lg text-gray-300">
          {user?.role === "recruiter"
            ? "Manage your job postings"
            : "Find your dream job in just a few clicks!"}
        </p>

        {user?.role === "recruiter" && (
          <Button
            onClick={() => setShowPostJob(true)}
            className="mt-4 bg-green-500 hover:bg-green-600"
          >
            Post New Job
          </Button>
        )}
      </div>

      {/* Search Bar */}
      <div className="container mx-auto px-4 mb-6">
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search jobs by title, company, location, or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {showPostJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <PostJob
            onClose={() => setShowPostJob(false)}
            onSuccess={handleJobPosted}
          />
        </div>
      )}

      <div className="container mx-auto px-4 flex-1 pb-5">
        {filteredJobs.length <= 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400 text-xl font-medium">
              {searchTerm
                ? "No jobs match your search. Try different keywords."
                : user?.role === "recruiter"
                ? "You haven't posted any jobs yet."
                : "No jobs found."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredJobs.map((job) => (
              <div
                key={job._id}
                onClick={(e) => handleJobClick(job._id, e)}
                className="relative p-6 rounded-lg shadow-lg bg-black text-white border border-blue-500 hover:bg-gray-800 cursor-pointer transition duration-300"
              >
                <div className="absolute top-3 right-4 flex gap-2">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleJobClick(job._id, e);
                    }}
                    variant="outline"
                    className="px-3 py-1 bg-purple-500 border-purple-500 text-white text-sm font-bold rounded-md hover:bg-purple-600 cursor-pointer"
                  >
                    View Details
                  </Button>
                  <Button
                    onClick={(e) => handleSaveJob(e, job._id)}
                    variant="outline"
                    className={`px-3 py-1 text-sm font-bold rounded-md flex items-center gap-2 ${
                      isSaved && currentJobId === job._id
                        ? "bg-blue-500 hover:bg-blue-600"
                        : "bg-gray-600 hover:bg-gray-700"
                    }`}
                  >
                    {isSaved && currentJobId === job._id ? (
                      <BookmarkCheck size={16} />
                    ) : (
                      <Bookmark size={16} />
                    )}
                    {isSaved && currentJobId === job._id ? "Saved" : "Save Job"}
                  </Button>
                </div>

                <div className="mt-12">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-gray-400">
                      {new Date(job.createdAt).toDateString()}
                    </p>
                    {user?.role === "recruiter" && (
                      <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">
                        {job.applicants?.length || 0} applicants
                      </span>
                    )}
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
                        {job.company || "Your Company"}
                      </h1>
                      <p className="text-sm text-gray-400">{job.location}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h1 className="font-bold text-xl mb-3">{job.title}</h1>
                    <p className="text-sm text-gray-300 line-clamp-3">
                      {job.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-2 py-1 bg-blue-400 text-black text-sm font-bold rounded-md">
                      {job.position} Positions
                    </span>
                    <span className="px-2 py-1 bg-red-600 text-white text-sm font-bold rounded-md">
                      {job.jobType}
                    </span>
                    <span className="px-2 py-1 bg-yellow-400 text-black text-sm font-bold rounded-md">
                      {job.salary}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;

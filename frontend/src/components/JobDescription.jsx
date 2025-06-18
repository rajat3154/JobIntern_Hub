import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setSingleJob } from "@/redux/jobSlice";
import { APPLICATION_API_END_POINT, JOB_API_END_POINT } from "@/utils/constant";
import { toast } from "sonner";

const JobDescription = () => {
  const params = useParams();
  const jobId = params.id;
  const dispatch = useDispatch();
  const { singleJob } = useSelector((store) => store.job);
  const { user } = useSelector((store) => store.auth);
  const [isApplied, setIsApplied] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  console.log("📌 Job ID from URL:", jobId);
  console.log("👤 Logged-in user:", user);

  // Fetch job data
  useEffect(() => {
    const fetchSingleJob = async () => {
      try {
        const res = await axios.get(`${JOB_API_END_POINT}/get/${jobId}`, {
          withCredentials: true,
        });
        console.log("📥 Job fetch response:", res.data);
        if (res.data.success) {
          dispatch(setSingleJob(res.data.job));
        }
      } catch (error) {
        console.error("❌ Error fetching job:", error);
        toast.error("Failed to load job data.");
      }
    };

    fetchSingleJob();
  }, [jobId, dispatch]);

  // Set application status when singleJob changes
  useEffect(() => {
    console.log("🎯 Checking if user has applied...");
    console.log("💼 Job applications:", singleJob?.applications);
    if (singleJob?.applications && user?._id) {
      const applied = singleJob.applications.some(
        (application) => application.applicant === user._id
      );
      console.log("✅ Has user applied?:", applied);
      setIsApplied(applied);
    }
  }, [singleJob, user]);

  // Handle Apply button click
  const applyJobHandler = async () => {
    setIsApplying(true);
    console.log("🚀 Applying for job:", jobId);
    try {
    
    
      const res = await axios.post(
        `${APPLICATION_API_END_POINT}/apply/${jobId}`,{},
        {
          withCredentials: true,
         
        }
      );

      console.log("📝 Apply API response:", res.data);

      if (res.data.success) {
        toast.success(res.data.message);

        // Immediately update local state
        setIsApplied(true);

        // Optimistically update Redux state
        const updatedJob = {
          ...singleJob,
          applications: [
            ...(singleJob.applications || []),
            { applicant: user._id },
          ],
        };
        dispatch(setSingleJob(updatedJob));
      }
    } catch (error) {
      console.error("❌ Error applying for job:", error);
      if (error.response) {
        // The request was made and the server responded with a status code
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
        toast.error(
          error.response.data.message || "Failed to apply for the job."
        );
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received:", error.request);
        toast.error("No response from server. Please check your connection.");
      } else {
        // Something happened in setting up the request
        console.error("Request setup error:", error.message);
        toast.error("Failed to setup request.");
      }
    }finally{
      setIsApplying(false);
    }
  };

  if (!singleJob) {
    return (
      <div className="text-white text-center mt-10">Loading job data...</div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen py-20 overflow-x-hidden overflow-y-hidden">
      <div className="container px-4 ml-8 mr-10">
        {/* Job Title and Apply Button */}
        <div className="flex items-center justify-between mb-6 mr-7">
          <h1 className="text-3xl font-bold">{singleJob.title}</h1>
          <Button onClick={applyJobHandler} disabled={isApplied || isApplying}>
            {isApplying
              ? "Applying..."
              : isApplied
              ? "Already Applied"
              : "Apply Now"}
          </Button>
        </div>

        {/* Job Info Badges */}
        <div className="flex gap-4 mb-6">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-bold rounded-md">
            {singleJob.positions} Positions
          </span>
          <span className="px-3 py-1 bg-red-100 text-[#F83002] text-sm font-bold rounded-md">
            {singleJob.jobType}
          </span>
          <span className="px-3 py-1 bg-purple-100 text-[#7209b7] text-sm font-bold rounded-md">
            {singleJob.salary}
          </span>
        </div>

        {/* Job Description */}
        <h2 className="border-b-2 border-gray-300 text-xl font-medium py-4 mb-6">
          Job Description
        </h2>
        <div className="space-y-4">
          <h1 className="font-bold text-lg">
            Role:{" "}
            <span className="font-normal text-gray-300">{singleJob.title}</span>
          </h1>
          <h1 className="font-bold text-lg">
            Location:{" "}
            <span className="font-normal text-gray-300">
              {singleJob.location}
            </span>
          </h1>
          <h1 className="font-bold text-lg">
            Description:{" "}
            <span className="font-normal text-gray-300">
              {singleJob.description}
            </span>
          </h1>
          <h1 className="font-bold text-lg">
            Experience:{" "}
            <span className="font-normal text-gray-300">
              {singleJob.experience}
            </span>
          </h1>
          <h1 className="font-bold text-lg">
            Salary:{" "}
            <span className="font-normal text-gray-300">
              {singleJob.salary}
            </span>
          </h1>
          <h1 className="font-bold text-lg">
            Total Applicants:{" "}
            <span className="font-normal text-gray-300">
              {singleJob.applications?.length || 0}
            </span>
          </h1>
          <h1 className="font-bold text-lg">
            Posted Date:{" "}
            <span className="font-normal text-gray-300">
              {new Date(singleJob.createdAt).toLocaleDateString()}
            </span>
          </h1>
        </div>
      </div>
    </div>
  );
};

export default JobDescription;

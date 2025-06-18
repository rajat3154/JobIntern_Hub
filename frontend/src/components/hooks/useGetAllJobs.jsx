import { setAllJobs } from "@/redux/jobSlice";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";

const useGetAllJobs = () => {
  const dispatch = useDispatch();
  const searchedQuery = useSelector((store) => store.job.searchedQuery);
  const apiUrl = import.meta.env.VITE_BACKEND_URL;
  useEffect(() => {
    const fetchAllJobs = async () => {
      try {
        const res = await axios.get(
          `${apiUrl}/api/v1/job/get`,
          { withCredentials: true }
        );

        if (res.data.success) {
          const formattedJobs = res.data.jobs.map((job) => ({
            id: job._id,
            title: job.title,
            description: job.description,
            requirements: job.requirements,
            salary: job.salary,
            experience: job.experience,
            location: job.location,
            jobType: job.jobType,
            position: job.position,
            recruiterId: job.recruiter,
            createdBy: job.created_by,
            createdAt: job.createdAt,
            updatedAt: job.updatedAt,
            applications: job.applications || [],
          }));

          dispatch(setAllJobs(formattedJobs));
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    };

    fetchAllJobs();
  }, [dispatch, searchedQuery]); // Include searchedQuery to refetch on search change
};

export default useGetAllJobs;

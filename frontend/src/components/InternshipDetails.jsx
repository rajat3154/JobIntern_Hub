import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { MoreHorizontal } from "lucide-react";
import Navbar from "./shared/Navbar";
import { APPLICATION_API_END_POINT } from "@/utils/constant";

const shortlistingStatus = ["Accepted", "Rejected"];

const InternshipDetails = () => {
  const { id } = useParams();
  const [internship, setInternship] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchInternshipDetails = async () => {
    try {
      const { data } = await axios.get(
        `http://localhost:8000/api/v1/internship/get/${id}`,
        { withCredentials: true }
      );
      setInternship(data.internship);
    } catch (error) {
      console.error("Failed to fetch internship details:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicants = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8000/api/v1/application/internship/${id}/applicants`,
        { withCredentials: true }
      );
      console.log(res);
      setApplicants((res.data.applicants || []).filter((app) => app !== null));

    } catch (error) {
      console.error("Failed to fetch applicants:", error);
      toast.error("Error loading applicants");
    }
  };

  const handleStatusUpdate = async (status, appId) => {
    try {
      setLoading(true);
      console.log(appId);
      console.log(status);
      // const res = await axios.post(
      //   // `${APPLICATION_API_END_POINT}/intern/status/${appId}/update`,
      //   `${APPLICATION_API_END_POINT}/status/${appId}/update`,
      //   { status },
      //   { withCredentials: true }
      // );

      const res = await axios.post(
        `http://localhost:8000/api/v1/application/internship/status/${appId}/update`,
        { status },
        { withCredentials: true }   
      );
      console.log(res);

      if (res.data.success) {
        toast.success(res.data.message);
        // Refresh job data after updating status
        fetchApplicants();
      } else {
        toast.error("Status update failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchInternshipDetails();
    fetchApplicants();
  }, [id]);

  if (loading) {
    return <div className="text-white text-center mt-20">Loading...</div>;
  }

  if (!internship) {
    return (
      <div className="text-white text-center mt-20">Internship not found.</div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="bg-black text-white min-h-screen py-20 overflow-x-hidden">
        <div className="container px-4 ml-8 mr-10">
          <div className="flex items-center justify-between mb-6 mr-7">
            <h1 className="text-3xl font-bold">{internship.title}</h1>
          </div>

          <div className="flex gap-4 mb-6">
            <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-bold rounded-md">
              {internship.duration}
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-bold rounded-md">
              ₹{internship.stipend}/month
            </span>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-bold rounded-md">
              {internship.type}
            </span>
          </div>

          <h2 className="border-b-2 border-gray-300 text-xl font-medium py-4 mb-6">
            Internship Details
          </h2>
          <div className="space-y-4 mb-12">
            <h1 className="font-bold text-lg">
              Role:{" "}
              <span className="font-normal text-gray-300">
                {internship.title}
              </span>
            </h1>
            <h1 className="font-bold text-lg">
              Location:{" "}
              <span className="font-normal text-gray-300">
                {internship.location}
              </span>
            </h1>
            <h1 className="font-bold text-lg">
              Description:{" "}
              <span className="font-normal text-gray-300">
                {internship.description}
              </span>
            </h1>
            <h1 className="font-bold text-lg">
              Duration:{" "}
              <span className="font-normal text-gray-300">
                {internship.duration}
              </span>
            </h1>
            <h1 className="font-bold text-lg">
              Stipend:{" "}
              <span className="font-normal text-gray-300">
                ₹{internship.stipend}/month
              </span>
            </h1>
            <h1 className="font-bold text-lg">
              Type:{" "}
              <span className="font-normal text-gray-300">
                {internship.type}
              </span>
            </h1>
            <h1 className="font-bold text-lg">
              Required Skills:
              <div className="flex flex-wrap gap-2 mt-2">
                {internship.skills?.map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-700 text-white text-sm rounded-md"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </h1>
            <h1 className="font-bold text-lg">
              Posted Date:{" "}
              <span className="font-normal text-gray-300">
                {new Date(internship.createdAt).toLocaleDateString()}
              </span>
            </h1>
          </div>

          {/* Applicants Table */}
          <div className="mt-12">
            <h2 className="border-b-2 border-gray-300 text-xl font-medium py-4 mb-6">
              Applicants ({applicants.length})
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-600">
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Email</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Resume</th>
                    <th className="pb-3">Applied Date</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applicants.length > 0 ? (
                    applicants.map((app) => (
                      <tr key={app._id} className="border-b border-gray-600">
                        <td className="py-4">{app?.fullname || "N/A"}</td>
                        <td>{app?.email || "N/A"}</td>
                        <td>
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">
                            {app?.status || "Pending"}
                          </span>
                        </td>
                        <td>
                          {app?.profile?.resume ? (
                            <a
                              href={app?.profile?.resume}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:underline"
                            >
                              View Resume
                            </a>
                          ) : (
                            "No Resume"
                          )}
                        </td>
                        <td>
                          {app.createdAt
                            ? new Date(app.createdAt).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="relative">
                          <Popover>
                            <PopoverTrigger>
                              <MoreHorizontal className="cursor-pointer text-gray-400 hover:text-white" />
                            </PopoverTrigger>
                            <PopoverContent className="bg-black text-white rounded-lg shadow-lg p-2">
                              {shortlistingStatus.map((status, index) => (
                                <div
                                  key={index}
                                  onClick={() =>
                                    handleStatusUpdate(status, app._id)
                                  }
                                  className="px-2 py-1 rounded cursor-pointer hover:text-white hover:bg-blue-500"
                                >
                                  {status}
                                </div>
                              ))}
                            </PopoverContent>
                          </Popover>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="py-4 text-center text-gray-400"
                      >
                        No applicants yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InternshipDetails;

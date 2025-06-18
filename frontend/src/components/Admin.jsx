import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import Navbar from "./shared/Navbar";
import {
  ADMIN_API_END_POINT,
  RECRUITER_API_END_POINT,
  STUDENT_API_END_POINT,
} from "@/utils/constant";

const Admin = () => {
  const [students, setStudents] = useState([]);
  const [recruiters, setRecruiters] = useState([]);
  const [recruiterRequests, setRecruiterRequests] = useState([]);
  const [loading, setLoading] = useState({
    students: true,
    recruiters: true,
    requests: true,
  });
  const navigate = useNavigate();
  const { user } = useSelector((store) => store.auth);

  // Pagination state
  const [currentStudentPage, setCurrentStudentPage] = useState(1);
  const [currentRecruiterPage, setCurrentRecruiterPage] = useState(1);
  const itemsPerPage = 5;

  // Search state
  const [studentSearchTerm, setStudentSearchTerm] = useState("");
  const [recruiterSearchTerm, setRecruiterSearchTerm] = useState("");

  useEffect(() => {
    if (user?.role !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);

  // Fetch recruiter requests
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await fetch(`${ADMIN_API_END_POINT}/recruiter-requests`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          setRecruiterRequests(data.requests);
        }
      } catch (error) {
        console.error("Failed to fetch recruiter requests:", error);
        toast.error("Failed to load recruiter requests");
      } finally {
        setLoading((prev) => ({ ...prev, requests: false }));
      }
    };
    fetchRequests();
  }, []);

  // Fetch recruiters
  useEffect(() => {
    const fetchRecruiters = async () => {
      try {
        const response = await fetch(`${RECRUITER_API_END_POINT}/recruiters`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch recruiters");
        }

        if (data.success && Array.isArray(data.recruiters)) {
          setRecruiters(data.recruiters);
        }
      } catch (error) {
        console.error("Error fetching recruiters:", error);
        toast.error("Failed to load recruiters");
      } finally {
        setLoading((prev) => ({ ...prev, recruiters: false }));
      }
    };

    fetchRecruiters();
  }, []);

  // Fetch students
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch(`${STUDENT_API_END_POINT}/students`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch students");
        }

        if (data.success && Array.isArray(data.students)) {
          setStudents(data.students);
        }
      } catch (error) {
        console.error("Error fetching students:", error);
        toast.error("Failed to load students");
      } finally {
        setLoading((prev) => ({ ...prev, students: false }));
      }
    };

    fetchStudents();
  }, []);

  // Filter students based on search term
  const filteredStudents = students.filter(
    (student) =>
      student.fullname
        .toLowerCase()
        .includes(studentSearchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
      (student.profile?.skills || []).some((skill) =>
        skill.toLowerCase().includes(studentSearchTerm.toLowerCase())
      )
  );

  // Filter recruiters based on search term
  const filteredRecruiters = recruiters.filter(
    (recruiter) =>
      recruiter.companyname
        .toLowerCase()
        .includes(recruiterSearchTerm.toLowerCase()) ||
      recruiter.email
        .toLowerCase()
        .includes(recruiterSearchTerm.toLowerCase()) ||
      recruiter.cinnumber
        .toLowerCase()
        .includes(recruiterSearchTerm.toLowerCase())
  );

  // Pagination logic for students
  const indexOfLastStudent = currentStudentPage * itemsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - itemsPerPage;
  const currentStudents = filteredStudents.slice(
    indexOfFirstStudent,
    indexOfLastStudent
  );
  const totalStudentPages = Math.ceil(filteredStudents.length / itemsPerPage);

  // Pagination logic for recruiters
  const indexOfLastRecruiter = currentRecruiterPage * itemsPerPage;
  const indexOfFirstRecruiter = indexOfLastRecruiter - itemsPerPage;
  const currentRecruiters = filteredRecruiters.slice(
    indexOfFirstRecruiter,
    indexOfLastRecruiter
  );
  const totalRecruiterPages = Math.ceil(
    filteredRecruiters.length / itemsPerPage
  );

  const handleApprove = async (id) => {
    try {
      const response = await fetch(
        `${ADMIN_API_END_POINT}/recruiter-requests/${id}/approve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to approve recruiter");
      }

      setRecruiterRequests((prev) => prev.filter((r) => r._id !== id));

      // Refresh recruiters list
      const recruitersResponse = await fetch(
        `${RECRUITER_API_END_POINT}/recruiters`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      const recruitersData = await recruitersResponse.json();
      if (recruitersData.success && Array.isArray(recruitersData.recruiters)) {
        setRecruiters(recruitersData.recruiters);
      }

      toast.success(data.message || "Recruiter approved successfully");
    } catch (error) {
      console.error("Error approving recruiter:", error);
      toast.error(error.message || "Failed to approve recruiter");
    }
  };

  const handleReject = async (id) => {
    try {
      const response = await fetch(
        `${ADMIN_API_END_POINT}/recruiter-requests/${id}/reject`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to reject recruiter");
      }

      setRecruiterRequests((prev) => prev.filter((r) => r._id !== id));
      toast.success("Recruiter request rejected successfully");
    } catch (error) {
      console.error("Error rejecting recruiter:", error);
      toast.error(error.message || "Failed to reject recruiter");
    }
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?"))
      return;

    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/students/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete student");
      }

      setStudents((prev) => prev.filter((s) => s._id !== id));
      toast.success(data.message || "Student deleted successfully");
    } catch (error) {
      console.error("Error deleting student:", error);
      toast.error(error.message || "Failed to delete student");
    }
  };

  const handleDeleteRecruiter = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Recruiter?"))
      return;

    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/recruiter/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete recruiter");
      }

      setRecruiters((prev) => prev.filter((s) => s._id !== id));
      toast.success(data.message || "Recruiter deleted successfully");
    } catch (error) {
      console.error("Error deleting recruiter:", error);
      toast.error(error.message || "Failed to delete Recruiter");
    }
  };

  // Helper function to get initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="bg-black text-white min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-500">Admin Dashboard</h1>
        </div>

        {/* Students Section */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-white">Students</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Search students..."
                className="bg-gray-800 text-white px-4 py-2 rounded-lg pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={studentSearchTerm}
                onChange={(e) => {
                  setStudentSearchTerm(e.target.value);
                  setCurrentStudentPage(1);
                }}
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {loading.students ? (
            <div className="text-center py-8">
              <p className="text-blue-300">Loading students...</p>
            </div>
          ) : (
            <>
              <div className="rounded-lg overflow-x-auto border border-gray-700 max-h-107 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-800 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Profile
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Skills
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-black divide-y divide-gray-700">
                    {currentStudents.length > 0 ? (
                      currentStudents.map((student) => (
                        <tr key={student._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Avatar className="w-10 h-10">
                              <AvatarImage
                                src={student.profile?.profilePhoto}
                              />
                              <AvatarFallback>
                                {getInitials(student.fullname)}
                              </AvatarFallback>
                            </Avatar>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {student.fullname}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {student.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {student.phonenumber || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-wrap gap-2">
                              {(student.profile?.skills || []).map(
                                (skill, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-gray-700 text-xs rounded-md"
                                  >
                                    {skill}
                                  </span>
                                )
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {new Date(student.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleDeleteStudent(student._id)}
                              className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 text-center">
                          {students.length === 0
                            ? "No students found"
                            : "No matching students found"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {totalStudentPages > 1 && (
                <div className="flex justify-between items-center mt-4">
                  <button
                    onClick={() =>
                      setCurrentStudentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentStudentPage === 1}
                    className={`px-4 py-2 rounded ${
                      currentStudentPage === 1
                        ? "bg-gray-700 cursor-not-allowed"
                        : "bg-blue-500 hover:bg-blue-600"
                    }`}
                  >
                    Previous
                  </button>
                  <span>
                    Page {currentStudentPage} of {totalStudentPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentStudentPage((prev) =>
                        Math.min(prev + 1, totalStudentPages)
                      )
                    }
                    disabled={currentStudentPage === totalStudentPages}
                    className={`px-4 py-2 rounded ${
                      currentStudentPage === totalStudentPages
                        ? "bg-gray-700 cursor-not-allowed"
                        : "bg-blue-500 hover:bg-blue-600"
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Recruiters Section */}
        <div className="mt-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-white">Recruiters</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Search recruiters..."
                className="bg-gray-800 text-white px-4 py-2 rounded-lg pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={recruiterSearchTerm}
                onChange={(e) => {
                  setRecruiterSearchTerm(e.target.value);
                  setCurrentRecruiterPage(1);
                }}
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {loading.recruiters ? (
            <div className="text-center py-8">
              <p className="text-blue-300">Loading recruiters...</p>
            </div>
          ) : (
            <>
              <div className="rounded-lg overflow-x-auto border border-gray-700 max-h-105 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-800 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Logo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        CIN
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Address
                      </th>

                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-black divide-y divide-gray-700">
                    {currentRecruiters.length > 0 ? (
                      currentRecruiters.map((rec) => (
                        <tr key={rec._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={rec.profile?.profilePhoto} />
                              <AvatarFallback>
                                {getInitials(rec.companyname)}
                              </AvatarFallback>
                            </Avatar>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {rec.companyname}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {rec.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {rec.cinnumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {rec.companyaddress}
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleDeleteRecruiter(rec._id)}
                              className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 text-center">
                          {recruiters.length === 0
                            ? "No recruiters found"
                            : "No matching recruiters found"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {totalRecruiterPages > 1 && (
                <div className="flex justify-between items-center mt-4">
                  <button
                    onClick={() =>
                      setCurrentRecruiterPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentRecruiterPage === 1}
                    className={`px-4 py-2 rounded ${
                      currentRecruiterPage === 1
                        ? "bg-gray-700 cursor-not-allowed"
                        : "bg-blue-500 hover:bg-blue-600"
                    }`}
                  >
                    Previous
                  </button>
                  <span>
                    Page {currentRecruiterPage} of {totalRecruiterPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentRecruiterPage((prev) =>
                        Math.min(prev + 1, totalRecruiterPages)
                      )
                    }
                    disabled={currentRecruiterPage === totalRecruiterPages}
                    className={`px-4 py-2 rounded ${
                      currentRecruiterPage === totalRecruiterPages
                        ? "bg-gray-700 cursor-not-allowed"
                        : "bg-blue-500 hover:bg-blue-600"
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Recruiter Requests Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-4 text-white">
            Pending Recruiter Requests
          </h2>

          {loading.requests ? (
            <div className="text-center py-8">
              <p className="text-blue-300">Loading recruiter requests...</p>
            </div>
          ) : recruiterRequests.length > 0 ? (
            recruiterRequests.map((req) => (
              <div
                key={req._id}
                className="bg-gray-800 p-4 rounded-lg mb-4 text-white flex items-start gap-4"
              >
                <Avatar className="w-16 h-16 border border-gray-600">
                  <AvatarImage src={req.profile?.profilePhoto} />
                  <AvatarFallback>
                    {getInitials(req.companyname)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p>
                    <strong>Company:</strong> {req.companyname}
                  </p>
                  <p>
                    <strong>Email:</strong> {req.email}
                  </p>
                  <p>
                    <strong>CIN:</strong> {req.cinnumber}
                  </p>
                  <p>
                    <strong>Address:</strong> {req.companyaddress}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => handleApprove(req._id)}
                      className="flex items-center gap-1 bg-green-500 hover:bg-green-600 px-4 py-1 rounded transition-colors"
                    >
                      <Check size={16} /> Accept
                    </button>
                    <button
                      onClick={() => handleReject(req._id)}
                      className="flex items-center gap-1 bg-red-500 hover:bg-red-600 px-4 py-1 rounded transition-colors"
                    >
                      <X size={16} /> Reject
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400">No pending recruiter requests</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;

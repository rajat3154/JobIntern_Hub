import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  Mail,
  Briefcase,
  Link as LinkIcon,
  Pen,
  FileText,
  Bookmark,
  BookmarkCheck,
  PlusCircle,
  MapPin,
  Users,
  Calendar,
  Globe,
  Building2,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { toast } from "sonner";
import { motion } from "framer-motion";
import Navbar from "./shared/Navbar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "./ui/card";
import { Separator } from "./ui/separator";
import PostJob from "./recruiter/PostJob";
import PostInternship from "./recruiter/PostInternship";

const RecruiterProfile = () => {
  const [profileData, setProfileData] = useState(null);
  const [postedJobs, setPostedJobs] = useState([]);
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [internshipsLoading, setInternshipsLoading] = useState(true);
  const [showPostJob, setShowPostJob] = useState(false);
  const [showPostInternship, setShowPostInternship] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [currentJobId, setCurrentJobId] = useState(null);
  const { user: currentUser } = useSelector((store) => store.auth);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        const profileRes = await axios.get(
          `http://localhost:8000/api/v1/recruiter/profile/${currentUser._id}`,
          { withCredentials: true }
        );
        setProfileData(profileRes.data.data);

        const jobsRes = await axios.get(
          "http://localhost:8000/api/v1/job/recruiter-jobs",
          { withCredentials: true }
        );
        console.log("Jobs Response:", jobsRes.data);
        setPostedJobs(jobsRes.data.data || []);

        try {
          const internshipsRes = await axios.get(
            "http://localhost:8000/api/v1/internship/recruiter",
            { withCredentials: true }
          );
          console.log("Internships Response:", internshipsRes.data);
          setInternships(
            internshipsRes.data.internships || internshipsRes.data || []
          );
        } catch (internshipError) {
          console.error("Error fetching internships:", internshipError);
          toast.error("Failed to load internships");
          setInternships([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
        setJobsLoading(false);
        setInternshipsLoading(false);
      }
    };
    fetchAllData();
  }, [currentUser._id]);
  const fetchJobsagain = async () => {
    try {
      const jobsRes = await axios.get(
        "http://localhost:8000/api/v1/job/recruiter-jobs",
        { withCredentials: true }
      );
      setPostedJobs(jobsRes.data.data || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error("Failed to load jobs");
    }
  };
  const fetchInternshipsagain = async () => {
    try {
      const internshipsRes = await axios.get(
        "http://localhost:8000/api/v1/internship/recruiter",
        { withCredentials: true }
      );
      console.log("Internships Response:", internshipsRes.data);
      setInternships(
        internshipsRes.data.internships || internshipsRes.data || []
      );
    } catch (error) {
      console.error("Error fetching internships:", error);
      toast.error("Failed to load internships");
    }
  };
  const handleJobPosted = () => {
    const fetchJobs = async () => {
      try {
        const jobsRes = await axios.get(
          "http://localhost:8000/api/v1/job/recruiter-jobs",
          { withCredentials: true }
        );
        setPostedJobs(jobsRes.data.data || []);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        toast.error("Failed to load jobs");
      }
    };
    fetchJobs();
    setShowPostJob(false);
  };

  const handleInternshipPosted = () => {
    // Remove fetchAllData() and instead refetch the specific data
    const fetchInternships = async () => {
      try {
        const internshipsRes = await axios.get(
          "http://localhost:8000/api/v1/internship/recruiter",
          { withCredentials: true }
        );
        console.log("Internships Response:", internshipsRes.data);
        setInternships(
          internshipsRes.data.internships || internshipsRes.data || []
        );
      } catch (error) {
        console.error("Error fetching internships:", error);
        toast.error("Failed to load internships");
      }
    };
    fetchInternships();
    setShowPostInternship(false);
  };

  const handleSaveJob = async (e, jobId) => {
    e.stopPropagation();
    setCurrentJobId(jobId);
    try {
      const response = await axios.post(
        `http://localhost:8000/api/v1/job/save-job/${jobId}`,
        {},
        { withCredentials: true }
      );
      if (response.data.success) {
        setIsSaved(response.data.isSaved);
        toast.success(response.data.message);
      }
     
    } catch (error) {
      console.error("Error saving job:", error);
      toast.error("Failed to save job");
    }
  };
  const handleDeleteJob = async (e, jobId) => {
    e.stopPropagation();

    try {
      const response = await axios.delete(
        `http://localhost:8000/api/v1/job/delete/${jobId}`,{withCredentials: true}
      );
      toast.success(response.data.message || "Job deleted successfully");
      fetchJobsagain();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete the job");
    }
  };
  const confirmDeleteInternship = async (e,internshipId) => {
    try {
      const response = await axios.delete(
        `http://localhost:8000/api/v1/internship/delete/${internshipId}`,
        { withCredentials: true }
      );
      toast.success(response.data.message || "Internship deleted successfully");
      fetchInternshipsagain();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete the internship"
      );
    }
  };
  const renderJobCard = (job) => (
    <motion.div
      key={job._id}
      whileHover={{ scale: 1.02 }}
      className="relative p-6 rounded-xl bg-gray-900 text-white border border-gray-800 hover:border-blue-500 cursor-pointer transition-all duration-300 w-full"
      onClick={() => navigate(`/job/details/${job._id}`)}
    >
      <div className="absolute top-4 right-4 flex gap-2">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/job/details/${job._id}`);
          }}
          size="sm"
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          View
        </Button>
        <Button
          onClick={(e) => handleDeleteJob(e, job._id)}
          size="sm"
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          Delete
        </Button>
      </div>

      <div className="mt-12">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-400">
            Posted on {new Date(job.createdAt).toLocaleDateString()}
          </p>
          <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
            {job.applications?.length || 0} applicants
          </Badge>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <Avatar className="h-12 w-12 border border-blue-500/30">
            <AvatarImage src={profileData?.profile?.profilePhoto} />
            <AvatarFallback className="bg-gray-800 text-blue-400">
              {profileData?.companyname?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-semibold text-lg">
              {profileData?.companyname}
            </h1>
            <p className="text-sm text-gray-400">{job.location}</p>
          </div>
        </div>

        <div className="mb-4">
          <h1 className="font-bold text-xl mb-3">{job.title}</h1>
          <p className="text-gray-300 line-clamp-2">{job.description}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge className="bg-blue-500/20 text-blue-400">
            {job.position} Position{job.position > 1 ? "s" : ""}
          </Badge>
          <Badge className="bg-purple-500/20 text-purple-400">
            {job.jobType}
          </Badge>
          <Badge className="bg-yellow-500/20 text-yellow-400">
            {job.salary}
          </Badge>
        </div>
      </div>
    </motion.div>
  );

  const renderInternshipCard = (internship) => (
    <motion.div
      key={internship._id}
      whileHover={{ scale: 1.02 }}
      className="relative p-6 rounded-xl bg-gray-900 text-white border border-gray-800 hover:border-blue-500 cursor-pointer transition-all duration-300 w-full"
      onClick={() => navigate(`/internship/details/${internship._id}`)}
    >
      <div className="absolute top-4 right-4">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/internship/details/${internship._id}`);
          }}
          size="sm"
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          View Details
        </Button>
        <Button
          onClick={(e) => handleDeleteClick(e, internship._id)}
          className=" bg-red-600 text-red-500 hover:text-red-700 text-sm font-medium text-white m-2"
        >
          Delete
        </Button>
      </div>

      <div className="mt-12">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-400">
            Posted on {new Date(internship.createdAt).toLocaleDateString()}
          </p>
          <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
            {internship.applications?.length || 0} applicants
          </Badge>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <Avatar className="h-12 w-12 border border-blue-500/30">
            <AvatarImage src={profileData?.profile?.profilePhoto} />
            <AvatarFallback className="bg-gray-800 text-blue-400">
              {profileData?.companyname?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-semibold text-lg">
              {profileData?.companyname}
            </h1>
            <p className="text-sm text-gray-400">{internship.location}</p>
          </div>
        </div>

        <div className="mb-4">
          <h1 className="font-bold text-xl mb-3">{internship.title}</h1>
          <p className="text-gray-300 line-clamp-2">{internship.description}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge className="bg-blue-500/20 text-blue-400">
            {internship.type}
          </Badge>
          <Badge className="bg-green-500/20 text-green-400">
            {internship.stipend}
          </Badge>
          <Badge className="bg-yellow-500/20 text-yellow-400">
            {internship.duration}
          </Badge>
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <div className="max-w-7xl mx-auto p-4">
          <div className="space-y-6">
            <div className="h-40 rounded-xl bg-gray-900/80 animate-pulse"></div>
            <div className="h-96 rounded-xl bg-gray-900/80 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      {showPostJob && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <PostJob
            onClose={() => setShowPostJob(false)}
            onSuccess={handleJobPosted}
          />
        </div>
      )}

      {showPostInternship && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          {/* Replace with your PostInternship component */}
          <PostInternship
            onClose={() => setShowPostInternship(false)}
            onSuccess={handleInternshipPosted}
          />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Company Intro - Horizontal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-gray-900 border-gray-800 rounded-xl">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <Avatar className="h-32 w-32 border-2 border-blue-500">
                  <AvatarImage src={profileData?.profile?.profilePhoto} />
                  <AvatarFallback className="text-3xl bg-gray-800 text-blue-400">
                    {profileData?.companyname?.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-4">
                  <div>
                    <h1 className="text-2xl font-bold text-white">
                      {profileData?.companyname}
                    </h1>
                    <p className="text-gray-400">
                      {profileData?.profile?.tagline || "Recruitment Partner"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Building2 className="h-5 w-5 text-blue-400" />
                      <span>
                        {profileData?.industry || "Industry not specified"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <Globe className="h-5 w-5 text-blue-400" />
                      <span>
                        {profileData?.profile?.website || "No website"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <Calendar className="h-5 w-5 text-blue-400" />
                      <span>
                        Member since{" "}
                        {new Date(profileData?.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-2">
                    <Button
                      onClick={() => navigate("/profile/edit")}
                      variant="outline"
                      className="text-blue-400 border-blue-400/50 hover:bg-blue-400/10 flex items-center gap-2"
                    >
                      <Pen size={16} />
                      Edit Profile
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800 rounded-xl md:col-span-2">
            <CardHeader>
              <CardTitle className="text-xl">About Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 whitespace-pre-line">
                {profileData?.profile?.about ||
                  "No company description provided. Add information about your company to attract better candidates."}
              </p>

              <Separator className="my-6 bg-gray-800" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-blue-400 mb-3">
                    Contact Information
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3 text-gray-300">
                      <Mail className="h-5 w-5 text-blue-400" />
                      <span>{profileData?.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-300">
                      <MapPin className="h-5 w-5 text-blue-400" />
                      <span>
                        {profileData?.companyaddress || "Address not provided"}
                      </span>
                    </div>
                    {profileData?.profile?.phone && (
                      <div className="flex items-center gap-3 text-gray-300">
                        <MessageSquare className="h-5 w-5 text-blue-400" />
                        <span>{profileData.profile.phone}</span>
                      </div>
                    )}
                    {profileData?.profile?.website && (
                      <div className="flex items-center gap-3 text-gray-300">
                        <LinkIcon className="h-5 w-5 text-blue-400" />
                        <a
                          href={profileData.profile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline"
                        >
                          {profileData.profile.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-blue-400 mb-3">
                    Company Details
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3 text-gray-300">
                      <Briefcase className="h-5 w-5 text-blue-400" />
                      <span>
                        CIN: {profileData?.cinnumber || "Not provided"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Jobs & Internships Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Tabs defaultValue="jobs" className="w-full">
            <div className="flex justify-between items-center mb-4">
              <TabsList className="grid w-auto grid-cols-2 bg-gray-900 border border-gray-800 rounded-lg p-1 h-auto">
                <TabsTrigger
                  value="jobs"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white py-2 rounded-md px-4"
                >
                  <div className="flex items-center gap-2">
                    <Briefcase size={16} />
                    Jobs ({postedJobs.length})
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="internships"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white py-2 rounded-md px-4"
                >
                  <div className="flex items-center gap-2">
                    <FileText size={16} />
                    Internships ({internships.length})
                  </div>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="jobs" className="m-0">
                <Button
                  onClick={() => setShowPostJob(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <PlusCircle size={16} className="mr-2" />
                  Post Job
                </Button>
              </TabsContent>

              <TabsContent value="internships" className="m-0">
                <Button
                  onClick={() => setShowPostInternship(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <PlusCircle size={16} className="mr-2" />
                  Post Internship
                </Button>
              </TabsContent>
            </div>

            <TabsContent value="jobs" className="mt-0">
              {jobsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2  gap-4 p-4">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-20 w-full rounded-xl bg-gray-900/80 animate-pulse"
                    />
                  ))}
                </div>
              ) : postedJobs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                  {postedJobs.map((job, i) => (
                    <div key={i} className="w-full">
                      {renderJobCard(job)}
                    </div>
                  ))}
                  {postedJobs.length > 3 && (
                    <div
                      className="flex items-center justify-center p-6 rounded-xl bg-gray-900 border border-dashed border-gray-700 hover:border-blue-500 cursor-pointer transition-all duration-300 w-full"
                      onClick={() => navigate("/recruiter/jobs")}
                    >
                      <div className="text-center">
                        <p className="text-gray-400 mb-2">
                          View all {postedJobs.length} jobs
                        </p>
                        <Button variant="outline">See More</Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Card className="bg-gray-900 border-gray-800 rounded-xl">
                  <CardContent className="py-12 text-center">
                    <div className="mx-auto max-w-md space-y-4">
                      <Briefcase className="h-12 w-12 mx-auto text-gray-600" />
                      <h3 className="text-xl font-semibold text-gray-300">
                        No Jobs Posted Yet
                      </h3>
                      <p className="text-gray-400">
                        Start by posting your first job to find the right
                        candidates.
                      </p>
                      <Button
                        onClick={() => setShowPostJob(true)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <PlusCircle className="mr-2" size={16} />
                        Post a Job
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="internships" className="mt-0">
              {internshipsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                  {[...Array(2)].map((_, i) => (
                    <div
                      key={i}
                      className="h-20 w-full rounded-xl bg-gray-900/80 animate-pulse"
                    />
                  ))}
                </div>
              ) : internships.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                  {internships.map((internship) => (
                    <div key={internship._id}>
                      {renderInternshipCard(internship)}
                    </div>
                  ))}
                  {internships.length > 3 && (
                    <div
                      className="flex items-center justify-center p-6 rounded-xl bg-gray-900 border border-dashed border-gray-700 hover:border-blue-500 cursor-pointer transition-all duration-300 w-full"
                      onClick={() => navigate("/recruiter/internships")}
                    >
                      <div className="text-center">
                        <p className="text-gray-400 mb-2">
                          View all {internships.length} internships
                        </p>
                        <Button variant="outline">See More</Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Card className="bg-gray-900 border-gray-800 rounded-xl">
                  <CardContent className="py-12 text-center">
                    <div className="mx-auto max-w-md space-y-4">
                      <FileText className="h-12 w-12 mx-auto text-gray-600" />
                      <h3 className="text-xl font-semibold text-gray-300">
                        No Internships Posted Yet
                      </h3>
                      <p className="text-gray-400">
                        Share internship opportunities and connect with early
                        talent.
                      </p>
                      <Button
                        onClick={() => setShowPostInternship(true)}
                        className="bg-blue-600 hover:bg-blue-700 "
                      >
                        <PlusCircle className="mr-2" size={16} />
                        Post Internship
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default RecruiterProfile;
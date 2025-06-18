import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Mail, Briefcase, Link as LinkIcon, Pen, FileText, MapPin, Building2, Calendar, Users, Globe, MessageSquare, Bookmark, ChevronDown, UserPlus, BookmarkCheck, Loader2 } from "lucide-react";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { toast } from "sonner";
import Navbar from "./shared/Navbar";
import { Card, CardContent } from "./ui/card";
import PostJob from "./recruiter/PostJob";
import PostInternship from "./recruiter/PostInternship";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import FollowButton from "./FollowButton";

const RecruiterProfile = () => {
  const [profileData, setProfileData] = useState(null);
  const [postedJobs, setPostedJobs] = useState([]);
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPostJob, setShowPostJob] = useState(false);
  const [showPostInternship, setShowPostInternship] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [followersLoading, setFollowersLoading] = useState(false);
  const [followingLoading, setFollowingLoading] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [savedJobsMap, setSavedJobsMap] = useState({});
  const [savedInternshipsMap, setSavedInternshipsMap] = useState({});
  const { user: currentUser } = useSelector((store) => store.auth);
  const navigate = useNavigate();
  const { id } = useParams();
  const isOwnProfile = !id || id === currentUser?._id;
  const [followersOpen, setFollowersOpen] = useState(false);
  const [followingOpen, setFollowingOpen] = useState(false);
  const apiUrl = import.meta.env.VITE_BACKEND_URL;
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const profileRes = await axios.get(
          `${apiUrl}/api/v1/recruiter/profile/${isOwnProfile ? currentUser._id : id}`,
          { withCredentials: true }
        );
        setProfileData(profileRes.data.data);

        const jobsRes = await axios.get(
          `${apiUrl}/api/v1/job/recruiter/${isOwnProfile ? currentUser._id : id}`,
          { withCredentials: true }
        );
        setPostedJobs(jobsRes.data.jobs || []);

        const internshipsRes = await axios.get(
          `${apiUrl}/api/v1/internship/recruiter/${isOwnProfile ? currentUser._id : id}`,
          { withCredentials: true }
        );
        setInternships(internshipsRes.data.internships || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [currentUser?._id, id, isOwnProfile]);

  useEffect(() => {
    const fetchFollowData = async () => {
      if (!profileData?._id) return;

      try {
        setFollowersLoading(true);
        setFollowingLoading(true);

        const [followersRes, followingRes] = await Promise.all([
          axios.get(
            `${apiUrl}/api/v1/follow/followers/${profileData._id}/recruiter`,
            {
              headers: { "Content-Type": "application/json" },
              withCredentials: true,
            }
          ),
          axios.get(
            `${apiUrl}/api/v1/follow/following/${profileData._id}/recruiter`,
            {
              headers: { "Content-Type": "application/json" },
              withCredentials: true,
            }
          ),
        ]);
        console.log(followersRes)
        setFollowers(followersRes.data.data);
        setFollowing(followingRes.data.data);
      } catch (error) {
        console.error("Error fetching follow data:", error);
        toast.error("Failed to load connections");
      } finally {
        setFollowersLoading(false);
        setFollowingLoading(false);
      }
    };

    fetchFollowData();
  }, [profileData]);

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!currentUser?._id || !profileData?._id || isOwnProfile) return;

      try {
        const response = await axios.get(
          `${apiUrl}/api/v1/follow/check/${currentUser._id}/${profileData._id}`,
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );
        setIsFollowing(response.data.isFollowing);
      } catch (error) {
        console.error("Error checking follow status:", error);
      }
    };

    checkFollowStatus();
  }, [currentUser?._id, profileData?._id, isOwnProfile]);

  useEffect(() => {
    const fetchSavedStatuses = async () => {
      if (!currentUser || currentUser.role !== 'student' || isOwnProfile) return;

      const jobPromises = postedJobs.map(async (job) => {
        try {
          const response = await axios.get(
            `${apiUrl}/api/v1/job/is-saved/${job._id}`,
            { withCredentials: true }
          );
          return { jobId: job._id, isSaved: response.data.isSaved };
        } catch (error) {
          console.error(`Error checking saved status for job ${job._id}:`, error);
          return { jobId: job._id, isSaved: false };
        }
      });

      const internshipPromises = internships.map(async (internship) => {
        try {
          const response = await axios.get(
            `${apiUrl}/api/v1/internship/is-saved-internship/${internship._id}`,
            { withCredentials: true }
          );
          return { internshipId: internship._id, isSaved: response.data.isSaved };
        } catch (error) {
          console.error(`Error checking saved status for internship ${internship._id}:`, error);
          return { internshipId: internship._id, isSaved: false };
        }
      });

      const [jobResults, internshipResults] = await Promise.all([
        Promise.all(jobPromises),
        Promise.all(internshipPromises),
      ]);

      const newSavedJobsMap = {};
      jobResults.forEach(res => {
        newSavedJobsMap[res.jobId] = res.isSaved;
      });
      setSavedJobsMap(newSavedJobsMap);

      const newSavedInternshipsMap = {};
      internshipResults.forEach(res => {
        newSavedInternshipsMap[res.internshipId] = res.isSaved;
      });
      setSavedInternshipsMap(newSavedInternshipsMap);
    };

    if (postedJobs.length > 0 || internships.length > 0) {
      fetchSavedStatuses();
    }
  }, [postedJobs, internships, currentUser, isOwnProfile]);

  const handleJobPosted = async () => {
    try {
      const jobsRes = await axios.get(`${apiUrl}/api/v1/job/recruiter`, {
        withCredentials: true,
      });
      console.log("Response from job refetch after posting:", jobsRes.data);
      setPostedJobs(jobsRes.data.jobs || []);
      setShowPostJob(false);
    } catch (error) {
      console.error("Error fetching jobs after posting:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      } else if (error.request) {
        console.error("Error request:", error.request);
      } else {
        console.error("Error message:", error.message);
      }
    }
  };

  const handleInternshipPosted = async () => {
    try {
      const internshipsRes = await axios.get(
        `${apiUrl}/api/v1/internship/recruiter`,
        { withCredentials: true }
      );
      setInternships(internshipsRes.data.internships || []);
      setShowPostInternship(false);
    } catch (error) {
      console.error("Error fetching internships:", error);
    }
  };

  const handleDeleteJob = async (jobId) => {
    try {
      await axios.delete(`${apiUrl}/api/v1/job/delete/${jobId}`, {
        withCredentials: true,
      });
      setPostedJobs(postedJobs.filter(job => job._id !== jobId));
      toast.success("Job deleted successfully");
    } catch (error) {
      toast.error("Failed to delete job");
    }
  };

  const handleDeleteInternship = async (internshipId) => {
    try {
      await axios.delete(`${apiUrl}/api/v1/internship/delete/${internshipId}`, {
        withCredentials: true,
      });
      setInternships(internships.filter(internship => internship._id !== internshipId));
      toast.success("Internship deleted successfully");
    } catch (error) {
      toast.error("Failed to delete internship");
    }
  };

  const handleSaveJob = async (jobId) => {
    try {
      const response = await axios.post(
        `${apiUrl}/api/v1/job/save-job/${jobId}`,
        {},
        { withCredentials: true }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        setSavedJobsMap(prevMap => ({
          ...prevMap,
          [jobId]: response.data.isSaved
        }));
      } else {
        toast.error("Failed to save job");
      }
    } catch (error) {
      console.error("Error saving job:", error);
      toast.error("Failed to save job");
    }
  };

  const handleSaveInternship = async (internshipId) => {
    try {
      const response = await axios.post(
        `${apiUrl}/api/v1/internship/save-internship/${internshipId}`,
        {},
        { withCredentials: true }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        setSavedInternshipsMap(prevMap => ({
          ...prevMap,
          [internshipId]: response.data.isSaved
        }));
      } else {
        toast.error("Failed to save internship");
      }
    } catch (error) {
      console.error("Error saving internship:", error);
      toast.error("Failed to save internship");
    }
  };

  const handleFollow = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      setFollowLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/follow/toggle`,
        {
          targetUserId: profileData._id,
          targetUserType: 'recruiter'
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        setIsFollowing(!isFollowing);
        // Refresh followers count
        fetchFollowers();
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('Failed to update follow status');
    } finally {
      setFollowLoading(false);
    }
  };

  const fetchFollowers = async () => {
    try {
      setFollowersLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/follow/followers/${profileData._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setFollowers(response.data.followers);
    } catch (error) {
      console.error('Error fetching followers:', error);
    } finally {
      setFollowersLoading(false);
    }
  };

  const fetchFollowing = async () => {
    try {
      setFollowingLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/follow/following/${profileData._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setFollowing(response.data.following);
    } catch (error) {
      console.error('Error fetching following:', error);
    } finally {
      setFollowingLoading(false);
    }
  };

  const checkFollowStatus = async () => {
    if (!currentUser || !profileData) return;

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/follow/status/${profileData._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setIsFollowing(response.data.isFollowing);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  useEffect(() => {
    if (currentUser && profileData) {
      checkFollowStatus();
    }
  }, [currentUser, profileData]);

  useEffect(() => {
    if (profileData) {
      fetchFollowers();
      fetchFollowing();
    }
  }, [profileData]);

  const handleMessageClick = (profile) => {
    const selectedUser = {
      _id: profile._id,
      fullName: profile.companyname,
      email: profile.email,
      role: "recruiter",
      profilePhoto: profile.profile?.profilePhoto,
      identifier: profile.companyname || "Recruiter",
      isOnline: false,
    };
    localStorage.setItem("selectedUser", JSON.stringify(selectedUser));
    navigate("/messages");
  };

  const handleProfileClick = (user) => {
    navigate(
      user.userType === "recruiter"
        ? `/recruiter/profile/${user._id}`
        : `/profile/${user.userType}/${user._id}`
    );
  };

  const toggleFollowers = () => {
    setShowFollowers(!showFollowers);
    if (showFollowing) setShowFollowing(false);
  };

  const toggleFollowing = () => {
    setShowFollowing(!showFollowing);
    if (showFollowers) setShowFollowers(false);
  };

  const renderJobCard = (job) => (
    <div
      key={job._id}
      className="relative p-6 rounded-xl bg-gray-950 text-white border border-gray-800 hover:border-blue-500 cursor-pointer transition-all duration-300 w-full"
      onClick={() => navigate(`/job/details/${job._id}`)}
    >
      <div className="absolute top-4 right-4 flex gap-2">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            navigate(isOwnProfile ? `/job/details/${job._id}` : `/job/description/${job._id}`);
          }}
          size="sm"
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          View
        </Button>
        {isOwnProfile ? (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteJob(job._id);
            }}
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Delete
          </Button>
        ) : (
          !isOwnProfile && currentUser?.role === 'student' && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleSaveJob(job._id);
              }}
              size="sm"
              className={`text-white ${savedJobsMap[job._id]
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-blue-600 hover:bg-blue-700'
                }`}
            >
              {savedJobsMap[job._id] ? (
                <BookmarkCheck className="h-4 w-4 mr-1" />
              ) : (
                <Bookmark className="h-4 w-4 mr-1" />
              )}
              {savedJobsMap[job._id] ? "Saved" : "Save"}
            </Button>
          )
        )}
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
    </div>
  );

  const renderInternshipCard = (internship) => (
    <div
      key={internship._id}
      className="relative p-6 rounded-xl bg-gray-950 text-white border border-gray-800 hover:border-blue-500 cursor-pointer transition-all duration-300 w-full"
      onClick={() => navigate(isOwnProfile ? `/internship/details/${internship._id}` : `/internship/description/${internship._id}`)}
    >
      <div className="absolute top-4 right-4 flex gap-2">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            navigate(isOwnProfile ? `/internship/details/${internship._id}` : `/internship/description/${internship._id}`);
          }}
          size="sm"
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          View Details
        </Button>
        {isOwnProfile ? (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteInternship(internship._id);
            }}
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Delete
          </Button>
        ) : (
          !isOwnProfile && currentUser?.role === 'student' && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleSaveInternship(internship._id);
              }}
              size="sm"
              className={`text-white ${savedInternshipsMap[internship._id]
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-blue-600 hover:bg-blue-700'
                }`}
            >
              {savedInternshipsMap[internship._id] ? (
                <BookmarkCheck className="h-4 w-4 mr-1" />
              ) : (
                <Bookmark className="h-4 w-4 mr-1" />
              )}
              {savedInternshipsMap[internship._id] ? "Saved" : "Save"}
            </Button>
          )
        )}
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
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="bg-black text-white min-h-screen py-8 flex items-center justify-center">
        <p className="text-lg text-gray-400">Recruiter profile not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Card className="bg-gray-950 border border-gray-800">
            <CardContent className="p-6">
              {/* Action Buttons - Top Right Corner */}
              <div className="flex justify-end gap-2 mb-4">
                {!isOwnProfile && currentUser?.role && (
                  <div className="flex gap-3 mt-4 md:mt-0">
                    <Button
                      onClick={() => handleMessageClick(profileData)}
                      variant="outline"
                      size="sm"
                      className="flex-1 text-blue-400 border-blue-400/30 hover:bg-blue-400/10 hover:text-blue-300 cursor-pointer"
                    >
                      <MessageSquare className="h-5 w-5" />
                      Message
                    </Button>
                    <FollowButton
                      userId={profileData._id}
                      userType="recruiter"
                      size="sm"
                      className="flex-1 bg-gray-800 hover:bg-gray-700 border-gray-700 cursor-pointer"
                    />
                  </div>
                )}
                {isOwnProfile && (
                  <>
                    <Button
                      onClick={() => setShowPostJob(true)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Briefcase className="w-4 h-4 mr-2" />
                      Post Job
                    </Button>
                    <Button
                      onClick={() => setShowPostInternship(true)}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Post Internship
                    </Button>
                  </>
                )}
              </div>

              <div className="flex flex-col md:flex-row gap-6">
                {/* Left side - Profile picture and company name */}
                <div className="flex flex-col items-center md:w-1/4">
                  <Avatar className="h-32 w-32 mb-4 border-2 border-blue-500">
                    <AvatarImage src={profileData?.profile?.profilePhoto} />
                    <AvatarFallback className="bg-gray-800 text-blue-400 text-3xl">
                      {profileData?.companyname?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-semibold text-center text-blue-400">
                    {profileData?.companyname}
                  </h2>

                  {/* Followers/Following */}
                  <div className="flex items-center gap-4 mt-6">
                    <div className="relative">
                      <Button
                        id="followers-button"
                        variant="ghost"
                        className="text-gray-300 hover:text-blue-400 hover:bg-blue-400/10"
                        onClick={() => {
                          setFollowersOpen(!followersOpen);
                          setFollowingOpen(false);
                        }}
                      >
                        <Users className="h-5 w-5 mr-2" />
                        {followersLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <span>{followers?.length || 0} Followers</span>
                        )}
                      </Button>
                      {followersOpen && (
                        <div
                          id="followers-popup"
                          className="absolute top-full left-0 mt-2 w-72 bg-black border border-gray-700 rounded-lg shadow-xl z-50"
                        >
                          <div className="p-4">
                            <h3 className="font-semibold text-blue-400 mb-3">
                              Followers
                            </h3>
                            <ScrollArea className="h-64 pr-3">
                              {followersLoading ? (
                                <div className="flex justify-center items-center h-40">
                                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                                </div>
                              ) : followers?.length > 0 ? (
                                <div className="space-y-3">
                                  {followers.map((follower) => (
                                    <div
                                      key={follower._id}
                                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700/50 cursor-pointer transition-colors"
                                      onClick={() => {
                                        handleProfileClick(follower);
                                        setFollowersOpen(false);
                                      }}
                                    >
                                      <Avatar className="h-9 w-9">
                                        <AvatarImage
                                          src={follower.profile?.profilePhoto}
                                        />
                                        <AvatarFallback className="bg-gray-700 text-blue-400">
                                          {(
                                            follower.fullname || follower.companyname
                                          )?.charAt(0)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium text-white truncate">
                                          {follower.fullname || follower.companyname}
                                        </p>
                                        <p className="text-sm text-gray-400 truncate">
                                          {follower.role}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-gray-400 text-center py-6">
                                  No followers yet
                                </p>
                              )}
                            </ScrollArea>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="relative">
                      <Button
                        id="following-button"
                        variant="ghost"
                        className="text-gray-300 hover:text-blue-400 hover:bg-blue-400/10"
                        onClick={() => {
                          setFollowingOpen(!followingOpen);
                          setFollowersOpen(false);
                        }}
                      >
                        <Users className="h-5 w-5 mr-2" />
                        {followingLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <span>{following?.length || 0} Following</span>
                        )}
                      </Button>
                      {followingOpen && (
                        <div
                          id="following-popup"
                          className="absolute top-full left-0 mt-2 w-72 bg-black border border-gray-700 rounded-lg shadow-xl z-50"
                        >
                          <div className="p-4">
                            <h3 className="font-semibold text-blue-400 mb-3">
                              Following
                            </h3>
                            <ScrollArea className="h-64 pr-3">
                              {followingLoading ? (
                                <div className="flex justify-center items-center h-40">
                                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                                </div>
                              ) : following?.length > 0 ? (
                                <div className="space-y-3">
                                  {following.map((followed) => (
                                    <div
                                      key={followed._id}
                                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700/50 cursor-pointer transition-colors"
                                      onClick={() => {
                                        handleProfileClick(followed);
                                        setFollowingOpen(false);
                                      }}
                                    >
                                      <Avatar className="h-9 w-9">
                                        <AvatarImage
                                          src={followed.profile?.profilePhoto}
                                        />
                                        <AvatarFallback className="bg-gray-700 text-blue-400">
                                          {(
                                            followed.fullname || followed.companyname
                                          )?.charAt(0)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium text-white truncate">
                                          {followed.fullname || followed.companyname}
                                        </p>
                                        <p className="text-sm text-gray-400 truncate">
                                          {followed.role}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-gray-400 text-center py-6">
                                  Not following anyone yet
                                </p>
                              )}
                            </ScrollArea>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side - Recruiter information */}
                <div className="flex-1 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h1 className="text-2xl font-bold">
                        {profileData?.companyname}
                      </h1>
                      <p className="text-gray-400">
                        {profileData?.profile?.tagline || "Recruiter"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-blue-400" />
                        <span>
                          Industry: {profileData?.industry || "Technology"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-400" />
                        <span>
                          Company Size:{" "}
                          {profileData?.companysize || "50-200 employees"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-blue-400" />
                        <span>
                          Company Type:{" "}
                          {profileData?.companytype || "Private Limited"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-blue-400" />
                        <span>
                          CIN: {profileData?.cinnumber || "U72900KA2023PTC123456"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-blue-400" />
                        <span>{profileData?.email}</span>
                      </div>
                      {profileData?.profile?.phone && (
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-5 w-5 text-blue-400" />
                          <span>{profileData.profile.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-blue-400" />
                        <span>
                          {profileData?.companyaddress ||
                            "123 Tech Park, Bangalore, Karnataka, India"}
                        </span>
                      </div>
                      {profileData?.profile?.website && (
                        <div className="flex items-center gap-2">
                          <LinkIcon className="h-5 w-5 text-blue-400" />
                          <a
                            href={profileData.profile.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline flex items-center gap-1 text-sm mt-1"
                          >
                            <Globe className="h-4 w-4" /> {profileData.profile.website}
                          </a>
                        </div>
                      )}
                      {profileData?.createdAt && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-blue-400" />
                          <span>
                            Member since:{" "}
                            {new Date(
                              profileData.createdAt
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {profileData?.profile?.bio && (
                    <div className="mt-4">
                      <h3 className="text-sm font-semibold text-blue-400 mb-2">
                        About Company
                      </h3>
                      <p className="text-gray-300">{profileData.profile.bio}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs for Posted Jobs, Internships, Applicants */}
          <Tabs defaultValue="jobs" className="w-full mt-8">
            <TabsList className="bg-gray-900 border border-gray-800 grid w-full grid-cols-2">
              <TabsTrigger
                value="jobs"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-colors duration-200"
              >
                <Briefcase className="w-4 h-4 mr-2" />
                Posted Jobs
              </TabsTrigger>
              <TabsTrigger
                value="internships"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-colors duration-200"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Posted Internships
              </TabsTrigger>
            </TabsList>

            <TabsContent value="jobs" className="mt-6">
              {postedJobs.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <Briefcase className="h-12 w-12 mx-auto mb-4" />
                  <p>No jobs posted yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
                  {postedJobs.map((job) => renderJobCard(job))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="internships" className="mt-6">
              {internships.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4" />
                  <p>No internships posted yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
                  {internships.map((internship) => renderInternshipCard(internship))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Post Job Modal */}
          {showPostJob && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <PostJob onClose={() => setShowPostJob(false)} onSuccess={handleJobPosted} />
            </div>
          )}

          {/* Post Internship Modal */}
          {showPostInternship && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <PostInternship onClose={() => setShowPostInternship(false)} onSuccess={handleInternshipPosted} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecruiterProfile;
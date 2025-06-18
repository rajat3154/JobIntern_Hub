import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  MessageSquare,
  Search,
  Users,
  Briefcase,
  GraduationCap,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import FollowButton from "./FollowButton";
import Navbar from "./shared/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "./ui/skeleton";
import { Badge } from "./ui/badge";

import { useDispatch } from "react-redux";
import { setSelectedUser } from "../redux/authSlice";

const Discover = () => {
  const dispatch = useDispatch();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { user: authUser } = useSelector((store) => store.auth);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const [studentsRes, recruitersRes] = await Promise.all([
          axios.get("http://localhost:8000/api/v1/students", {
            withCredentials: true,
          }),
          axios.get("http://localhost:8000/api/v1/recruiter/recruiters", {
            withCredentials: true,
          }),
        ]);

        const students = (studentsRes.data?.data || [])
          .filter((student) => student._id !== authUser?._id)
          .map((student) => ({
            ...student,
            userType: "student",
            displayName: student.fullname,
          }));

        const recruiters = (recruitersRes.data?.recruiters || [])
          .filter((recruiter) => recruiter._id !== authUser?._id)
          .map((recruiter) => ({
            ...recruiter,
            userType: "recruiter",
            displayName: recruiter.companyname,
          }));

        setUsers([...students, ...recruiters]);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [authUser?._id]);

  const filteredUsers = users.filter(
    (user) =>
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.userType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMessageClick = (user) => {
    const selectedUser = {
      _id: user._id,
      fullName: user.displayName,
      email: user.email,
      role: user.userType,
      profilePhoto: user.profile?.profilePhoto,
      lastSeen: user.lastSeen || null,
      identifier:
        user.userType === "student"
          ? "Student"
          : user.companyname || "Recruiter",
    };
    localStorage.setItem("selectedUser", JSON.stringify(selectedUser));
    dispatch(setSelectedUser(selectedUser));
    navigate("/messages");
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <Users className="h-8 w-8 text-blue-400" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Discover Peoples and Companies
            </h1>
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name, email, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-900/70 border-gray-700 text-white pl-10 focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-gray-900/50 rounded-xl border border-gray-800 p-6"
              >
                <div className="flex items-center gap-4 mb-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-3 w-full mb-4" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 flex-1" />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <AnimatePresence>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredUsers.map((user, index) => (
                <motion.div
                  key={user._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -5 }}
                  className="bg-gradient-to-b from-gray-900/80 to-gray-900/50 rounded-xl border border-gray-800/50 p-6 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10 transition-all"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className="flex items-center gap-4 cursor-pointer group"
                      onClick={() => navigate(`/profile/${user.userType}/${user._id}`)}
                    >
                      <Avatar className="h-16 w-16 border-2 border-blue-500/50 group-hover:border-blue-500 transition-colors">
                        <AvatarImage src={user.profile?.profilePhoto} />
                        <AvatarFallback className="bg-gray-800 text-blue-400 font-medium">
                          {user.displayName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-white truncate max-w-[150px] group-hover:text-blue-400 transition-colors">
                          {user.displayName}
                        </h3>
                        <Badge
                          variant="outline"
                          className={`mt-1 text-xs ${
                            user.userType === "student"
                              ? "bg-blue-900/30 text-blue-300 border-blue-800"
                              : "bg-purple-900/30 text-purple-300 border-purple-800"
                          }`}
                        >
                          {user.userType === "student" ? (
                            <GraduationCap className="h-3 w-3 mr-1" />
                          ) : (
                            <Briefcase className="h-3 w-3 mr-1" />
                          )}
                          {user.userType}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-400 mb-4 truncate">
                    {user.email}
                  </p>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-blue-400 border-blue-400/30 hover:bg-blue-400/10 hover:text-blue-300"
                      onClick={() => handleMessageClick(user)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                    <FollowButton
                      userId={user._id}
                      userType={user.userType}
                      className="flex-1 bg-gray-800 hover:bg-gray-700 border-gray-700"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}

        <AnimatePresence>
          {!loading && filteredUsers.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="mx-auto max-w-md">
                <Search className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">
                  No users found
                </h3>
                <p className="text-gray-500">
                  {searchTerm
                    ? "Try adjusting your search query"
                    : "There are no users to display at this time"}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Discover;

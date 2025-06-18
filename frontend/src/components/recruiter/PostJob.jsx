import React, { useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import axios from "axios";
import { JOB_API_END_POINT } from "@/utils/constant";
import { toast } from "sonner";
import { Loader2, X, ChevronRight, Briefcase } from "lucide-react";
import { motion } from "framer-motion";
import { Textarea } from "../ui/textarea";

const PostJob = ({ onClose, onSuccess }) => {
  const [input, setInput] = useState({
    title: "",
    description: "",
    requirements: "",
    salary: "",
    location: "",
    jobType: "",
    experience: "",
    position: 0,
    recruiterId: "",
  });

  const [loading, setLoading] = useState(false);

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const payload = {
        ...input,
        requirements: input.requirements
          .split(",")
          .map((req) => req.trim())
          .filter(Boolean),
      };

      const res = await axios.post(`${JOB_API_END_POINT}/post`, payload, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      if (res.data.success) {
        toast.success(res.data.message);
        onSuccess();
      }
    } catch (error) {
      console.error("Axios error:", error);
      toast.error(error.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl bg-gradient-to-br from-gray-900 to-gray-950 rounded-xl shadow-xl border border-gray-800 overflow-hidden"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <Briefcase className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Post New Job
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={submitHandler} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-2"
              >
                <Label className="text-gray-300">Title*</Label>
                <Input
                  name="title"
                  value={input.title}
                  onChange={changeEventHandler}
                  placeholder="Software Engineer"
                  required
                  className="bg-gray-800/50 border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                />
              </motion.div>

              {/* Salary */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-2"
              >
                <Label className="text-gray-300">Salary*</Label>
                <Input
                  name="salary"
                  value={input.salary}
                  onChange={changeEventHandler}
                  placeholder="$80,000 - $100,000"
                  required
                  className="bg-gray-800/50 border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                />
              </motion.div>

              {/* Location */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-2"
              >
                <Label className="text-gray-300">Location*</Label>
                <Input
                  name="location"
                  value={input.location}
                  onChange={changeEventHandler}
                  placeholder="New York, NY or Remote"
                  required
                  className="bg-gray-800/50 border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                />
              </motion.div>

              {/* Job Type */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
                <Label className="text-gray-300">Job Type*</Label>
                <Input
                  name="jobType"
                  value={input.jobType}
                  onChange={changeEventHandler}
                  placeholder="Full-time, Part-time, Contract"
                  required
                  className="bg-gray-800/50 border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                />
              </motion.div>

              {/* Experience */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-2"
              >
                <Label className="text-gray-300">Experience*</Label>
                <Input
                  name="experience"
                  value={input.experience}
                  onChange={changeEventHandler}
                  placeholder="3+ years"
                  required
                  className="bg-gray-800/50 border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                />
              </motion.div>

              {/* Positions */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-2"
              >
                <Label className="text-gray-300">Positions*</Label>
                <Input
                  type="number"
                  name="position"
                  value={input.position}
                  onChange={changeEventHandler}
                  placeholder="Number of openings"
                  required
                  className="bg-gray-800/50 border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                />
              </motion.div>

              {/* Description */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="col-span-full space-y-2"
              >
                <Label className="text-gray-300">Description*</Label>
                <Textarea
                  name="description"
                  value={input.description}
                  onChange={changeEventHandler}
                  placeholder="Detailed job description..."
                  rows={4}
                  required
                  className="bg-gray-800/50 border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                />
              </motion.div>

              {/* Requirements */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="col-span-full space-y-2"
              >
                <Label className="text-gray-300">Requirements*</Label>
                <Textarea
                  name="requirements"
                  value={input.requirements}
                  onChange={changeEventHandler}
                  placeholder="Required skills and qualifications..."
                  rows={4}
                  required
                  className="bg-gray-800/50 border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                />
              </motion.div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-2">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="border-gray-700 hover:bg-gray-800/50 px-6"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 px-6"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    Post Job <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default PostJob;

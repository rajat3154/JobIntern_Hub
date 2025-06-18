import React, { useState } from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Loader2, X, ChevronRight, Briefcase } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { INTERNSHIP_API_END_POINT } from "@/utils/constant";
import { Textarea } from "../ui/textarea";
import { motion } from "framer-motion";

const PostInternship = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: "",
    stipend: "",
    location: "",
    skills: "",
    type: "Remote",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        `${INTERNSHIP_API_END_POINT}/post`,
        formData,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        toast.success("Internship posted successfully!");
        onSuccess(res.data.internship);
      }
    } catch (error) {
      console.error("Error posting internship:", error.response || error);
      toast.error(error.response?.data?.message || "Failed to post internship");
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
                Post New Internship
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
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Frontend Developer Intern"
                  required
                  className="bg-gray-800/50 border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                />
              </motion.div>

              {/* Duration */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-2"
              >
                <Label className="text-gray-300">Duration*</Label>
                <Input
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="3 months"
                  required
                  className="bg-gray-800/50 border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                />
              </motion.div>

              {/* Stipend */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-2"
              >
                <Label className="text-gray-300">Stipend*</Label>
                <Input
                  name="stipend"
                  value={formData.stipend}
                  onChange={handleChange}
                  placeholder="$1000/month"
                  required
                  className="bg-gray-800/50 border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                />
              </motion.div>

              {/* Location */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
                <Label className="text-gray-300">Location*</Label>
                <Input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Remote or Office location"
                  required
                  className="bg-gray-800/50 border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                />
              </motion.div>

              {/* Type */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-2"
              >
                <Label className="text-gray-300">Type*</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger className="bg-gray-800/50 border-gray-700 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="Remote" className="hover:bg-gray-700">
                      Remote
                    </SelectItem>
                    <SelectItem value="In-office" className="hover:bg-gray-700">
                      In-office
                    </SelectItem>
                    <SelectItem value="Hybrid" className="hover:bg-gray-700">
                      Hybrid
                    </SelectItem>
                  </SelectContent>
                </Select>
              </motion.div>

              {/* Skills */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-2"
              >
                <Label className="text-gray-300">Skills*</Label>
                <Input
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="React, JavaScript, CSS"
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
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Detailed description of the internship..."
                  rows={5}
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
              {loading ? (
                <Button className="bg-blue-600 hover:bg-blue-700 px-6" disabled>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Posting...
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 px-6"
                >
                  Post Internship <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default PostInternship;

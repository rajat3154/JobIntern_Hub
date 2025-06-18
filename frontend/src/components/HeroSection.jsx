import React from "react";
import { Button } from "./ui/button";
import { Search, Rocket, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useSearch } from "../context/SearchContext";

const HeroSection = () => {
  const { searchQuery, setSearchQuery } = useSearch();

  return (
    <div className="relative bg-black text-white py-28 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/10 to-transparent"></div>
      </div>

      <div className="container mx-auto text-center px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mb-8 text-sm font-medium"
        >
          <Sparkles className="h-4 w-4" />
          <span>No.1 Job & Internship Platform</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
        >
          <span className="block">Search, Apply &</span>
          <span className="block mt-3">
            Land Your{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Dream Role
            </span>
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-xl mb-12 max-w-[700px] mx-auto text-gray-300"
        >
          Discover your perfect career opportunity from thousands of jobs and
          internships at top companies worldwide.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex w-full max-w-2xl mx-auto bg-gradient-to-r from-gray-900/50 to-gray-800/20 backdrop-blur-lg border border-gray-700 rounded-full items-center gap-2 p-1 shadow-xl hover:shadow-blue-500/20 transition-shadow"
        >
          <input
            type="text"
            placeholder="Job title, keywords, or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-4 pl-6 pr-2 bg-transparent text-white placeholder-gray-400 border-none focus:ring-0 outline-none"
          />

          <Button
            size="lg"
            className="rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-8 py-6 gap-2 transition-transform hover:scale-105"
          >
            <Search className="h-5 w-5" />
            Search
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 flex justify-center gap-8 text-gray-300 text-sm"
        >
          <div className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-green-400" />
            <span>10,000+ Success Stories</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🚀</span>
            <span>50,000+ Opportunities</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;

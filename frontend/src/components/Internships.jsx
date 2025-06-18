import React, { useEffect, useState } from "react";
import Navbar from "./shared/Navbar";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import PostInternship from "./recruiter/PostInternship";
import { Button } from "./ui/button";
import { setAllInternships } from "../redux/internshipSlice";
import LatestInternshipCards from "./LatestInternshipCards";
import { Search } from "lucide-react";

const Internships = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.auth);
  const { allInternships } = useSelector((store) => store.internship);

  const [recruiterInternships, setRecruiterInternships] = useState([]);
  const [filteredInternships, setFilteredInternships] = useState([]);
  const [filteredRecruiterInternships, setFilteredRecruiterInternships] =
    useState([]);
  const [showPostInternship, setShowPostInternship] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchInternships = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/api/v1/internship/get",
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      const data = await response.json();

      if (data.success && Array.isArray(data.internships)) {
        dispatch(setAllInternships(data.internships));
        setFilteredInternships(data.internships);
      }
    } catch (error) {
      console.error("Error fetching internships:", error);
    }
  };

  const fetchRecruiterInternships = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/api/v1/internship/recruiter",
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      const data = await response.json();

      if (data.success && Array.isArray(data.internships)) {
        setRecruiterInternships(data.internships);
        setFilteredRecruiterInternships(data.internships);
      }
    } catch (error) {
      console.error("Error fetching recruiter internships:", error);
    }
  };

  // Apply search filter
  useEffect(() => {
    const filterInternships = (internships) => {
      if (!searchTerm) return internships;

      const searchLower = searchTerm.toLowerCase();
      return internships.filter((internship) => {
        return (
          internship.title.toLowerCase().includes(searchLower) ||
          internship.description.toLowerCase().includes(searchLower) ||
          internship.company?.toLowerCase().includes(searchLower) ||
          internship.location.toLowerCase().includes(searchLower) ||
          (internship.skills &&
            internship.skills.some((skill) =>
              skill.toLowerCase().includes(searchLower)
            ))
        );
      });
    };

    setFilteredInternships(filterInternships(allInternships));
    setFilteredRecruiterInternships(filterInternships(recruiterInternships));
  }, [searchTerm, allInternships, recruiterInternships]);

  useEffect(() => {
    fetchInternships();
    if (user?.role === "recruiter") {
      fetchRecruiterInternships();
    }
  }, [dispatch, user]);

  return (
    <div className="bg-black text-white min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto text-center py-10">
        <h1 className="text-3xl font-bold mb-3 text-blue-500">
          Explore <span className="text-white text-4xl">Internships</span>
        </h1>
        <p className="text-lg text-gray-300">
          Gain hands-on experience and kickstart your career!
        </p>
        {user?.role === "recruiter" && (
          <Button
            onClick={() => setShowPostInternship(true)}
            className="mt-4 bg-green-500 hover:bg-green-600"
          >
            Post New Internship
          </Button>
        )}
      </div>

      {/* Search Bar */}
      <div className="container mx-auto px-4 mb-6">
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search internships by title, company, location, or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Post Internship Modal */}
      {showPostInternship && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <PostInternship
            onClose={() => setShowPostInternship(false)}
            onSuccess={() => {
              fetchRecruiterInternships();
              fetchInternships();
              setShowPostInternship(false);
            }}
          />
        </div>
      )}

      {/* Recruiter's Internships */}
      {user?.role === "recruiter" && (
        <div className="container mx-auto px-4 pb-10">
          <h2 className="text-2xl font-bold text-left text-green-400 mb-4">
            Your Posted Internships
          </h2>
          {filteredRecruiterInternships.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecruiterInternships.map((internship) => (
                <LatestInternshipCards
                  key={internship._id}
                  internship={internship}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10">
              <p className="text-gray-400 text-xl font-medium mb-2">
                {searchTerm
                  ? "No internships match your search"
                  : "You haven't posted any internships yet"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* All Internships - show only if role is student */}
      {user?.role === "student" && (
        <div className="container mx-auto px-4 pb-10">
          <h2 className="text-2xl font-semibold text-blue-400 mb-4">
            Available Internships
          </h2>
          {filteredInternships.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredInternships.map((internship) => (
                <LatestInternshipCards
                  key={internship._id}
                  internship={internship}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10">
              <p className="text-gray-400 text-xl font-medium mb-2">
                {searchTerm
                  ? "No internships match your search"
                  : "No internships available"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Internships;

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import LatestInternshipCards from "./LatestInternshipCards";
import { toast } from "sonner";
import { useSearch } from "../context/SearchContext";

const LatestInternships = () => {
  const [latestInternships, setLatestInternships] = useState([]);
  const navigate = useNavigate();
  const { user } = useSelector((store) => store.auth);
  const { searchQuery } = useSearch();

  const fetchLatestInternships = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/api/v1/internship/latest",
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await response.json();
      if (data.success && Array.isArray(data.internships)) {
        setLatestInternships(data.internships);
      }
    } catch (error) {
      console.error("Error fetching latest internships:", error);
    }
  };

  useEffect(() => {
    fetchLatestInternships();
  }, []);

  const filteredInternships = latestInternships.filter((internship) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      internship.title.toLowerCase().includes(query) ||
      (internship.description &&
        internship.description.toLowerCase().includes(query)) ||
      (internship.recruiter?.companyname &&
        internship.recruiter.companyname.toLowerCase().includes(query)) ||
      (internship.location &&
        internship.location.toLowerCase().includes(query)) ||
      (internship.type && internship.type.toLowerCase().includes(query)) ||
      (internship.skills &&
        internship.skills.some((skill) => skill.toLowerCase().includes(query)))
    );
  });

  return (
    <div className="bg-black text-white py-16">
      <div className="container mx-auto text-center px-4">
        <h1 className="text-5xl font-bold mb-10">
          <span className="text-blue-500 text-3xl">Latest and Top </span>
          Internships
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mx-4">
          {filteredInternships.length <= 0 ? (
            <span className="col-span-full text-gray-400 text-lg">
              {searchQuery
                ? "No internships match your search"
                : "No internships available"}
            </span>
          ) : (
            filteredInternships.map((internship) => (
              <LatestInternshipCards
                key={internship._id}
                internship={internship}
              />
            ))
          )}

          <Link
            to="/internships"
            className="w-full p-6 rounded-lg shadow-lg bg-black text-white border border-blue-500 hover:bg-gray-800 cursor-pointer transition duration-300 flex flex-col items-center justify-center"
          >
            <h2 className="text-2xl font-bold text-blue-400">
              View More Internships
            </h2>
            <p className="mt-2 text-gray-300 text-lg">
              Explore all internship opportunities
            </p>
            <div className="mt-6 flex justify-center">
              <button className="w-12 h-12 flex items-center justify-center rounded-full border border-blue-500 text-blue-400 text-2xl cursor-pointer hover:text-white transition duration-300">
                ➡️
              </button>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LatestInternships;

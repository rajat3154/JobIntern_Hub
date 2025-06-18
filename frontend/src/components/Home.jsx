import React from "react";
import Navbar from "./shared/Navbar";
import HeroSection from "./HeroSection";
import CategoryCarousel from "./CategoryCarousel";
import LatestJobs from "./LatestJobs";
import LatestInternships from "./LatestInternships";
import Footer from "./Footer";
import { SearchProvider, useSearch } from "../context/SearchContext";

const HomeContent = () => {
  const { setSearchQuery } = useSearch();

  return (
    <>
      <Navbar />
      <HeroSection />
      <CategoryCarousel setQuery={setSearchQuery} />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8">
          <div>
            <LatestJobs />
            <LatestInternships />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

const Home = () => {
  return (
    <SearchProvider>
      <div className="bg-black text-white">
        <HomeContent />
      </div>
    </SearchProvider>
  );
};

export default Home;

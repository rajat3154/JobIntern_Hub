import React from "react";

const Footer = () => {
  return (
    <footer className="relative bg-black text-white py-12">
      {/* Gradient Border */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-black"></div>

      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 px-6">
        {/* Branding Section */}
        <div>
          <h1 className="text-2xl font-bold mb-4">JobInternHub</h1>
          <p className="text-sm text-gray-400 leading-relaxed">
            Your trusted platform to connect employers with skilled candidates.
            Find your dream <b>job</b> or <b>internship</b> and kickstart your
            career with the best opportunities.
          </p>
        </div>

        {/* Navigation Links */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Quick Links</h2>
          <ul className="space-y-3 text-sm text-gray-400">
            <li>
              <a href="/" className="hover:text-blue-400 transition-colors">
                Home
              </a>
            </li>
            <li>
              <a href="/jobs" className="hover:text-blue-400 transition-colors">
                Find Jobs
              </a>
            </li>
            <li>
              <a
                href="/internships"
                className="hover:text-blue-400 transition-colors"
              >
                Find Internships
              </a>
            </li>
            <li>
              <a
                href="/employers"
                className="hover:text-blue-400 transition-colors"
              >
                For Employers
              </a>
            </li>
            <li>
              <a
                href="/about"
                className="hover:text-blue-400 transition-colors"
              >
                About Us
              </a>
            </li>
            <li>
              <a
                href="/contact"
                className="hover:text-blue-400 transition-colors"
              >
                Contact Us
              </a>
            </li>
          </ul>
        </div>

        {/* Contact Information */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Contact Us</h2>
          <p className="text-sm text-gray-400">
            Email:{" "}
            <a
              href="mailto:support@jobinternhub.com"
              className="hover:text-blue-400 transition-colors"
            >
             jobinternhub@gmail.com
            </a>
          </p>
          <p className="text-sm text-gray-400">Phone: 98547 65478</p>
          <p className="text-sm text-gray-400">
            Address: 123 JobInternHub Lane, NY, USA
          </p>
        </div>

        {/* Social Media Links */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Follow Us</h2>
          <div className="flex space-x-4">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-500 transition-colors"
            >
              <i className="fab fa-facebook-f"></i> Facebook
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-400 transition-colors"
            >
              <i className="fab fa-twitter"></i> Twitter
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-700 transition-colors"
            >
              <i className="fab fa-linkedin"></i> LinkedIn
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-pink-500 transition-colors"
            >
              <i className="fab fa-instagram"></i> Instagram
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-800 mt-8 py-4 text-center text-sm text-gray-400">
        <p>
          &copy; {new Date().getFullYear()}{" "}
          <span className="font-bold text-white ">JobInternHub</span>. All
          rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;

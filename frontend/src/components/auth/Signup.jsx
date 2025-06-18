import React, { useState } from "react";
import Navbar from "../shared/Navbar";
import { Button } from "../ui/button";
import { ChevronRight, Check, User, Briefcase, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import Login from "./Login";
import RecruiterSignup from "../RecruiterSignup";
import StudentSignup from "../StudentSignup";

// STEP COMPONENTS (all inline)
const WelcomeStep = ({ onNext }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    className="space-y-6"
  >
    <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
      Welcome to JobInternHub
    </h2>
    <p className="text-gray-400 text-lg">
      Your gateway to amazing career opportunities and top talent.
    </p>
    <Button
      onClick={onNext}
      className="bg-blue-600 hover:bg-blue-700 px-8 py-4 text-lg"
    >
      Get Started <ChevronRight className="ml-2" />
    </Button>
  </motion.div>
);

const RoleStep = ({ onSelect }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    className="space-y-6"
  >
    <h2 className="text-3xl font-bold text-blue-400">Choose Your Path</h2>
    <div className="grid gap-6 md:grid-cols-2">
      {["student", "recruiter"].map((role) => {
        const Icon = role === "student" ? User : Briefcase;
        const color = role === "student" ? "blue" : "green";
        return (
          <button
            key={role}
            onClick={() => onSelect(role)}
            className={`p-8 border-2 rounded-xl transition-all duration-300 border-gray-700 hover:border-${color}-400 hover:bg-${color}-500/5`}
          >
            <Icon className={`w-12 h-12 text-${color}-400 mb-4 mx-auto`} />
            <h3 className={`text-xl font-semibold text-${color}-400`}>
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </h3>
            <p className="text-gray-400 mt-2">
              {role === "student"
                ? "Discover your dream career opportunities"
                : "Connect with top-tier talent"}
            </p>
          </button>
        );
      })}
    </div>
  </motion.div>
);

const SuccessStep = ({ onNext }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center space-y-6"
  >
    <div className="inline-block p-4 rounded-full bg-green-500/20">
      <Check className="w-16 h-16 text-green-400" />
    </div>
    <h2 className="text-3xl font-bold text-white">Signup Successful!</h2>
    <p className="text-gray-400 text-lg">
      Your account has been created successfully
    </p>
    <Button
      onClick={onNext}
      className="bg-blue-600 hover:bg-blue-700 px-8 py-4 text-lg"
    >
      Continue to Login <ChevronRight className="ml-2" />
    </Button>
  </motion.div>
);

// MAIN COMPONENT
const Signup = () => {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");
  const [formData, setFormData] = useState({});
  const [isSignupComplete, setIsSignupComplete] = useState(false);

  const steps = [
    { id: 1, title: "Welcome", icon: <User size={18} /> },
    { id: 2, title: "Select Role", icon: <Briefcase size={18} /> },
    { id: 3, title: "Sign Up", icon: <Check size={18} /> },
    { id: 4, title: "Login", icon: <Check size={18} /> },
  ];

  const renderStep = () => {
    if (step === 1) return <WelcomeStep onNext={() => setStep(2)} />;
    if (step === 2)
      return (
        <RoleStep
          onSelect={(selected) => {
            setRole(selected);
            setStep(3);
          }}
        />
      );
    if (step === 3) {
      if (isSignupComplete) return <SuccessStep onNext={() => setStep(4)} />;
      return role === "student" ? (
        <StudentSignup
          onSuccess={() => setIsSignupComplete(true)}
          formData={formData}
          setFormData={setFormData}
        />
      ) : (
        <RecruiterSignup
          onSuccess={() => setIsSignupComplete(true)}
          formData={formData}
          setFormData={setFormData}
        />
      );
    }
    if (step === 4) return <Login />;
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-6xl bg-gradient-to-br from-gray-900 to-black rounded-3xl shadow-2xl border border-gray-800">
          <div className="grid md:grid-cols-4 gap-8 p-8">
            {/* Stepper */}
            <div className="md:border-r md:border-gray-800 pr-6">
              <div className="space-y-6">
                {steps.map((s) => (
                  <div
                    key={s.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                      step >= s.id
                        ? "bg-blue-500/10 border border-blue-500/30"
                        : "hover:bg-gray-800/50"
                    } cursor-pointer`}
                    onClick={() => step > s.id && setStep(s.id)}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step >= s.id
                          ? "bg-blue-500 text-white"
                          : "bg-gray-700 text-gray-400"
                      }`}
                    >
                      {step > s.id ? <Check size={16} /> : s.icon}
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Step {s.id}</p>
                      <p className="font-medium text-blue-300">{s.title}</p>
                    </div>
                    {step === s.id && (
                      <ChevronRight className="ml-auto text-blue-400 animate-pulse" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Main Content */}
            <div className="md:col-span-3 p-6">
              <div className="flex items-center justify-between mb-8">
                {step > 1 && step < 4 && (
                  <Button
                    onClick={() => setStep(step - 1)}
                    variant="ghost"
                    className="text-gray-400 hover:text-white"
                  >
                    <ArrowLeft className="mr-2" /> Back
                  </Button>
                )}
                <div className="flex-1"></div>
              </div>

              {renderStep()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;

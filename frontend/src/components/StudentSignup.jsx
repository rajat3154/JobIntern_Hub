import React, { useState } from "react";

import { Label } from "./ui/label";
import { RadioGroup } from "./ui/radio-group";
import { Button } from "./ui/button";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { STUDENT_API_END_POINT } from "@/utils/constant";
import { useDispatch, useSelector } from "react-redux";
import { setLoading } from "@/redux/authSlice";
import { Loader2, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "./ui/input";

const StudentSignup = () => {
  const [input, setInput] = useState({
    fullname: "",
    email: "",
    phonenumber: "",
    password: "",
    status: "",
    role: "student",
    file: null,
  });

  const { loading } = useSelector((store) => store.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const changeFileHandler = (e) => {
    setInput({ ...input, file: e.target.files[0] });
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("fullname", input.fullname);
    formData.append("email", input.email);
    formData.append("phonenumber", input.phonenumber);
    formData.append("password", input.password);
    formData.append("role", input.role);
    formData.append("status", input.status);

    if (input.file) {
      formData.append("profilePhoto", input.file); 
    }
    

    try {
      dispatch(setLoading(true));

      const res = await axios.post(
        `${STUDENT_API_END_POINT}/signup`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        navigate("/login");
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <>
      <div className="min-h-screen  flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-gradient-to-br from-gray-900 to-gray-950 rounded-xl shadow-xl border border-gray-800 p-8"
        >
          <div className="flex items-center justify-center mb-6">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Student Sign Up
            </h1>
          </div>

          <form onSubmit={submitHandler} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-2"
            >
              <Label className="text-gray-300">Full Name*</Label>
              <Input
                type="text"
                value={input.fullname}
                name="fullname"
                onChange={changeEventHandler}
                required
                className="border-gray-700 text-white focus:border-blue-500 focus:ring-blue-500"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-2"
            >
              <Label className="text-gray-300">Email*</Label>
              <Input
                type="email"
                value={input.email}
                name="email"
                onChange={changeEventHandler}
                required
                className="border-gray-700 text-white focus:border-blue-500 focus:ring-blue-500"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <Label className="text-gray-300">Phone Number*</Label>
              <Input
                type="text"
                value={input.phonenumber}
                name="phonenumber"
                onChange={changeEventHandler}
                required
                className="border-gray-700 text-white focus:border-blue-500 focus:ring-blue-500"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-2"
            >
              <Label className="text-gray-300">Password*</Label>
              <Input
                type="password"
                value={input.password}
                name="password"
                onChange={changeEventHandler}
                required
                className="border-gray-700 text-white focus:border-blue-500 focus:ring-blue-500"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-3"
            >
              <Label className="text-gray-300 block">Status*</Label>
              <RadioGroup className="grid grid-cols-2 gap-3">
                {["fresher", "experienced"].map((status) => (
                  <div key={status} className="flex items-center space-x-2">
                    <Input
                      type="radio"
                      name="status"
                      value={status}
                      checked={input.status === status}
                      onChange={changeEventHandler}
                      className="h-4 w-4 text-blue-500 border-gray-600 focus:ring-blue-500"
                      required
                    />
                    <Label className="text-sm text-gray-300 capitalize">
                      {status}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-2"
            >
              <Label className="text-gray-300">Profile Picture</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={changeFileHandler}
                className="text-white border-gray-700 focus:border-blue-500 focus:ring-blue-500"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="pt-2"
            >
              {loading ? (
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled
                >
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing up...
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Sign Up <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="text-center text-sm text-gray-400"
            >
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-blue-400 hover:underline"
              >
                Login
              </Link>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </>
  );
};

export default StudentSignup;

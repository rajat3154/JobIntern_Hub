import React, { useEffect, useState } from "react";
import Navbar from "../shared/Navbar";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { RadioGroup } from "../ui/radio-group";
import { Button } from "../ui/button";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { USER_API_END_POINT } from "@/utils/constant";
import { useDispatch, useSelector } from "react-redux";
import { setLoading, setUser } from "@/redux/authSlice";
import { Loader2, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const Login = () => {
  const [input, setInput] = useState({
    email: "",
    password: "",
    role: "",
  });

  const { loading } = useSelector((store) => store.auth);
  useEffect(() => {
    dispatch(setLoading(false)); // Reset loading on mount
  }, []);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!input.role) {
      toast.error("Please select a role");
      return;
    }

    try {
      dispatch(setLoading(true));

      const res = await axios.post(`${USER_API_END_POINT}/login`, input, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      if (res.data.success) {
        dispatch(setUser(res.data.user));
        if (input.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-gradient-to-br from-gray-900 to-gray-950 rounded-xl shadow-xl border border-gray-800 p-8"
        >
          <div className="flex items-center justify-center mb-6">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Login to JobInternHub
            </h1>
          </div>

          <form onSubmit={submitHandler} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-2"
            >
              <Label className="text-gray-300">Email*</Label>
              <Input
                type="email"
                placeholder="Enter your email"
                value={input.email}
                name="email"
                onChange={changeEventHandler}
                required
                className=" border-gray-700 text-white focus:border-blue-500 focus:ring-blue-500"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-2"
            >
              <Label className="text-gray-300">Password*</Label>
              <Input
                type="password"
                placeholder="Enter your password"
                value={input.password}
                name="password"
                onChange={changeEventHandler}
                required
                className="text-white border-gray-700 focus:border-blue-500 focus:ring-blue-500"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-3"
            >
              <Label className="text-gray-300 block">Select Role*</Label>
              <RadioGroup className="grid grid-cols-3 gap-3">
                {["student", "recruiter", "admin"].map((role) => (
                  <div key={role} className="flex items-center space-x-2">
                    <Input
                      type="radio"
                      name="role"
                      value={role}
                      checked={input.role === role}
                      onChange={changeEventHandler}
                      className="h-4 w-4 text-blue-500 border-gray-600 focus:ring-blue-500"
                      required
                    />
                    <Label className="text-sm text-gray-300 capitalize">
                      {role}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="pt-2"
            >
              {loading ? (
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled
                >
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Login <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center text-sm text-gray-400"
            >
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-medium text-blue-400 hover:underline"
              >
                Create Account
              </Link>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </>
  );
};

export default Login;

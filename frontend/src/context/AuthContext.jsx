// context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    () => localStorage.getItem("token") || null
  );
  const [loading, setLoading] = useState(true);
  const apiUrl = import.meta.env.VITE_BACKEND_URL;
  
  useEffect(() => {
    const checkAuth = async () => {
      console.log("Checking auth - token:", token ? "exists" : "none");
      try {
        // Only check auth if we have a token
        if (!token) {
          console.log("No token, setting loading to false");
          setLoading(false);
          return;
        }

        const response = await api.get(`${apiUrl}/api/v1/check-auth`);

        if (response.data.success) {
          console.log("Auth successful, setting user");
          setUser(response.data.data);
        } else {
          console.log("Auth failed, clearing token");
          // Clear invalid token
          setToken(null);
          localStorage.removeItem("token");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        // Clear invalid token
        if (error.response?.status === 401) {
          console.log("401 error, clearing token");
          setToken(null);
          localStorage.removeItem("token");
        }
      } finally {
        console.log("Setting loading to false");
        setLoading(false);
      }
    };

    checkAuth();
  }, [apiUrl]); // Only depend on apiUrl

  const login = async (email, password) => {
    try {
      const response = await api.post(`${apiUrl}/api/v1/login`, { email, password });

      if (response.data.success) {
        setUser(response.data.user);

        if (response.data.token) {
          setToken(response.data.token);
          localStorage.setItem("token", response.data.token);
        }

        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      };
    }
  };

  const logout = async () => {
    try {
      await api.get(`${apiUrl}/api/v1/logout`);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem("token");
    }

    return { success: true };
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    setUser,
    setToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

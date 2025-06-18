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
      try {
        const headers = {
          "Content-Type": "application/json",
        };
        
        // Add Authorization header if token exists
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await api.get(
          `${apiUrl}/api/v1/check-auth`,
          {
            withCredentials: true,
            headers,
          }
        );

        if (response.data.success) {
          setUser(response.data.data);

          // Store token from response if available
          if (response.data.token) {
            setToken(response.data.token);
            localStorage.setItem("token", response.data.token);
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        // Clear invalid token
        if (error.response?.status === 401) {
          setToken(null);
          localStorage.removeItem("token");
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [token, apiUrl]);

  const login = async (email, password) => {
    try {
      const response = await api.post(
        `${apiUrl}/api/v1/login`,
        { email, password },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

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
      const headers = {
        "Content-Type": "application/json",
      };
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      await api.get(`${apiUrl}/api/v1/logout`, {
        withCredentials: true,
        headers,
      });

      setUser(null);
      setToken(null);
      localStorage.removeItem("token");

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Logout failed",
      };
    }
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

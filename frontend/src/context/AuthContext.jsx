// context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    () => localStorage.getItem("token") || null
  );
  const [loading, setLoading] = useState(true);
  const apiUrl = import.meta.env.VITE_BACKEND_URL;

  // Set up axios interceptor to include token in headers
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token");
        console.log("=== AXIOS INTERCEPTOR DEBUG ===");
        console.log("Request URL:", config.url);
        console.log("Request method:", config.method);
        console.log("Token in localStorage:", token ? "Exists" : "Not found");
        console.log("Token length:", token ? token.length : 0);
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log("Axios interceptor - Added Authorization header:", config.headers.Authorization ? "Yes" : "No");
          console.log("Axios interceptor - Authorization header length:", config.headers.Authorization ? config.headers.Authorization.length : 0);
        } else {
          console.log("Axios interceptor - No token found in localStorage");
        }
        console.log("Axios interceptor - Request headers:", config.headers);
        console.log("=== END AXIOS INTERCEPTOR DEBUG ===");
        return config;
      },
      (error) => {
        console.error("Axios interceptor error:", error);
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(
          `${apiUrl}/api/v1/check-auth`,
          {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
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
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password, role) => {
    try {
      const response = await axios.post(
        `${apiUrl}/api/v1/login`,
        { email, password, role },
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
      await axios.get(`${apiUrl}/api/v1/logout`, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
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
      {!loading && children}
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

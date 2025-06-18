// context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setUser as setReduxUser } from "../redux/authSlice";
import api from "../utils/axios";
import { debugAuthState } from "../utils/authDebug";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const apiUrl = import.meta.env.VITE_BACKEND_URL;
  
  // Get user from Redux store (no token needed since we use httpOnly cookies)
  const reduxUser = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  
  // Sync with Redux user
  useEffect(() => {
    if (reduxUser && !user) {
      console.log("Syncing AuthContext with Redux user");
      setUser(reduxUser);
    }
  }, [reduxUser, user]);
  
  useEffect(() => {
    const checkAuth = async () => {
      console.log("=== AUTH CHECK ===");
      console.log("Current user from Redux:", reduxUser);
      
      try {
        // Check auth using httpOnly cookies (no token needed in request)
        console.log("Making auth check request (using httpOnly cookies)");
        const response = await api.get(`${apiUrl}/api/v1/check-auth`);

        if (response.data.success) {
          console.log("Auth successful, setting user");
          setUser(response.data.data);
          // Also update Redux
          dispatch(setReduxUser(response.data.data));
        } else {
          console.log("Auth failed, clearing user");
          dispatch(setReduxUser(null));
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        // Clear user on any auth error
        if (error.response?.status === 401) {
          console.log("401 error, clearing user");
          dispatch(setReduxUser(null));
        }
      } finally {
        console.log("Setting loading to false");
        setLoading(false);
      }
    };

    checkAuth();
  }, [apiUrl, dispatch]); // Remove reduxToken dependency

  const login = async (email, password, role) => {
    console.log("=== LOGIN DEBUGGING ===");
    console.log("Login attempt for:", email, "role:", role);
    
    try {
      const response = await api.post(`${apiUrl}/api/v1/login`, { email, password, role });
      console.log("Login response:", response.data);

      if (response.data.success) {
        console.log("Login successful, setting user");
        setUser(response.data.user);
        dispatch(setReduxUser(response.data.user));
        
        // Note: Token is automatically handled by httpOnly cookies
        console.log("Token stored in httpOnly cookie automatically");
        
        console.log("=== END LOGIN DEBUGGING ===");
        return { success: true };
      }
    } catch (error) {
      console.error("Login error:", error);
      console.log("=== END LOGIN DEBUGGING ===");
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
      dispatch(setReduxUser(null));
    }

    return { success: true };
  };

  const value = {
    user,
    token: null, // No token needed since we use httpOnly cookies
    loading,
    login,
    logout,
    setUser,
    setToken: () => {}, // No-op since we don't manage tokens manually
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

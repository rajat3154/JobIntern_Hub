// context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setUser as setReduxUser, setToken as setReduxToken } from "../redux/authSlice";
import api from "../utils/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const apiUrl = import.meta.env.VITE_BACKEND_URL;
  
  // Get user and token from Redux store
  const reduxUser = useSelector((state) => state.auth.user);
  const reduxToken = useSelector((state) => state.auth.token);
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
      console.log("Checking auth - token:", reduxToken ? "exists" : "none");
      console.log("Current user from Redux:", reduxUser);
      try {
        // Only check auth if we have a token
        if (!reduxToken) {
          console.log("No token, setting loading to false");
          setLoading(false);
          return;
        }

        console.log("Making auth check request with token:", reduxToken);
        const response = await api.get(`${apiUrl}/api/v1/check-auth`);

        if (response.data.success) {
          console.log("Auth successful, setting user");
          setUser(response.data.data);
          // Also update Redux
          dispatch(setReduxUser(response.data.data));
        } else {
          console.log("Auth failed, clearing token");
          // Clear invalid token
          dispatch(setReduxToken(null));
          dispatch(setReduxUser(null));
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        // Clear invalid token
        if (error.response?.status === 401) {
          console.log("401 error, clearing token");
          dispatch(setReduxToken(null));
          dispatch(setReduxUser(null));
        }
      } finally {
        console.log("Setting loading to false");
        setLoading(false);
      }
    };

    checkAuth();
  }, [apiUrl, dispatch, reduxToken]); // Depend on reduxToken

  const login = async (email, password) => {
    try {
      const response = await api.post(`${apiUrl}/api/v1/login`, { email, password });

      if (response.data.success) {
        setUser(response.data.user);
        dispatch(setReduxUser(response.data.user));

        if (response.data.token) {
          dispatch(setReduxToken(response.data.token));
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
      dispatch(setReduxToken(null));
      dispatch(setReduxUser(null));
    }

    return { success: true };
  };

  const value = {
    user,
    token: reduxToken,
    loading,
    login,
    logout,
    setUser,
    setToken: (token) => dispatch(setReduxToken(token)),
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

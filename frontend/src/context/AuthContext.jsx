// context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setUser as setReduxUser, setToken as setReduxToken } from "../redux/authSlice";
import api from "../utils/axios";
import { debugAuthState } from "../utils/authDebug";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const apiUrl = import.meta.env.VITE_BACKEND_URL;
  
  // Get user and token from Redux store
  const reduxUser = useSelector((state) => state.auth.user);
  const reduxToken = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();
  
  // Initialize token from localStorage if not in Redux
  useEffect(() => {
    console.log("=== TOKEN DEBUGGING ===");
    console.log("Redux token:", reduxToken);
    console.log("Redux user:", reduxUser);
    
    // Run comprehensive auth state debug
    debugAuthState();
    
    if (!reduxToken) {
      console.log("No token in Redux, checking localStorage...");
      console.log("All localStorage keys:", Object.keys(localStorage));
      
      // Check for token in different possible locations
      const tokenKeys = ['token', 'authToken', 'accessToken', 'jwt', 'userToken'];
      let foundToken = null;
      let foundKey = null;
      
      for (const key of tokenKeys) {
        const value = localStorage.getItem(key);
        if (value) {
          console.log(`Found token in localStorage['${key}']:`, value.substring(0, 20) + "...");
          foundToken = value;
          foundKey = key;
          break;
        }
      }
      
      if (foundToken) {
        console.log(`Using token from localStorage['${foundKey}']`);
        dispatch(setReduxToken(foundToken));
      } else {
        console.log("No token found in any localStorage location");
        // If user exists but no token, they need to re-login
        if (reduxUser) {
          console.log("User exists but no token - redirecting to login");
          dispatch(setReduxUser(null));
          // Clear all Redux data
          localStorage.removeItem("persist:root");
          // Redirect to login
          window.location.href = '/login';
        }
      }
    } else {
      console.log("Token found in Redux:", reduxToken.substring(0, 20) + "...");
    }
    console.log("=== END TOKEN DEBUGGING ===");
  }, [reduxToken, dispatch, reduxUser]);
  
  // Sync with Redux user
  useEffect(() => {
    if (reduxUser && !user) {
      console.log("Syncing AuthContext with Redux user");
      setUser(reduxUser);
      
      // If we have a user but no token, check localStorage for token
      if (!reduxToken) {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
          console.log("Found token in localStorage, adding to Redux");
          dispatch(setReduxToken(storedToken));
        } else {
          console.log("User logged in but no token found - user needs to re-login");
          // Clear the user since there's no valid token
          dispatch(setReduxUser(null));
        }
      }
    }
  }, [reduxUser, user, reduxToken, dispatch]);
  
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
    console.log("=== LOGIN DEBUGGING ===");
    console.log("Login attempt for:", email);
    
    try {
      const response = await api.post(`${apiUrl}/api/v1/login`, { email, password });
      console.log("Login response:", response.data);

      if (response.data.success) {
        console.log("Login successful, setting user and token");
        setUser(response.data.user);
        dispatch(setReduxUser(response.data.user));

        if (response.data.token) {
          console.log("Token received from login:", response.data.token.substring(0, 20) + "...");
          dispatch(setReduxToken(response.data.token));
          console.log("Token stored in Redux");
        } else {
          console.log("No token received from login response");
        }

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

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true, // This is crucial for httpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - no need to add Authorization header since we use httpOnly cookies
api.interceptors.request.use(
  (config) => {
    console.log("=== AXIOS REQUEST DEBUG ===");
    console.log("Request URL:", config.url);
    console.log("Request method:", config.method);
    console.log("With credentials:", config.withCredentials);
    console.log("Request headers:", config.headers);
    console.log("=== END AXIOS REQUEST DEBUG ===");
    
    // No need to add Authorization header - httpOnly cookies are sent automatically
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log("=== AXIOS RESPONSE DEBUG ===");
    console.log("Response status:", response.status);
    console.log("Response URL:", response.config.url);
    console.log("Response data:", response.data);
    console.log("=== END AXIOS RESPONSE DEBUG ===");
    
    return response;
  },
  (error) => {
    console.error("=== AXIOS ERROR DEBUG ===");
    console.error("Error status:", error.response?.status);
    console.error("Error URL:", error.config?.url);
    console.error("Error message:", error.message);
    console.error("Error response:", error.response?.data);
    console.error("=== END AXIOS ERROR DEBUG ===");

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401) {
      console.log("401 error detected - user needs to login");
      // Don't redirect automatically - let the component handle it
      // Just log the error and let it propagate
    }

    return Promise.reject(error);
  }
);

export default api; 
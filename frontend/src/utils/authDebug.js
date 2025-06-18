// Utility to debug authentication state
export const debugAuthState = () => {
  console.log("=== AUTH STATE DEBUG ===");
  
  // Check localStorage
  console.log("localStorage keys:", Object.keys(localStorage));
  
  // Check for tokens in different locations
  const tokenKeys = ['token', 'authToken', 'accessToken', 'jwt', 'userToken'];
  tokenKeys.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
      console.log(`localStorage['${key}']:`, value.substring(0, 20) + "...");
    }
  });
  
  // Check Redux persist data
  const persistData = localStorage.getItem('persist:root');
  if (persistData) {
    try {
      const parsed = JSON.parse(persistData);
      console.log("Redux persist data keys:", Object.keys(parsed));
      
      if (parsed.auth) {
        const authData = JSON.parse(parsed.auth);
        console.log("Redux auth data:", {
          user: authData.user ? "exists" : "null",
          token: authData.token ? "exists" : "null",
          loading: authData.loading
        });
      }
    } catch (error) {
      console.log("Error parsing persist data:", error);
    }
  }
  
  console.log("=== END AUTH STATE DEBUG ===");
};

// Function to manually set a token for testing
export const setTestToken = (token) => {
  console.log("Setting test token:", token.substring(0, 20) + "...");
  localStorage.setItem("token", token);
  
  // Also update Redux if store is available
  try {
    const store = require('../redux/store').default;
    const { setToken } = require('../redux/authSlice');
    store.dispatch(setToken(token));
    console.log("Test token set in both localStorage and Redux");
  } catch (error) {
    console.log("Could not update Redux store:", error);
  }
}; 
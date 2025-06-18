import { store } from '../redux/store';

// Utility to debug authentication state
export const debugAuthState = () => {
  console.log("=== AUTH STATE DEBUG ===");
  
  // Check localStorage
  console.log("localStorage keys:", Object.keys(localStorage));
  
  // Check Redux state
  const state = store.getState();
  console.log("Redux persist data keys:", Object.keys(state));
  console.log("Redux auth data:", {
    user: state.auth.user ? 'exists' : 'null',
    loading: state.auth.loading
  });
  
  console.log("=== END AUTH STATE DEBUG ===");
};

export const debugUserState = () => {
  console.log("=== USER STATE DEBUG ===");
  
  const state = store.getState();
  const user = state.auth.user;
  
  if (user) {
    console.log("User found:", {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.fullname || user.companyname
    });
  } else {
    console.log("No user found in Redux");
  }
  
  console.log("=== END USER STATE DEBUG ===");
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
// contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState("checking");

  // Initialize axios defaults from localStorage on app start
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("userData");

    if (token) {
      axios.defaults.headers.common["Authorization"] = `Token ${token}`;
    }

    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error("Failed to parse user data from localStorage", e);
        localStorage.removeItem("userData");
      }
    }

    checkApiConnection();
  }, []);

  const checkApiConnection = async () => {
    try {
      await axios.get(`${import.meta.env.VITE_API_URL}/`, { timeout: 5000 });
      setApiStatus("online");
    } catch (error) {
      console.error("API connection failed:", error);
      if (error.code === "ERR_NETWORK") {
        setApiStatus("offline");
      } else {
        setApiStatus("online");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch current user when token exists
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      // Try the /users/me/ endpoint first
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/users/me/`,
        { timeout: 10000 }
      );
      setUser(data);
      localStorage.setItem("userData", JSON.stringify(data));
      setApiStatus("online");
    } catch (error) {
      console.error("Error fetching current user from /users/me/:", error);

      if (error.code === "ERR_NETWORK") {
        setApiStatus("offline");
      } else if (error.response?.status === 401) {
        // Token is invalid
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
        delete axios.defaults.headers.common["Authorization"];
        setUser(null);
      } else if (error.response?.status === 404) {
        // Users/me endpoint not found, try alternative approach
        console.warn(
          "Users/me endpoint not found, trying alternative approach"
        );
        await tryAlternativeUserFetch();
      }
    } finally {
      setLoading(false);
    }
  };

  const tryAlternativeUserFetch = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // Try to get user info from the users list
      try {
        const { data: users } = await axios.get(
          `${import.meta.env.VITE_API_URL}/users/`
        );
        if (users && users.length > 0) {
          // Find the current user by matching token or other criteria
          // This is a fallback - you might need to adjust this logic
          const currentUser = users[0]; // Simplified for demo
          setUser(currentUser);
          localStorage.setItem("userData", JSON.stringify(currentUser));
          console.log("Using fallback user data from users list");
        }
      } catch (usersError) {
        console.error("Could not fetch users list:", usersError);
      }
    } catch (error) {
      console.error("Alternative user fetch failed:", error);
      // If all fails, clear the invalid token
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      delete axios.defaults.headers.common["Authorization"];
      setUser(null);
    }
  };

  const login = async (username, password) => {
    try {
      // Clear any existing auth headers first
      delete axios.defaults.headers.common["Authorization"];

      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/login/`,
        { username, password },
        { timeout: 10000 }
      );

      const { token, user_id, username: userUsername, email } = data;

      // Store token and user data in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem(
        "userData",
        JSON.stringify({ id: user_id, username: userUsername, email })
      );

      // Set axios default header
      axios.defaults.headers.common["Authorization"] = `Token ${token}`;

      // Update state
      setUser({ id: user_id, username: userUsername, email });

      setApiStatus("online");
      toast.success("Login successful!");
      return true; // Return simple boolean for success
    } catch (error) {
      console.error("Login error:", error);

      // Throw the error instead of returning an object
      if (error.code === "ERR_NETWORK") {
        setApiStatus("offline");
        throw new Error(
          "Cannot connect to server. Please check your internet connection and make sure the backend is running."
        );
      }

      const message = error.response?.data?.error || "Login failed";
      throw new Error(message); // Throw error instead of returning object
    }
  };

  const signup = async (username, email, password) => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/signup/`,
        { username, email, password },
        { timeout: 10000 }
      );

      // Auto-login after signup
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem(
          "userData",
          JSON.stringify({
            id: data.user_id,
            username: data.username,
            email: data.email,
          })
        );
        axios.defaults.headers.common["Authorization"] = `Token ${data.token}`;
        setUser({
          id: data.user_id,
          username: data.username,
          email: data.email,
        });
      }

      toast.success("Account created successfully!");
      return { success: true };
    } catch (error) {
      console.error("Signup error:", error);

      if (error.code === "ERR_NETWORK") {
        setApiStatus("offline");
        return {
          success: false,
          error:
            "Cannot connect to server. Please check your internet connection and make sure the backend is running.",
        };
      }

      const message = error.response?.data?.error || "Signup failed";
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/logout/`);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear all auth data from storage
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      delete axios.defaults.headers.common["Authorization"];
      setUser(null);
      toast.success("Logged out successfully");
    }
  };

  const value = {
    user,
    loading,
    apiStatus,
    login,
    signup,
    logout,
    checkApiConnection,
    token: localStorage.getItem("token"),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

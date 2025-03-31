import React, { createContext, useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";
import axiosInstance from "../config/axiosConfig";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = Cookies.get("access_token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);
  // Helper function to set tokens
  const setTokens = (access, refresh) => {
    Cookies.set("access_token", access, { expires: 2000 });
    Cookies.set("refresh_token", refresh, { expires: 7 });
  };

  // Logout function
  const logout = async () => {
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    setIsLoggedIn(false);
    // window.location.href = "/login";
  };

  // Login function
  const login = async (dataLogin) => {
    try {
      const response = await axiosInstance.post("/auth/login/", dataLogin);

      if (response.status === 200) {
        console.log(response);
        setTokens(response.data.access, response.data.refresh);
        setIsLoggedIn(true);
        return { success: true };
      }
    } catch (error) {
      if (error.response.data.error_code) {
        return {
          success: false,
          error_code: error.response.data.error_code,
        };
      }
      // Trường hợp lỗi không xác định
      return {
        success: false,
        error_code: "UNKNOWN_ERROR",
      };
    }
  };

  const googleLogin = async (token_id) => {
    try {
      const response = await axiosInstance.post("/auth/login/google/", {
        access_token: token_id,
      });

      if (response.status === 200) {
        setTokens(response.data.access, response.data.refresh);
        setIsLoggedIn(true);
        return { success: true };
      }
    } catch (error) {
      if (error.response.data.error_code) {
        return {
          success: false,
          error_code: error.response.data.error_code,
        };
      }
      // Trường hợp lỗi không xác định
      return {
        success: false,
        error_code: "UNKNOWN_ERROR",
      };
    }
  };

  // Signup function
  const signup = async (userData) => {
    try {
      const response = await axiosInstance.post("/auth/register/", userData);

      if (response.status === 201) {
        return { success: true };
      }
    } catch (error) {
      if (error.response.data.error_code) {
        return {
          success: false,
          error_code: error.response.data.error_code,
        };
      }
      // Trường hợp lỗi không xác định
      return {
        success: false,
        error_code: "UNKNOWN_ERROR",
      };
    }
  };

  // Forgot password function
  const forgotPassword = async (email) => {
    try {
      const response = await axiosInstance.post("/auth/password-reset/", {
        email,
      });

      if (response.status === 200) {
        return { success: true };
      }
    } catch (error) {
      if (error.response.data.error_code) {
        return {
          success: false,
          error_code: error.response.data.error_code,
        };
      }
      // Trường hợp lỗi không xác định
      return {
        success: false,
        error_code: "UNKNOWN_ERROR",
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        login,
        googleLogin,
        logout,
        signup,
        forgotPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

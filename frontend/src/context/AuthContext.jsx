import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";
import { AuthContext } from "./AuthContextObject";

// Helper function to decode JWT without external libraries
const decodeJWT = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
};

// Helper function to get user from JWT token
const getUserFromToken = (token) => {
  if (!token) return null;

  const payload = decodeJWT(token);
  if (!payload) return null;

  return {
    _id: payload.userId,
    email: payload.email,
    role: payload.role,
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Try to decode JWT first
        const userData = getUserFromToken(token);

        if (userData) {
          console.log("Session restored from JWT");
          setUser(userData);
          setLoading(false);
          return;
        }

        // If JWT decoding failed, try to fetch user from backend
        // This handles cases where decoding might fail but token is still valid
        console.log("JWT decode failed, trying to fetch from /auth/profile");
        try {
          const response = await api.get("/auth/profile");
          if (response.data.user) {
            setUser({
              _id: response.data.user._id || response.data.user.id,
              email: response.data.user.email,
              role: response.data.user.role,
            });
            console.log("Session restored from /auth/profile");
            setLoading(false);
            return;
          }
        } catch (profileError) {
          console.error("Failed to fetch from /auth/profile:", profileError);
        }

        // Both failed, clear localStorage
        console.log("Both session restore methods failed, logging out");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      } catch (error) {
        console.error("Session restore error:", error);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      }

      setLoading(false);
    };

    restoreSession();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const data = response.data;

      localStorage.setItem("accessToken", data.access_token);
      localStorage.setItem("refreshToken", data.refresh_token);
      // Decode JWT to get user data WITH ROLE
      const userData = getUserFromToken(data.access_token);
      setUser(userData);

      return { success: true, user: userData };
    } catch (error) {
      const errorMsg =
        error.response?.data?.error || error.message || "Login failed";
      return { success: false, error: errorMsg };
    }
  };

  const register = async (
    email,
    password,
    name,
    phone = "",
    branch = "",
    year = ""
  ) => {
    try {
      const response = await api.post("/auth/register", {
        email,
        password,
        name,
        phone,
        branch,
        year,
      });

      return {
        success: true,
        message:
          response.data?.message ||
          "Registration successful. Please verify your email before login.",
      };
    } catch (error) {
      const errorMsg =
        error.response?.data?.error || error.message || "Registration failed";
      return { success: false, error: errorMsg };
    }
  };

  const resendVerificationEmail = async (email) => {
    try {
      const response = await api.post("/auth/resend-verification-email", {
        email,
      });

      return {
        success: true,
        message:
          response.data?.message ||
          "Verification email sent. Check your inbox.",
        expiresIn: response.data?.expiresIn || "24 hours",
      };
    } catch (error) {
      const errorMsg =
        error.response?.data?.error ||
        error.message ||
        "Failed to resend email";
      return { success: false, error: errorMsg };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await api.post("/auth/forgot-password", { email });

      return {
        success: true,
        message:
          response.data?.message ||
          "Password reset link sent. Check your inbox.",
        expiresIn: response.data?.expiresIn || "24 hours",
      };
    } catch (error) {
      const errorMsg =
        error.response?.data?.error ||
        error.message ||
        "Failed to request password reset";
      return { success: false, error: errorMsg };
    }
  };

  const verifyResetToken = async (token) => {
    try {
      const response = await api.get("/auth/verify-reset-token", {
        params: { token },
      });

      return {
        valid: response.data?.valid || false,
        message: response.data?.message || "Token verification failed",
      };
    } catch (error) {
      return {
        valid: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Token is invalid or expired",
      };
    }
  };

  const resetPassword = async (token, newPassword, confirmPassword) => {
    try {
      const response = await api.post("/auth/reset-password", {
        token,
        newPassword,
        confirmPassword,
      });

      return {
        success: response.data?.success || true,
        message:
          response.data?.message ||
          "Password reset successfully. Please log in with your new password.",
      };
    } catch (error) {
      const errorMsg =
        error.response?.data?.error ||
        error.message ||
        "Failed to reset password";
      return { success: false, error: errorMsg };
    }
  };

  const resendResetLink = async (email) => {
    try {
      const response = await api.post("/auth/resend-reset-link", { email });

      return {
        success: true,
        message:
          response.data?.message ||
          "Password reset link sent. Check your inbox.",
        expiresIn: response.data?.expiresIn || "24 hours",
      };
    } catch (error) {
      const errorMsg =
        error.response?.data?.error ||
        error.message ||
        "Failed to resend reset link";
      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
  };

  const getAuthHeader = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        resendVerificationEmail,
        forgotPassword,
        verifyResetToken,
        resetPassword,
        resendResetLink,
        logout,
        getAuthHeader,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

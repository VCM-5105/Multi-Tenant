"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [supportMode, setSupportMode] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on initial load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedToken = localStorage.getItem("appzex_token");
        const savedSupportToken = localStorage.getItem("appzex_support_token");
        const savedSupportAgency = localStorage.getItem("appzex_support_agency");

        if (savedSupportToken && savedSupportAgency) {
          setSupportMode({
            token: savedSupportToken,
            agency: JSON.parse(savedSupportAgency),
          });
        }

        if (savedToken) {
          setToken(savedToken);
          const response = await api.get("/auth/me");
          if (response.data?.success) {
            setUser(response.data.data);
          }
        }
      } catch (err) {
        console.warn("Session restore failed or expired:", err.message);
        localStorage.removeItem("appzex_token");
        localStorage.removeItem("appzex_support_token");
        localStorage.removeItem("appzex_support_agency");
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login handler
  const login = async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    if (response.data?.success) {
      const { user: userData, token: jwtToken } = response.data.data;
      setUser(userData);
      setToken(jwtToken);
      localStorage.setItem("appzex_token", jwtToken);
      return userData;
    }
  };

  // Register new Agency handler
  const registerAgency = async (payload) => {
    const response = await api.post("/auth/register-agency", payload);
    if (response.data?.success) {
      const { user: userData, token: jwtToken } = response.data.data;
      setUser(userData);
      setToken(jwtToken);
      localStorage.setItem("appzex_token", jwtToken);
      return userData;
    }
  };

  // Logout handler
  const logout = () => {
    setUser(null);
    setToken(null);
    setSupportMode(null);
    localStorage.removeItem("appzex_token");
    localStorage.removeItem("appzex_support_token");
    localStorage.removeItem("appzex_support_agency");
    window.location.href = "/login";
  };

  // Super Admin: Enter Support Mode for an agency
  const enterSupportMode = (supportToken, agency) => {
    localStorage.setItem("appzex_support_token", supportToken);
    localStorage.setItem("appzex_support_agency", JSON.stringify(agency));
    setSupportMode({ token: supportToken, agency });
    window.location.href = "/workspace";
  };

  // Super Admin: Exit Support Mode
  const exitSupportMode = () => {
    localStorage.removeItem("appzex_support_token");
    localStorage.removeItem("appzex_support_agency");
    setSupportMode(null);
    window.location.href = "/admin";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        supportMode,
        loading,
        login,
        registerAgency,
        logout,
        enterSupportMode,
        exitSupportMode,
        isAuthenticated: Boolean(token),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

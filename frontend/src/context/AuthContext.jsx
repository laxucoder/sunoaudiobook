import React, { createContext, useState, useEffect } from "react";
import api from "../utils/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(null);


  const setToken = (token) => {
    setAccessToken(token);
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  };

  const refreshSession = async () => {
    try {
      const res = await api.get("/auth/refresh");
      setToken(res.data.accessToken);
      return true;
    } catch (err) {
      console.log("Silent refresh failed", err);
      setToken(null);
      setUser(null);
      return false;
    }
  };

  useEffect(() => {
    const persistLogin = async () => {
      try {
        const res = await api.get("/auth/refresh");
        setToken(res.data.accessToken);

        const profileRes = await api.get("/user/profile");
        setUser(profileRes.data);
      } catch (err) {
        console.log("No active session found.");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    persistLogin();
  }, []);

  useEffect(() => {
    if (!user) return;
    const intervalId = setInterval(() => {
      console.log("Triggering silent refresh...");
      refreshSession();
    }, 14 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [user]);


  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      console.error(e);
    }
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user, setUser, login: async (email, password) => {
        const res = await api.post("/auth/login", { email, password });
        setToken(res.data.accessToken);
        setUser(res.data.user);
      }, logout, loading, accessToken
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
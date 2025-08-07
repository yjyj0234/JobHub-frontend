import React, { createContext, useState, useContext } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => !!localStorage.getItem("token")
  );
  const [user, setUser] = useState(
    () => JSON.parse(localStorage.getItem("user")) || null
  );

  const login = async ({ email, password }) => {
    try {
      const res = await axios.post("http://localhost:8080/auth/login", {
        email,
        password,
      });
      const userData = {
        token: res.data.token,
        email: res.data.email,
        role: res.data.role,
        userId: res.data.userId,
      };
      localStorage.setItem("token", userData.token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      setIsLoggedIn(true);
      return userData;
    } catch (err) {
      throw new Error("로그인 실패: " + err.response?.data || err.message);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
  };

  const signup = async ({ email, password, name, userType }) => {
    try {
      await axios.post("http://localhost:8080/auth/register", {
        email,
        password,
        name,
        userType,
      });
      return await login({ email, password });
    } catch (err) {
      throw new Error("회원가입 실패: " + err.response?.data || err.message);
    }
  };

  const value = { isLoggedIn, user, login, logout, signup };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

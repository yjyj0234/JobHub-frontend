import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
axios.defaults.baseURL = "http://localhost:8080";
axios.defaults.withCredentials = true; // 쿠키 포함

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 쿠키 기반이라 부팅 시 별도 체크 필요하면 /auth/me 같은 엔드포인트 만들어도 됨
  const [user, setUser] = useState(null);

  const login = async ({ email, password }) => {
    const res = await axios.post("/auth/login", { email, password });
    // 서버가 Set-Cookie 로 JWT 내려줌. 프론트에서는 user정보만 메모리 보관
    const userData = {
      email: res.data.email,
      role: res.data.role,
      userId: res.data.userId,
    };
    setUser(userData);
    setIsLoggedIn(true);
    return userData;
  };

  const signup = async (userData) => {
    const formData = new FormData();
    formData.append("email", userData.email);
    formData.append("password", userData.password);
    formData.append(
      "name",
      userData.accountType === "user" ? "개인회원" : userData.companyName
    );
    formData.append("userType", userData.accountType.toLowerCase());
    if (userData.accountType === "company") {
      formData.append(
        "businessRegistrationNumber",
        userData.businessRegistrationNumber
      );
      formData.append(
        "businessCertificationFile",
        userData.businessCertificationFile
      );
    }
    await axios.post("/auth/register", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    // 바로 로그인
    return await login({ email: userData.email, password: userData.password });
  };

  const logout = async () => {
    await axios.post("/auth/logout");
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};

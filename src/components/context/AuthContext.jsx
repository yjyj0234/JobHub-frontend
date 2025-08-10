import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => !!localStorage.getItem("token")
  );
  const [user, setUser] = useState(
    () => JSON.parse(localStorage.getItem("user")) || null
  );
  const [redirectAfterLogin, setRedirectAfterLogin] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoggedIn && location.pathname !== "/login") {
      setRedirectAfterLogin(location.pathname);
    }
  }, [isLoggedIn, location.pathname]);

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

      // 리다이렉션 처리
      if (redirectAfterLogin) {
        navigate(redirectAfterLogin);
        setRedirectAfterLogin(null);
      } else {
        navigate("/");
      }

      return userData;
    } catch (err) {
      throw new Error("로그인 실패: " + (err.response?.data || err.message));
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
    navigate("/");
  };

  const signup = async (userData) => {
    try {
      const formData = new FormData();
      formData.append("email", userData.email);
      formData.append("password", userData.password);
      formData.append(
        "name",
        userData.accountType === "user" ? "개인회원" : userData.companyName
      );
      formData.append("userType", userData.accountType.toLowerCase());

      if (userData.accountType === "COMPANY") {
        formData.append(
          "businessRegistrationNumber",
          userData.businessRegistrationNumber
        );
        formData.append(
          "businessCertificationFile",
          userData.businessCertificationFile
        );
      }

      await axios.post("http://localhost:8080/auth/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      await login({ email: userData.email, password: userData.password });
      navigate("/"); // 회원가입 성공 후 메인페이지로 리다이렉트
    } catch (err) {
      throw new Error("회원가입 실패: " + (err.response?.data || err.message));
    }
  };

  const value = { isLoggedIn, user, login, logout, signup };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

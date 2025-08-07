import React, { createContext, useState, useContext } from "react";
import axios from "axios";

// 1. 새로운 Context를 생성합니다. 외부에서 이 데이터를 바로 사용하지는 않습니다.
const AuthContext = createContext(null);

// 2. AuthProvider 컴포넌트: 이 컴포넌트가 감싸는 모든 자식들은 value 객체에 접근할 수 있습니다.
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

  // 로그아웃 함수
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

  // Context를 통해 하위 컴포넌트에 전달할 값들을 객체로 묶습니다.
  const value = { isLoggedIn, user, login, logout, signup };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 3. useAuth 커스텀 훅: 컴포넌트에서 손쉽게 AuthContext의 값들을 사용할 수 있게 해줍니다.
export const useAuth = () => {
  const context = useContext(AuthContext);
  // 만약 AuthProvider 외부에서 useAuth를 사용하면 에러를 발생시켜 실수를 방지합니다.
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

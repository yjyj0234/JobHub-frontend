import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const login = async ({ email, password }) => {
    console.log('Login attempt with:', email, password);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email === 'test@test.com' && password === 'password') {
          const userData = { email, name: '테스트 유저' };
          setIsLoggedIn(true);
          setUser(userData);
          resolve(userData);
        } else {
          reject(new Error('이메일 또는 비밀번호가 올바르지 않습니다.'));
        }
      }, 1000);
    });
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
  };

  const signup = async (userData) => {
    console.log('Signup attempt with:', userData);
    return login(userData);
  };

  const value = { isLoggedIn, user, login, logout, signup };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

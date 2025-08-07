/**
 * src/context/AuthContext.jsx
 * --------------------------------
 * React의 Context API를 사용하여 앱 전체의 인증(Authentication) 상태를 관리하는 파일입니다.
 * 역할:
 * 1. 로그인 여부(isLoggedIn), 사용자 정보(user)를 전역 상태로 저장합니다.
 * 2. login, logout, signup 등 인증 관련 함수를 정의하고 제공합니다.
 * 3. `AuthProvider` 컴포넌트로 하위 컴포넌트들을 감싸, 어디서든 인증 상태에 접근할 수 있게 합니다.
 * 4. `useAuth` 커스텀 훅을 제공하여 Context 사용을 더 쉽게 만듭니다.
 */

import React, { createContext, useState, useContext } from 'react';

// 1. 새로운 Context를 생성합니다. 외부에서 이 데이터를 바로 사용하지는 않습니다.
const AuthContext = createContext(null);

// 2. AuthProvider 컴포넌트: 이 컴포넌트가 감싸는 모든 자식들은 value 객체에 접근할 수 있습니다.
export const AuthProvider = ({ children }) => {
  // 로그인 여부를 저장하는 상태
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // 로그인한 사용자 정보를 저장하는 상태
  const [user, setUser] = useState(null);

  // 로그인 함수 (현재는 실제 서버 통신 없이 시뮬레이션으로 동작)
  const login = async ({ email, password }) => {
    console.log('Login attempt with:', email, password);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email === 'test@test.com' && password === 'password') {
          const userData = { email, name: '테스트 유저' };
          setIsLoggedIn(true);
          setUser(userData);

          resolve(userData); // 성공 시 사용자 데이터와 함께 Promise 해결
        } else {
          reject(new Error('이메일 또는 비밀번호가 올바르지 않습니다.')); // 실패 시 에러 발생
        }
      }, 1000); // 1초 지연
    });
  };

  // 로그아웃 함수
  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
  };

  // 회원가입 함수
  const signup = async (userData) => {
    console.log('Signup attempt with:', userData);
    // 현재는 회원가입 성공 시 바로 로그인 처리
    return login(userData);
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
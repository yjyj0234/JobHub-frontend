import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

axios.defaults.baseURL = "http://localhost:8080";
axios.defaults.withCredentials = true; // 쿠키 자동 첨부

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthed, setIsAuthed] = useState(false);
  const [id, setId] = useState(null);
  const [user, setUser] = useState(null);

  // 로그인 (쿠키 기반: 바디에 token 없음)
  const login = async ({ email, password }) => {
    try {
      // 500 이상만 throw, 401/404는 여기서 직접 처리
      const res = await axios.post(
        "/auth/login",
        { email, password },
        { validateStatus: (s) => s < 500 }
      );

      if (res.status !== 200) {
        // 백엔드가 { message } 내려주면 우선 사용
        const serverMsg = res.data?.message;
        let msg = serverMsg;

        if (!msg) {
          msg =
            res.status === 404
              ? "가입되지 않은 이메일입니다."
              : res.status === 401
              ? "비밀번호가 올바르지 않습니다."
              : "로그인에 실패했습니다.";
        }
        throw new Error(msg);
      }

      const uid = res.data.id ?? res.data.userId;
      setId(uid);
      setUser({ id: uid, email: res.data.email, role: res.data.role });
      setIsAuthed(true);
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || "로그인에 실패했습니다.";
      throw new Error(msg);
    }
  };

  // 회원가입
  const signup = async (payload) => {
    let fd;

    if (payload instanceof FormData) {
      fd = payload;

      // 1) 타입 추출 (userType or accountType 모두 수용)
      const rawType = (fd.get("userType") ?? fd.get("accountType") ?? "")
        .toString()
        .trim();
      const type = rawType ? rawType.toUpperCase() : "";

      if (!type) {
        // 폴백: 회사 필드가 있으면 COMPANY, 아니면 USER
        const hasCompany =
          !!fd.get("businessRegistrationNumber") ||
          !!fd.get("businessCertificationFile");
        fd.set("userType", hasCompany ? "COMPANY" : "USER");
      } else {
        // 소문자로 왔으면 대문자로 교정
        fd.set("userType", type);
      }

      // name 채우기 (없으면 기본값)
      if (!fd.get("name")) {
        const t = (fd.get("userType") || "").toString().toUpperCase();
        if (t === "COMPANY" && fd.get("companyName")) {
          fd.set("name", fd.get("companyName"));
        } else {
          fd.set("name", "개인회원");
        }
      }
    } else {
      // 객체로 받은 경우: accountType 또는 userType 모두 수용
      const rawType = (payload.accountType ?? payload.userType ?? "")
        .toString()
        .trim();
      const type = rawType ? rawType.toUpperCase() : "USER"; // 기본 USER

      fd = new FormData();
      fd.append("email", payload.email);
      fd.append("password", payload.password);
      fd.append("userType", type);
      fd.append(
        "name",
        type === "COMPANY" ? payload.companyName ?? "" : "개인회원"
      );

      if (type === "COMPANY") {
        if (payload.businessRegistrationNumber)
          fd.append(
            "businessRegistrationNumber",
            payload.businessRegistrationNumber
          );
        if (payload.businessCertificationFile)
          fd.append(
            "businessCertificationFile",
            payload.businessCertificationFile
          );
      }
    }

    // 디버그
    console.group("[register] formData (final)");
    for (const [k, v] of fd.entries()) console.log(k, v);
    console.groupEnd();

    await axios.post("/auth/register", fd); // 헤더 지정 X

    return login({ email: fd.get("email"), password: fd.get("password") });
  };
  const logout = async () => {
    try {
      await axios.post("/auth/logout");
    } catch {}
    setIsAuthed(false);
    setId(null);
    setUser(null);
  };
  // 새로고침 시 로그인 상태 복원 (쿠키만 있으면 통과)
  useEffect(() => {
    const hasMarker = document.cookie
      .split("; ")
      .some((c) => c.startsWith("JWT_MARK="));
    if (!hasMarker) {
      // ✅ 마커 없으면 /auth/me 안 보냄
      setIsAuthed(false);
      setId(null);
      setUser(null);
      return;
    }
    (async () => {
      const res = await axios.get("/auth/me", {
        validateStatus: (s) => s === 200 || s === 401,
      });
      if (res.status === 200) {
        setId(res.data.id);
        setUser((p) => ({ ...(p ?? {}), id: res.data.id }));
        setIsAuthed(true);
      } else {
        setIsAuthed(false);
        setId(null);
        setUser(null);
      }
    })();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        logout,
        login,
        signup,
        isAuthed, // 네이밍 통일
        id,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};

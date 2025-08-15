import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

axios.defaults.baseURL = "http://localhost:8080";
axios.defaults.withCredentials = true; // JWT 쿠키 자동 첨부

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthed, setIsAuthed] = useState(false);
  const [id, setId] = useState(null);
  const [user, setUser] = useState(null);

  // 공통: 서버 응답을 우리 앱에서 쓰기 좋은 형태로 정규화
  const normalizeUser = (raw) => {
    if (!raw || typeof raw !== "object") return null;
    const roleRaw =
      raw.role ?? raw.userType ?? raw.user_type ?? raw.type ?? null;
    const role =
      typeof roleRaw === "string" ? roleRaw.toUpperCase() : roleRaw ?? null;

    return {
      id: raw.id ?? raw.userId ?? raw.uid ?? null,
      email: raw.email ?? raw.username ?? null,
      role, // "USER" | "COMPANY" | "ADMIN" 등 (대문자)
      // 필요하면 더 매핑: name, profile 등
      ...raw, // 원본 필드도 함께 보존
    };
  };

  // 로그인 (쿠키 기반: 바디에 토큰 없음)
  const login = async ({ email, password }) => {
    // 500 이상만 throw, 401/404는 직접 처리
    const res = await axios.post(
      "/auth/login",
      { email, password },
      { validateStatus: (s) => s < 500 }
    );

    if (res.status !== 200) {
      const serverMsg = res.data?.message;
      const msg =
        serverMsg ??
        (res.status === 404
          ? "가입되지 않은 이메일입니다."
          : res.status === 401
          ? "비밀번호가 올바르지 않습니다."
          : "로그인에 실패했습니다.");
      throw new Error(msg);
    }

    // ✅ 로그인 직후: 서버 세션(쿠키) 기준으로 확정
    let me;
    const meRes = await axios.get("/auth/me", {
      validateStatus: (s) => s === 200 || s === 401, // 던지지 말고 우리가 판단
    });

    if (meRes.status !== 200) {
      // 왜 실패했는지 유저에게 안내하기 좋게 에러 메시지 지정
      throw new Error(
        "세션 설정에 실패했습니다. 쿠키/브라우저 설정 또는 네트워크를 확인해주세요."
      );
    }

    me = normalizeUser(meRes.data);
    if (!me?.id) {
      throw new Error("사용자 정보를 불러오지 못했습니다.");
    }

    setId(me.id);
    setUser(me);
    setIsAuthed(true);
  };

  // 회원가입
  const signup = async (payload) => {
    let fd;

    if (payload instanceof FormData) {
      fd = payload;

      const rawType = (fd.get("userType") ?? fd.get("accountType") ?? "")
        .toString()
        .trim();
      const type = rawType ? rawType.toUpperCase() : "";

      if (!type) {
        const hasCompany =
          !!fd.get("businessRegistrationNumber") ||
          !!fd.get("businessCertificationFile");
        fd.set("userType", hasCompany ? "COMPANY" : "USER");
      } else {
        fd.set("userType", type);
      }

      if (!fd.get("name")) {
        const t = (fd.get("userType") || "").toString().toUpperCase();
        if (t === "COMPANY" && fd.get("companyName")) {
          fd.set("name", fd.get("companyName"));
        } else {
          fd.set("name", "개인회원");
        }
      }
    } else {
      const rawType = (payload.accountType ?? payload.userType ?? "")
        .toString()
        .trim();
      const type = rawType ? rawType.toUpperCase() : "USER";

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

    await axios.post("/auth/register", fd);
    return login({ email: fd.get("email"), password: fd.get("password") });
  };

  const logout = async () => {
    try {
      await axios.post("/auth/logout");
    } catch {
      // ignore
    }
    setIsAuthed(false);
    setId(null);
    setUser(null);
  };

  // ✅ 새로고침 시 무조건 /auth/me 호출해서 복원 (JWT_MARK 가드 제거)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await axios.get("/auth/me", {
          validateStatus: (s) => s === 200 || s === 401,
        });
        if (!alive) return;

        if (res.status === 200) {
          const me = normalizeUser(res.data);
          setId(me.id ?? null);
          setUser(me ?? null);
          setIsAuthed(!!me?.id);
        } else {
          setIsAuthed(false);
          setId(null);
          setUser(null);
        }
      } catch (e) {
        if (!alive) return;
        // 네트워크/기타 에러 → 비로그인 취급
        setIsAuthed(false);
        setId(null);
        setUser(null);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        logout,
        login,
        signup,
        isAuthed,
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

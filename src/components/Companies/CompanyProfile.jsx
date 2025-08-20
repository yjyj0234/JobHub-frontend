import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import {
  Building2,
  Globe,
  Users,
  Calendar,
  Award,
  FileText,
  Target,
  Heart,
} from "lucide-react";
import "../css/CompanyProfile.css";

// axios 인스턴스 (쿠키 포함)
const api = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true,
});

const CompanyProfile = () => {
  const navigate = useNavigate();
  const { user, isAuthed } = useAuth(); // 수정 안 함 (있으면 활용)
  const booted = useRef(false);

  // 로컬 가드 상태: 'checking' | 'ok' | 'denied'
  const [guard, setGuard] = useState("checking");

  const [loading, setLoading] = useState(false);
  const [industries, setIndustries] = useState([]);
  const [companySizes, setCompanySizes] = useState([]);

  const [formData, setFormData] = useState({
    // 모든 필드를 빈 문자열로 초기화 (undefined 방지)
    name: "",
    businessNumber: "",
    industryId: "",
    companySizeId: "",
    foundedYear: "",
    websiteUrl: "",
    logoUrl: "",
    description: "",
    mission: "",
    culture: "",
    benefits: [], // 배열은 빈 배열로
  });

  const [currentBenefit, setCurrentBenefit] = useState("");
  const [step, setStep] = useState(1);

  // ---- (1) 로컬 가드: /auth/me로 직접 확인 ----
  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      try {
        // 1) 우선 useAuth 값으로 빠른 통과 시도
        const roles = new Set([
          ...(Array.isArray(user?.authorities) ? user.authorities : []),
          ...(user?.role ? [user.role] : []),
          ...(user?.userType ? [user.userType] : []),
        ]);
        const isCompanyLocal =
          roles.has("COMPANY") ||
          roles.has("ROLE_COMPANY") ||
          roles.has("ADMIN") ||
          roles.has("COMPANY_HR");

        if (isAuthed && isCompanyLocal) {
          if (!cancelled) setGuard("ok");
          return;
        }

        // 2) 아니면 서버에 직접 질의 (/auth/me)
        const res = await api.get("/auth/me");
        const u = res.data;
        const roles2 = new Set([
          ...(Array.isArray(u?.authorities) ? u.authorities : []),
          ...(u?.role ? [u.role] : []),
          ...(u?.userType ? [u.userType] : []),
        ]);
        const isCompanyRemote =
          roles2.has("COMPANY") ||
          roles2.has("ROLE_COMPANY") ||
          roles2.has("ADMIN") ||
          roles2.has("COMPANY_HR");

        if (!cancelled) setGuard(isCompanyRemote ? "ok" : "denied");
      } catch {
        if (!cancelled) setGuard("denied");
      }
    };

    check();
    return () => {
      cancelled = true;
    };
    // 의존성 비움: 페이지 진입 시 한 번만
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- (2) 가드 통과 시 초기 데이터 한 번만 로드 ----
  useEffect(() => {
    if (guard !== "ok" || booted.current) return;
    booted.current = true;
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guard]);

  // 가드 실패 → 안내 후 홈으로
  useEffect(() => {
    if (guard !== "denied") return;
    alert("기업 회원만 접근 가능합니다");
    navigate("/", { replace: true });
  }, [guard, navigate]);

  const loadInitialData = async () => {
    try {
      // ✅ 백엔드 컨트롤러 경로와 일치시킴
      const [industriesRes, sizesRes, profileRes] = await Promise.all([
        api.get("/api/company/industries"),
        api.get("/api/company/company-sizes"),
        api.get("/api/company/profile").catch(() => null), // 없으면 무시
      ]);

      setIndustries(industriesRes.data || []);
      setCompanySizes(sizesRes.data || []);
      if (profileRes?.data) setFormData(profileRes.data);
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addBenefit = () => {
    if (!currentBenefit.trim()) return;
    setFormData((prev) => ({
      ...prev,
      benefits: [...prev.benefits, currentBenefit.trim()],
    }));
    setCurrentBenefit("");
  };

  const removeBenefit = (index) => {
    setFormData((prev) => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index),
    }));
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    try {
      const response = await api.post("/api/upload/logo", fd);
      setFormData((prev) => ({ ...prev, logoUrl: response.data.url }));
    } catch (error) {
      alert("로고 업로드 실패");
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put("/api/company/profile", formData);
      alert("기업 정보가 저장되었습니다");
      navigate("/");
    } catch (error) {
      const msg =
        error.response?.status === 403
          ? "권한이 없습니다. 기업 계정인지 확인해주세요."
          : error.response?.data?.message || error.message;
      alert("저장 실패: " + msg);
    } finally {
      setLoading(false);
    }
  };

  const validateStep1 = () => {
    const { name, businessNumber, industryId, companySizeId } = formData;
    if (!name || !businessNumber || !industryId || !companySizeId) {
      alert("필수 정보를 모두 입력해주세요");
      return false;
    }
    return true;
  };

  // 로컬 가드 중이면 스켈레톤/로딩
  if (guard === "checking") {
    return (
      <div className="company-profile-container">
        <h2 className="profile-title">
          <Building2 size={28} /> 기업 정보 로딩 중...
        </h2>
      </div>
    );
  }

  // ==== 기존 렌더링 그대로 ====
  return (
    <div className="company-profile-container">
      <h2 className="profile-title">
        <Building2 size={28} />
        기업 정보 {step === 1 ? "기본 설정" : "상세 설정"}
      </h2>

      <div className="step-indicator">
        <div className={`step ${step >= 1 ? "active" : ""}`}>1. 기본정보</div>
        <div className={`step ${step >= 2 ? "active" : ""}`}>2. 상세정보</div>
      </div>

      <form className="profile-form" onSubmit={(e) => e.preventDefault()}>
        {step === 1 ? (
          <fieldset className="form-section">
            <legend>기업 기본 정보</legend>

            <div className="form-group">
              <label htmlFor="name">
                <Building2 size={18} /> 기업명 *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="예: 주식회사 테크노바"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="businessNumber">
                <FileText size={18} /> 사업자등록번호 *
              </label>
              <input
                type="text"
                id="businessNumber"
                name="businessNumber"
                value={formData.businessNumber}
                onChange={handleInputChange}
                placeholder="000-00-00000"
                pattern="[0-9]{3}-[0-9]{2}-[0-9]{5}"
                required
              />
            </div>

            <div className="form-group-inline">
              <div className="form-group">
                <label htmlFor="industryId">업종 *</label>
                <select
                  id="industryId"
                  name="industryId"
                  value={formData.industryId}
                  onChange={handleInputChange}
                >
                  <option value="">선택하세요</option>
                  {industries.map((ind) => (
                    <option key={ind.id} value={ind.id}>
                      {ind.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="companySizeId">
                  <Users size={18} /> 기업 규모 *
                </label>
                <select
                  id="companySizeId"
                  name="companySizeId"
                  value={formData.companySizeId}
                  onChange={handleInputChange}
                >
                  <option value="">선택하세요</option>
                  {companySizes.map((size) => (
                    <option key={size.id} value={size.id}>
                      {size.label ?? size.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="foundedYear">
                <Calendar size={18} /> 설립년도
              </label>
              <input
                type="number"
                id="foundedYear"
                name="foundedYear"
                value={formData.foundedYear}
                onChange={handleInputChange}
                placeholder="예: 2015"
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>

            <div className="button-group">
              <button
                type="button"
                className="btn-next"
                onClick={() => validateStep1() && setStep(2)}
              >
                다음 단계로
              </button>
            </div>
          </fieldset>
        ) : (
          <fieldset className="form-section">
            <legend>기업 상세 정보</legend>

            <div className="form-group">
              <label htmlFor="logoUpload">기업 로고</label>
              <div className="logo-upload-area">
                {formData.logoUrl ? (
                  <img
                    src={formData.logoUrl}
                    alt="기업 로고"
                    className="logo-preview"
                  />
                ) : (
                  <div className="logo-placeholder">
                    <Building2 size={48} />
                    <span>로고 업로드</span>
                  </div>
                )}
                <input
                  type="file"
                  id="logoUpload"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="file-input"
                />
                <label htmlFor="logoUpload" className="file-label">
                  이미지 선택
                </label>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="websiteUrl">
                <Globe size={18} /> 웹사이트
              </label>
              <input
                type="url"
                id="websiteUrl"
                name="websiteUrl"
                value={formData.websiteUrl}
                onChange={handleInputChange}
                placeholder="https://www.example.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">기업 소개</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                placeholder="기업에 대한 간단한 소개를 작성해주세요"
              />
            </div>

            <div className="form-group">
              <label htmlFor="mission">
                <Target size={18} /> 미션 & 비전
              </label>
              <textarea
                id="mission"
                name="mission"
                value={formData.mission}
                onChange={handleInputChange}
                rows="3"
                placeholder="기업의 미션과 비전을 작성해주세요"
              />
            </div>

            <div className="form-group">
              <label htmlFor="culture">
                <Heart size={18} /> 기업 문화
              </label>
              <textarea
                id="culture"
                name="culture"
                value={formData.culture}
                onChange={handleInputChange}
                rows="3"
                placeholder="기업 문화와 분위기를 소개해주세요"
              />
            </div>

            <div className="form-group">
              <label>
                <Award size={18} /> 복지 & 혜택
              </label>
              <div className="benefits-input-wrapper">
                <input
                  type="text"
                  value={currentBenefit}
                  onChange={(e) => setCurrentBenefit(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addBenefit())
                  }
                  placeholder="복지 항목을 입력하고 추가 버튼을 누르세요"
                />
                <button
                  type="button"
                  onClick={addBenefit}
                  className="btn-add-benefit"
                >
                  추가
                </button>
              </div>
              <div className="benefits-list">
                {formData.benefits.map((benefit, index) => (
                  <div key={index} className="benefit-tag">
                    {benefit}
                    <button
                      type="button"
                      onClick={() => removeBenefit(index)}
                      className="btn-remove-tag"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="button-group">
              <button
                type="button"
                className="btn-prev"
                onClick={() => setStep(1)}
              >
                이전 단계
              </button>
              <button
                type="button"
                className="btn-save"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? "저장 중..." : "저장하기"}
              </button>
            </div>
          </fieldset>
        )}
      </form>
    </div>
  );
};

export default CompanyProfile;

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
  baseURL: "http://3.35.136.37:8080",
  withCredentials: true,
});

const CompanyProfile = () => {
  const navigate = useNavigate();
  const { user, isAuthed } = useAuth();
  const booted = useRef(false);

  // 로컬 가드 상태
  const [guard, setGuard] = useState("checking");
  const [loading, setLoading] = useState(false);
  const [industries, setIndustries] = useState([]);
  const [companySizes, setCompanySizes] = useState([]);

  // 초기값은 모두 빈 문자열로 설정
  const [formData, setFormData] = useState({
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
    benefits: [],
  });

  const [currentBenefit, setCurrentBenefit] = useState("");
  const [step, setStep] = useState(1);

  // ---- (1) 로컬 가드: /api/auth/me로 직접 확인 ----
  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      try {
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

        const res = await api.get("/api/auth/me");
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
  }, []);

  // ---- (2) 가드 통과 시 초기 데이터 한 번만 로드 ----
  useEffect(() => {
    if (guard !== "ok" || booted.current) return;
    booted.current = true;
    loadInitialData();
  }, [guard]);

  // 가드 실패 → 안내 후 홈으로
  useEffect(() => {
    if (guard !== "denied") return;
    alert("기업 회원만 접근 가능합니다");
    navigate("/", { replace: true });
  }, [guard, navigate]);

  const loadInitialData = async () => {
    try {
      const [industriesRes, sizesRes, profileRes] = await Promise.all([
        api.get("/api/company/industries"),
        api.get("/api/company/company-sizes"),
        api.get("/api/company/profile").catch(() => null),
      ]);

      setIndustries(industriesRes.data || []);
      setCompanySizes(sizesRes.data || []);

      // 서버 데이터가 있으면 안전하게 병합
      if (profileRes?.data) {
        const serverData = profileRes.data;
        setFormData({
          name: serverData.name || "",
          businessNumber: serverData.businessNumber || "",
          industryId: serverData.industryId
            ? String(serverData.industryId)
            : "",
          companySizeId: serverData.companySizeId
            ? String(serverData.companySizeId)
            : "",
          foundedYear: serverData.foundedYear
            ? String(serverData.foundedYear)
            : "",
          websiteUrl: serverData.websiteUrl || "",
          logoUrl: serverData.logoUrl || "",
          description: serverData.description || "",
          mission: serverData.mission || "",
          culture: serverData.culture || "",
          benefits: Array.isArray(serverData.benefits)
            ? serverData.benefits
            : [],
        });
      }
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
    fd.append("module", "companies");
    fd.append("public", "true");

    try {
      const response = await api.post("/api/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const logoUrl = response.data.viewerUrl || response.data.url || "";
      setFormData((prev) => ({ ...prev, logoUrl }));
    } catch (error) {
      console.error("로고 업로드 실패:", error);
      alert("로고 업로드 실패");
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const dataToSend = {
        ...formData,
        industryId:
          formData.industryId === "" ? null : Number(formData.industryId),
        companySizeId:
          formData.companySizeId === "" ? null : Number(formData.companySizeId),
        foundedYear:
          formData.foundedYear === "" ? null : Number(formData.foundedYear),
        benefits: Array.isArray(formData.benefits) ? formData.benefits : [],
      };

      console.log("전송할 데이터:", dataToSend);

      await api.put("/api/company/profile", dataToSend);
      alert("기업 정보가 저장되었습니다");
      navigate("/");
    } catch (error) {
      console.error("저장 실패 전체 에러:", error.response?.data);

      // ✅ 상세 에러 확인
      if (error.response?.data?.errors) {
        console.error("필드별 에러:", error.response.data.errors);
        const errorMessages = Object.entries(error.response.data.errors)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join("\n");
        alert(`검증 실패:\n${errorMessages}`);
      } else if (error.response?.data?.message) {
        // ✅ path 정보가 있으면 표시
        if (error.response?.data?.path) {
          console.error("에러 경로:", error.response.data.path);
        }
        alert(`저장 실패: ${error.response.data.message}`);
      } else {
        alert("저장에 실패했습니다");
      }
    } finally {
      setLoading(false);
    }
  };

  const validateStep1 = () => {
    const { name, businessNumber, industryId, companySizeId } = formData;
    if (
      !name.trim() ||
      !businessNumber.trim() ||
      !industryId ||
      !companySizeId
    ) {
      alert("필수 정보를 모두 입력해주세요");
      return false;
    }
    return true;
  };

  // 로딩 중
  if (guard === "checking") {
    return (
      <div className="company-profile-container">
        <h2 className="profile-title">
          <Building2 size={28} /> 기업 정보 로딩 중...
        </h2>
      </div>
    );
  }

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
                      {size.label || size.name || `규모 ${size.id}`}
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

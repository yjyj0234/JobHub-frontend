import React, { useState } from 'react';
import './Auth.css';
import { ChevronLeft, User, Building2, FileUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

function AuthPage({ onSuccess }) {
  const { login, signup } = useAuth();

  const [mode, setMode] = useState('login');
  const [accountType, setAccountType] = useState('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [businessRegistrationNumber, setBusinessRegistrationNumber] = useState('');
  const [businessCertificationFile, setBusinessCertificationFile] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const resetFormState = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setCompanyName('');
    setBusinessRegistrationNumber('');
    setBusinessCertificationFile(null);
    setError('');
    setIsLoading(false);
  };

  const showRegister = () => {
    setMode('selectType');
    resetFormState();
  };
  const showLogin = () => {
    setMode('login');
    resetFormState();
  };
  const goBackToSelection = () => setMode('selectType');

  const selectAccountType = (type) => {
    setAccountType(type);
    setMode('register');
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setBusinessCertificationFile(file);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'login') {
        await login({ email, password });
      } else if (mode === 'register') {
        if (password !== confirmPassword) {
          throw new Error('비밀번호가 일치하지 않습니다.');
        }
        const userData = { email, password, accountType };
        if (accountType === 'company') {
          if (!companyName) throw new Error('회사명을 입력해주세요.');
          if (!businessRegistrationNumber) throw new Error('사업자등록번호를 입력해주세요.');
          if (!businessCertificationFile) throw new Error('기업 인증 파일을 첨부해주세요.');
          userData.companyName = companyName;
          userData.businessRegistrationNumber = businessRegistrationNumber;
          userData.businessCertificationFile = businessCertificationFile;
        }
        await signup(userData);
      }
      onSuccess();
    } catch (err) {
      setError(err.message || '오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderLoginForm = () => (
    <>
      <h2 className="auth-title">로그인</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="email">이메일</label>
          <input type="email" id="email" placeholder="이메일을 입력하세요" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
        </div>
        <div className="input-group">
          <label htmlFor="password">비밀번호</label>
          <input type="password" id="password" placeholder="비밀번호를 입력하세요" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} />
        </div>
        <button type="submit" className="auth-button" disabled={isLoading}>
          {isLoading ? '로그인 중...' : '로그인'}
        </button>
      </form>
      <p className="auth-toggle">
        아직 계정이 없으신가요?
        <button type="button" onClick={showRegister} className="toggle-button" disabled={isLoading}>
          회원가입
        </button>
      </p>
    </>
  );

  const renderSelectTypeForm = () => (
    <>
      <h2 className="auth-title">회원가입</h2>
      <p className="auth-subtitle">가입할 계정 유형을 선택해주세요.</p>
      <div className="type-selection">
        <button onClick={() => selectAccountType('user')} className="type-button" disabled={isLoading}>개인 회원</button>
        <button onClick={() => selectAccountType('company')} className="type-button" disabled={isLoading}>기업 회원</button>
      </div>
      <p className="auth-toggle">
        이미 계정이 있으신가요?
        <button type="button" onClick={showLogin} className="toggle-button" disabled={isLoading}>
          로그인
        </button>
      </p>
    </>
  );

  const renderRegisterForm = () => (
    <>
      <div className="auth-header">
        <button onClick={goBackToSelection} className="back-button" aria-label="뒤로가기" disabled={isLoading}>
          <ChevronLeft size={24} />
        </button>
        <h2 className="auth-title">{accountType === 'user' ? '개인 회원가입' : '기업 회원가입'}</h2>
      </div>
      <form className="auth-form" onSubmit={handleSubmit}>
        {accountType === 'company' && (
          <div className="input-group">
            <label htmlFor="companyName">회사명</label>
            <input type="text" id="companyName" placeholder="회사명을 입력하세요" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} disabled={isLoading}/>
          </div>
        )}
        {accountType === 'company' && (
          <div className="input-group">
            <label htmlFor="businessRegistrationNumber">사업자등록번호</label>
            <input type="text" id="businessRegistrationNumber" placeholder="'-' 없이 숫자만 입력" required value={businessRegistrationNumber} onChange={(e) => setBusinessRegistrationNumber(e.target.value)} disabled={isLoading}/>
          </div>
        )}
        {accountType === 'company' && (
          <div className="input-group">
            <label htmlFor="businessCertificationFile">기업 인증 (사업자등록증)</label>
            <input type="file" id="businessCertificationFile" className="file-input" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" disabled={isLoading} required />
            <label htmlFor="businessCertificationFile" className="file-input-label">
              <FileUp size={16} />
              <span>{businessCertificationFile ? businessCertificationFile.name : '파일 선택'}</span>
            </label>
          </div>
        )}
        <div className="input-group">
          <label htmlFor="register-email">이메일</label>
          <input type="email" id="register-email" placeholder="이메일을 입력하세요" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
        </div>
        <div className="input-group">
          <label htmlFor="register-password">비밀번호</label>
          <input type="password" id="register-password" placeholder="비밀번호를 입력하세요" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} />
        </div>
        <div className="input-group">
          <label htmlFor="confirmPassword">비밀번호 확인</label>
          <input type="password" id="confirmPassword" placeholder="비밀번호를 다시 입력하세요" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isLoading} />
        </div>
        <button type="submit" className="auth-button" disabled={isLoading}>
          {isLoading ? '가입 중...' : '가입하기'}
        </button>
      </form>
    </>
  );

  const renderContent = () => {
    switch (mode) {
      case 'selectType':
        return renderSelectTypeForm();
      case 'register':
        return renderRegisterForm();
      default:
        return renderLoginForm();
    }
  };

  return (
    <div className="auth-content">
      {error && <p className="auth-error">{error}</p>}
      {renderContent()}
    </div>
  );
}

export default AuthPage;

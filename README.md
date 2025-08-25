<div align="center">
<img src="https://capsule-render.vercel.app/api?type=waving&color=7895CB&height=300&section=header&text=JobHub%20Project!&fontColor=ffffff&fontSize=90">
</div><br><br>

📝 프로젝트 소개 (Project Introduction)
<div align="center">
<img src="https://github.com/user-attachments/assets/e32f6c12-db32-4c7f-aea9-d61e9e92027e" alt="mainpage" width="800" height="350">
</div>

JobHub는 구직자와 기업을 위한 개인 맞춤형 채용 정보 플랫폼입니다. React와 Spring Boot 기반의 풀스택 웹 애플리케이션으로, 구직자에게는 동적인 이력서 관리와 맞춤 채용 정보를, 기업에게는 효율적인 공고 관리 기능을 제공합니다. 특히, WebSocket을 활용한 실시간 공지 시스템을 도입하여 모든 사용자에게 역동적인 최신 정보를 전달하는 것을 목표로 합니다.

<br><br>

🛠️ 사용된 기술 (Tech Stack)<br>
<img src="https://img.shields.io/badge/react-61DAFB?style=for-the-badge&logo=react&logoColor=black">
<img src="https://img.shields.io/badge/mysql-4479A1?style=for-the-badge&logo=mysql&logoColor=white"><br>
<img src="https://img.shields.io/badge/springboot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white">
<img src="https://img.shields.io/badge/css-1572B6?style=for-the-badge&logo=css3&logoColor=white">
<br>

✨ 주요 기능 및 제가 기여한 부분 (Key Features & My Contributions)
저는 JobHub 프로젝트의 사용자 경험(UX) 설계와 핵심 기능 개발에 중점적으로 참여하여, 프론트엔드의 주요 페이지들과 이를 뒷받침하는 백엔드 API 및 보안 설정을 직접 구현했습니다.

🎨 UI/UX 총괄 디자인 및 공통 레이아웃
<div align="center">
<img src="https://github.com/user-attachments/assets/27adfff7-c1d3-453d-89d9-0f359cd656e3" alt="homepage_design" width="800" height="350">
</div>

메인 페이지 및 로고 디자인: 사용자가 처음 마주하는 메인 페이지의 전체적인 UI/UX를 설계하고 구현했으며, 서비스의 정체성을 담은 로고를 직접 디자인했습니다.

글로벌 레이아웃 개발: 모든 페이지에 일관된 경험을 제공하는 Header와 Footer 공통 컴포넌트를 개발했습니다.

사용자 인증 UI: 서비스의 첫 관문인 로그인/회원가입 Modal의 UI와 상태 관리 로직을 구현하여 직관적인 인증 경험을 제공했습니다.

<br>

📄 이력서 작성 페이지 (Resume Editor Page)
<div align="center">
<img src="your-resume-editor-screenshot-url" alt="resume_editor" width="800" height="350">
</div>

동적 섹션 관리 UI/UX 구현: '경력', '학력', '기술 스택' 등 다양한 이력서 항목을 사용자가 자유롭게 추가하고 편집할 수 있는 동적인 UI를 구현했습니다.

컴포넌트 기반 설계: 각 이력서 항목 입력 폼을 재사용 가능한 개별 컴포넌트로 설계하여 코드의 유지보수성과 확장성을 높였습니다.

상태 관리 로직 개발: 복잡한 이력서 데이터 구조를 React의 useState를 활용하여 효율적으로 관리하고, 백엔드 API로 전송할 데이터를 정제하는 로직을 개발했습니다.

<br>

📢 공지사항 및 고객센터 (Notice & Customer Service)
<div align="center">
<img src="your-notice-page-screenshot-url" alt="notice_page" width="800" height="350">
</div>

실시간 공지 모달 (Frontend): WebSocket과 연동하여, 관리자가 새 공지를 등록하면 모든 접속자에게 실시간으로 팝업 모달이 표시되는 기능을 구현했습니다.

공지사항 & FAQ API (Backend): 공지사항과 FAQ의 CRUD 기능을 위한 RESTful API 엔드포인트를 AnnouncementController와 ServiceController에 직접 개발했습니다. Entity, DTO, Repository까지 데이터가 흐르는 전체 과정을 책임지고 구현했습니다.

WebSocket 로직 (Backend): Spring WebSocket을 사용하여 /topic/announcements 토픽으로 공지사항 메시지를 브로드캐스팅하는 실시간 통신 로직을 구현했습니다.

<br>

🔐 서비스 보안 설계 (Service Security)
<div align="center">
<img src="your-security-code-screenshot-url" alt="security_config" width="800" height="350">
</div>

Spring Security 기반 권한 관리: SecurityConfig.java 파일을 통해 서비스의 전체적인 보안 아키텍처를 설계했습니다.

엔드포인트별 접근 제어: 메인 페이지, 공지사항 조회 등 공개 API와 이력서 작성, 마이페이지 등 인증이 필요한 API의 접근 권한을 permitAll(), authenticated() 등의 설정을 통해 명확하게 분리하여 서비스의 안정성을 강화했습니다.

<br>

📑 정보 페이지 제작 (Information Pages)
<div align="center">
<img src="your-aboutus-screenshot-url" alt="aboutus_page" width="800" height="350">
</div>

회사소개, 이용약관, 개인정보처리방침 등 서비스의 신뢰도와 직결되는 필수 정보 페이지들을 직접 디자인하고 컨텐츠를 채워 구현했습니다.

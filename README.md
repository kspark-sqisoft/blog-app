# Blog App

Next.js 16 기반의 현대적인 블로그 애플리케이션입니다. 사용자 인증, 포스트 작성/수정/삭제, 태그 시스템, 무한 스크롤, 검색 기능 등을 제공합니다.

## 🚀 기술 스택

### Core
- **Next.js 16.1.6** - React 프레임워크 (App Router)
- **React 19.2.3** - UI 라이브러리
- **TypeScript** - 타입 안정성

### Database & ORM
- **PostgreSQL** - 관계형 데이터베이스
- **Prisma 7.3.0** - ORM 및 데이터베이스 관리

### Authentication
- **NextAuth.js v5 (beta)** - 인증 라이브러리
- **@auth/prisma-adapter** - Prisma 어댑터
- **bcryptjs** - 비밀번호 해싱

### UI & Styling
- **shadcn/ui** - 컴포넌트 라이브러리
- **Tailwind CSS 4** - 유틸리티 CSS 프레임워크
- **Lucide React** - 아이콘 라이브러리

### Data Fetching & State Management
- **TanStack Query (React Query) 5.90.20** - 서버 상태 관리
- **React Hook Form** - 폼 관리
- **Zod** - 스키마 검증

### Package Manager
- **Bun** - 빠른 패키지 매니저 및 런타임

## ✨ 주요 기능

- ✅ **사용자 인증**
  - 이메일/비밀번호 로그인
  - Google OAuth 로그인 (Gmail)
  - 회원가입
  - 세션 관리

- ✅ **포스트 관리**
  - 포스트 작성/수정/삭제
  - 본인 포스트만 수정/삭제 가능
  - 제목, 내용, 태그 지원
  - 작성일시 표시

- ✅ **포스트 목록**
  - 무한 스크롤 (5개씩 로드)
  - 매뉴얼/오토 모드 지원
  - 검색 기능 (제목, 내용, 태그)
  - 총 포스트 개수 표시
  - 스켈레톤 로딩 상태

- ✅ **포스트 상세 보기**
  - 작성자 정보 및 아바타
  - 태그 표시
  - 작성일시 표시

- ✅ **반응형 디자인**
  - 모바일/데스크톱 최적화
  - 현대적인 UI/UX

## 📁 프로젝트 구조

```
blog-app/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   └── auth/          # NextAuth.js API
│   ├── auth/              # 인증 페이지
│   │   ├── signin/       # 로그인
│   │   └── signup/       # 회원가입
│   ├── posts/            # 포스트 관련 페이지
│   │   ├── [id]/        # 포스트 상세/수정
│   │   ├── new/         # 포스트 작성
│   │   └── page.tsx     # 포스트 목록
│   ├── layout.tsx        # 루트 레이아웃
│   └── page.tsx          # 홈 페이지
│
├── components/            # 재사용 가능한 컴포넌트
│   ├── auth/            # 인증 관련 컴포넌트
│   └── ui/              # shadcn/ui 컴포넌트
│
├── lib/                  # 유틸리티 및 설정
│   ├── auth.ts          # NextAuth.js 설정
│   ├── prisma.ts        # Prisma Client
│   ├── session-provider.tsx
│   └── react-query-client-provider.tsx
│
├── module/               # 기능별 모듈
│   ├── auth/            # 인증 모듈
│   │   └── actions/    # Server Actions
│   └── posts/          # 포스트 모듈
│       ├── actions/    # Server Actions
│       └── components/ # 포스트 컴포넌트
│
├── prisma/              # Prisma 설정
│   ├── schema.prisma   # 데이터베이스 스키마
│   └── migrations/     # 마이그레이션 파일
│
├── doc/                 # 문서
│   ├── NEXTAUTH_SETUP_GUIDE.md
│   ├── GMAIL_OAUTH_SETUP.md
│   └── ...
│
└── types/               # TypeScript 타입 정의
```

## 🛠️ 설치 및 설정

### 1. 사전 요구사항

- **Bun** 최신 버전 설치
  ```bash
  # Bun 설치 (macOS/Linux)
  curl -fsSL https://bun.sh/install | bash
  
  # Windows
  powershell -c "irm bun.sh/install.ps1 | iex"
  ```

- **PostgreSQL** 데이터베이스 실행 중이어야 함

### 2. 프로젝트 클론 및 의존성 설치

```bash
# 저장소 클론 (또는 프로젝트 디렉토리로 이동)
cd blog-app

# 의존성 설치
bun install
```

### 3. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/blog_app?sslmode=prefer"

# NextAuth
AUTH_SECRET="your-secret-key-here"  # openssl rand -base64 32 로 생성
AUTH_URL="http://localhost:3000"

# Google OAuth (선택사항 - Gmail 로그인 사용 시)
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"
```

**AUTH_SECRET 생성 방법:**
```bash
openssl rand -base64 32
```

### 4. 데이터베이스 설정

```bash
# Prisma 마이그레이션 실행
bunx prisma migrate dev

# Prisma Client 생성
bunx prisma generate
```

### 5. 개발 서버 실행

```bash
bun run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

## 📝 주요 명령어

```bash
# 개발 서버 실행
bun run dev

# 프로덕션 빌드
bun run build

# 프로덕션 서버 실행
bun run start

# 린트 실행
bun run lint

# Prisma Studio 실행 (데이터베이스 GUI)
bunx prisma studio

# Prisma 마이그레이션 생성
bunx prisma migrate dev --name migration-name

# Prisma Client 재생성
bunx prisma generate
```

## 🔐 인증 설정

### 이메일/비밀번호 인증

기본적으로 이메일/비밀번호 인증이 활성화되어 있습니다. 회원가입 페이지(`/auth/signup`)에서 계정을 생성할 수 있습니다.

### Google OAuth 설정

Gmail 로그인을 사용하려면:

1. **Google Cloud Console 설정**
   - 자세한 설정 방법은 [`doc/GMAIL_OAUTH_SETUP.md`](./doc/GMAIL_OAUTH_SETUP.md) 참고

2. **환경 변수 설정**
   ```env
   AUTH_GOOGLE_ID="your-google-client-id"
   AUTH_GOOGLE_SECRET="your-google-client-secret"
   ```

3. **서버 재시작**
   ```bash
   bun run dev
   ```

## 📚 추가 문서

프로젝트의 상세한 설정 및 트러블슈팅 가이드는 `doc/` 폴더를 참고하세요:

- [`doc/NEXTAUTH_SETUP_GUIDE.md`](./doc/NEXTAUTH_SETUP_GUIDE.md) - NextAuth.js 설정 가이드
- [`doc/NEXTAUTH_SETUP_STEPS.md`](./doc/NEXTAUTH_SETUP_STEPS.md) - NextAuth.js 설정 단계
- [`doc/GMAIL_OAUTH_SETUP.md`](./doc/GMAIL_OAUTH_SETUP.md) - Gmail OAuth 설정 가이드
- [`doc/GOOGLE_OAUTH_TROUBLESHOOTING.md`](./doc/GOOGLE_OAUTH_TROUBLESHOOTING.md) - Google OAuth 트러블슈팅
- [`doc/WARNINGS_EXPLANATION.md`](./doc/WARNINGS_EXPLANATION.md) - 경고 메시지 설명
- [`doc/PROJECT_STRUCTURE_ANALYSIS.md`](./doc/PROJECT_STRUCTURE_ANALYSIS.md) - 프로젝트 구조 분석
- [`doc/REACT_QUERY_PATTERN_ANALYSIS.md`](./doc/REACT_QUERY_PATTERN_ANALYSIS.md) - React Query 패턴 분석

## 🎯 주요 기능 사용법

### 포스트 작성

1. 로그인 후 `/posts` 페이지에서 "새 글 작성" 버튼 클릭
2. 제목, 내용, 태그 입력
3. 태그는 쉼표로 구분하여 여러 개 추가 가능
4. "작성하기" 버튼 클릭

### 포스트 수정/삭제

1. 본인이 작성한 포스트의 상세 페이지에서 "수정" 또는 "삭제" 버튼 클릭
2. 수정 페이지에서 내용 변경 후 저장

### 포스트 검색

1. `/posts` 페이지 상단의 검색창에 키워드 입력
2. 제목, 내용, 태그에서 자동으로 검색

### 무한 스크롤

- **매뉴얼 모드**: "더보기" 버튼을 클릭하여 다음 5개 포스트 로드
- **오토 모드**: 스크롤 시 자동으로 다음 포스트 로드

## 🐛 트러블슈팅

### 데이터베이스 연결 오류

- PostgreSQL이 실행 중인지 확인
- `DATABASE_URL` 환경 변수가 올바른지 확인
- 데이터베이스가 생성되었는지 확인

### 인증 오류

- `AUTH_SECRET` 환경 변수가 설정되었는지 확인
- 서버를 재시작했는지 확인
- 자세한 내용은 [`doc/GOOGLE_OAUTH_TROUBLESHOOTING.md`](./doc/GOOGLE_OAUTH_TROUBLESHOOTING.md) 참고

### Prisma 오류

```bash
# Prisma Client 재생성
bunx prisma generate

# 마이그레이션 재실행
bunx prisma migrate dev
```

## 📄 라이선스

이 프로젝트는 학습 목적으로 제작되었습니다.

## 👨‍💻 개발자

프로젝트 관련 문의사항이 있으시면 이슈를 등록해주세요.

---

**참고**: 이 프로젝트는 Next.js 16과 최신 기술 스택을 학습하기 위한 예제 프로젝트입니다.

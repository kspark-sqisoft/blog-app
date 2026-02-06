# NextAuth.js 설정 가이드

## 단계별 설정 순서

### 1단계: 패키지 설치

```bash
npm install next-auth@beta
npm install @auth/prisma-adapter
```

또는

```bash
bun add next-auth@beta
bun add @auth/prisma-adapter
```

**참고:** Next.js 16은 NextAuth.js v5 (Auth.js)를 사용합니다.

---

### 2단계: Prisma 스키마 업데이트

`prisma/schema.prisma` 파일에 NextAuth에 필요한 모델을 추가합니다.

```prisma
model User {
  id            Int       @id @default(autoincrement())
  name          String
  email         String    @unique
  emailVerified DateTime?
  image         String?
  password      String?   // Credentials provider를 사용할 경우
  accounts      Account[]
  sessions      Session[]
  posts         Post[]
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Account {
  id                Int     @id @default(autoincrement())
  userId            Int
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
}

model Session {
  id           Int      @id @default(autoincrement())
  sessionToken String   @unique
  userId       Int
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

---

### 3단계: 환경 변수 설정

`.env` 또는 `.env.local` 파일에 다음을 추가:

```env
# NextAuth
AUTH_SECRET="your-secret-key-here" # 개발용: openssl rand -base64 32
AUTH_URL="http://localhost:3000"

# OAuth Providers (선택사항)
# GitHub
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Google
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

**AUTH_SECRET 생성 방법:**
```bash
openssl rand -base64 32
```

---

### 4단계: Auth 설정 파일 생성

`lib/auth.ts` 또는 `auth.ts` 파일 생성

---

### 5단계: API Route Handler 생성

`app/api/auth/[...nextauth]/route.ts` 파일 생성

---

### 6단계: Session Provider 설정

`app/layout.tsx`에 SessionProvider 추가

---

### 7단계: 미들웨어 설정

`middleware.ts` 파일 생성

---

### 8단계: 로그인/로그아웃 컴포넌트 생성

로그인 폼 및 로그아웃 버튼 컴포넌트 생성

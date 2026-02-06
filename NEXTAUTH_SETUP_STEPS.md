# NextAuth.js 설정 완료 가이드

## ✅ 완료된 단계

### 1. 패키지 설치 필요
```bash
npm install next-auth@beta @auth/prisma-adapter bcryptjs
npm install -D @types/bcryptjs
```

또는

```bash
bun add next-auth@beta @auth/prisma-adapter bcryptjs
bun add -d @types/bcryptjs
```

### 2. ✅ Prisma 스키마 업데이트 완료
- `prisma/schema.prisma`에 Account, Session, VerificationToken 모델 추가
- User 모델에 NextAuth 필드 추가

### 3. 환경 변수 설정 필요
`.env` 또는 `.env.local` 파일에 추가:

```env
# NextAuth
AUTH_SECRET="your-secret-key-here"
AUTH_URL="http://localhost:3000"
```

**AUTH_SECRET 생성:**
```bash
openssl rand -base64 32
```

### 4. ✅ Auth 설정 파일 생성 완료
- `auth.ts` - NextAuth 설정

### 5. ✅ API Route Handler 생성 완료
- `app/api/auth/[...nextauth]/route.ts`

### 6. ✅ Session Provider 설정 완료
- `lib/session-provider.tsx` 생성
- `app/layout.tsx`에 추가

### 7. ✅ 미들웨어 설정 완료
- `middleware.ts` - 보호된 라우트 처리

### 8. ✅ 로그인/로그아웃 컴포넌트 생성 완료
- `app/auth/signin/page.tsx` - 로그인 페이지
- `components/auth/auth-button.tsx` - 로그인/로그아웃 버튼

### 9. ✅ 타입 정의 완료
- `types/next-auth.d.ts` - TypeScript 타입 확장

---

## 다음 단계

### 1. 마이그레이션 실행
```bash
npx prisma migrate dev --name add-nextauth-models
```

또는

```bash
bunx prisma migrate dev --name add-nextauth-models
```

### 2. Prisma Client 재생성
```bash
npx prisma generate
```

또는

```bash
bunx prisma generate
```

### 3. 테스트 유저 생성 (선택사항)
비밀번호 해싱을 위해 유틸리티 함수 생성:

```typescript
// lib/hash-password.ts
import { hash } from "bcryptjs";

export async function hashPassword(password: string): Promise<string> {
  return await hash(password, 12);
}
```

그리고 유저 생성 시:
```typescript
const hashedPassword = await hashPassword("your-password");
await prisma.user.create({
  data: {
    name: "Test User",
    email: "test@example.com",
    password: hashedPassword,
  },
});
```

---

## 사용 방법

### 서버 컴포넌트에서 세션 가져오기
```typescript
import { auth } from "@/auth";

export default async function Page() {
  const session = await auth();
  
  if (!session) {
    return <div>로그인이 필요합니다</div>;
  }
  
  return <div>안녕하세요, {session.user?.name}님!</div>;
}
```

### 클라이언트 컴포넌트에서 세션 가져오기
```typescript
"use client";
import { useSession } from "next-auth/react";

export default function Component() {
  const { data: session, status } = useSession();
  
  if (status === "loading") return <div>Loading...</div>;
  if (!session) return <div>로그인이 필요합니다</div>;
  
  return <div>안녕하세요, {session.user?.name}님!</div>;
}
```

### 보호된 라우트 설정
`middleware.ts`에서 이미 설정되어 있습니다. `/dashboard` 경로는 로그인이 필요합니다.

---

## 추가 설정 (선택사항)

### OAuth Provider 추가 (GitHub 예시)

1. `auth.ts`에 추가:
```typescript
import GitHub from "next-auth/providers/github";

providers: [
  GitHub({
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
  }),
  // ... 기존 Credentials provider
],
```

2. `.env`에 추가:
```env
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

---

## 문제 해결

### 에러: "PrismaAdapter is not a function"
- `@auth/prisma-adapter` 패키지가 설치되었는지 확인
- NextAuth v5 (beta)를 사용 중인지 확인

### 에러: "AUTH_SECRET is not set"
- `.env` 파일에 `AUTH_SECRET`이 설정되었는지 확인
- 서버 재시작

### 에러: "bcryptjs module not found"
- `bcryptjs` 패키지 설치 확인
- `@types/bcryptjs`도 설치 필요

---

## 완료!

이제 NextAuth.js가 설정되었습니다. 다음을 확인하세요:

1. ✅ 패키지 설치
2. ✅ 환경 변수 설정
3. ✅ 마이그레이션 실행
4. ✅ 테스트 유저 생성 (선택사항)
5. ✅ 로그인 페이지 테스트 (`/auth/signin`)

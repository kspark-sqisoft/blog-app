# Gmail OAuth 인증 설정 가이드

이 문서는 NextAuth.js에 Google OAuth(Gmail 로그인)를 추가하는 단계별 가이드를 제공합니다.

## 📋 사전 준비 사항

1. Google Cloud Console 계정
2. 프로젝트에 `.env.local` 파일 존재 (없으면 생성)

## 🔧 설정 단계

### 1단계: Google Cloud Console에서 OAuth 2.0 클라이언트 ID 생성

1. **Google Cloud Console 접속**
   - https://console.cloud.google.com/ 접속
   - Google 계정으로 로그인

2. **프로젝트 생성 또는 선택**
   - 상단의 프로젝트 선택 드롭다운 클릭
   - "새 프로젝트" 클릭하여 새 프로젝트 생성
   - 또는 기존 프로젝트 선택

3. **OAuth 동의 화면 구성**
   - 왼쪽 메뉴에서 "API 및 서비스" > "OAuth 동의 화면" 클릭
   - 사용자 유형 선택:
     - **외부**: 일반 사용자도 사용 가능 (테스트용)
     - **내부**: Google Workspace 조직 내부만 사용
   - 앱 정보 입력:
     - 앱 이름: "Blog App" (원하는 이름)
     - 사용자 지원 이메일: 본인 이메일
     - 개발자 연락처 정보: 본인 이메일
   - "저장 후 계속" 클릭

4. **스코프 설정** (선택 사항)
   - 기본 스코프로 진행 가능
   - "저장 후 계속" 클릭

5. **테스트 사용자 추가** (외부 사용자 유형인 경우)
   - 테스트 중에는 테스트 사용자만 로그인 가능
   - 본인 Gmail 주소 추가
   - "저장 후 계속" 클릭

6. **요약 확인**
   - 설정 확인 후 "대시보드로 돌아가기" 클릭

### 2단계: OAuth 클라이언트 ID 생성

1. **사용자 인증 정보 생성**
   - 왼쪽 메뉴에서 "API 및 서비스" > "사용자 인증 정보" 클릭
   - 상단의 "+ 사용자 인증 정보 만들기" 클릭
   - "OAuth 클라이언트 ID" 선택

2. **애플리케이션 유형 선택**
   - 애플리케이션 유형: **"웹 애플리케이션"** 선택
   - 이름: "Blog App Web Client" (원하는 이름)

3. **승인된 리디렉션 URI 추가**
   - 개발 환경:
     ```
     http://localhost:3000/api/auth/callback/google
     ```
   - 프로덕션 환경 (배포 후):
     ```
     https://yourdomain.com/api/auth/callback/google
     ```
   - "+ URI 추가" 버튼으로 각각 추가

4. **생성 완료**
   - "만들기" 클릭
   - **클라이언트 ID**와 **클라이언트 보안 비밀번호** 복사
   - ⚠️ 클라이언트 보안 비밀번호는 한 번만 표시되므로 반드시 복사!

### 3단계: 환경 변수 설정

1. **프로젝트 루트에 `.env.local` 파일 생성** (없는 경우)
   ```
   # 기존 환경 변수들...
   
   # Google OAuth 설정
   AUTH_GOOGLE_ID=your-google-client-id-here
   AUTH_GOOGLE_SECRET=your-google-client-secret-here
   ```

2. **환경 변수 값 입력**
   - `AUTH_GOOGLE_ID`: 2단계에서 복사한 클라이언트 ID
   - `AUTH_GOOGLE_SECRET`: 2단계에서 복사한 클라이언트 보안 비밀번호

3. **파일 저장**

### 4단계: 코드 확인

`lib/auth.ts` 파일에 Google Provider가 추가되어 있는지 확인:

```typescript
import Google from "next-auth/providers/google";

providers: [
    Google({
        clientId: process.env.AUTH_GOOGLE_ID,
        clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
        // ...
    }),
]
```

### 5단계: 개발 서버 재시작

환경 변수를 변경했으므로 개발 서버를 재시작해야 합니다:

```bash
# 개발 서버 중지 (Ctrl+C)
# 그 다음 다시 시작
bun run dev
```

## 🎨 UI에 Google 로그인 버튼 추가

로그인 페이지(`app/auth/signin/page.tsx`)에 Google 로그인 버튼을 추가할 수 있습니다:

```typescript
import { signIn } from "next-auth/react";

// Google 로그인 버튼
<Button
    type="button"
    variant="outline"
    onClick={() => signIn("google", { callbackUrl: "/" })}
>
    <svg>...</svg> Google로 로그인
</Button>
```

## ✅ 테스트

1. 개발 서버 실행: `bun run dev`
2. 로그인 페이지 접속: `http://localhost:3000/auth/signin`
3. "Google로 로그인" 버튼 클릭
4. Google 로그인 페이지로 리다이렉트되는지 확인
5. Google 계정 선택 및 권한 승인
6. 애플리케이션으로 돌아와서 로그인 완료 확인

## 🔍 문제 해결

### "redirect_uri_mismatch" 오류
- Google Cloud Console의 "승인된 리디렉션 URI"에 정확한 URL이 추가되었는지 확인
- 개발 환경: `http://localhost:3000/api/auth/callback/google`
- 프로덕션: `https://yourdomain.com/api/auth/callback/google`

### "access_denied" 오류
- OAuth 동의 화면에서 테스트 사용자로 본인 이메일이 추가되었는지 확인
- 앱이 "테스트 중" 상태인 경우 테스트 사용자만 로그인 가능

### 환경 변수 인식 안 됨
- `.env.local` 파일이 프로젝트 루트에 있는지 확인
- 파일명이 정확한지 확인 (`.env.local`, `.env` 아님)
- 개발 서버를 재시작했는지 확인

## 📚 참고 자료

- [NextAuth.js Google Provider 문서](https://next-auth.js.org/providers/google)
- [Google OAuth 2.0 문서](https://developers.google.com/identity/protocols/oauth2)
- [PrismaAdapter 문서](https://next-auth.js.org/adapters/prisma)

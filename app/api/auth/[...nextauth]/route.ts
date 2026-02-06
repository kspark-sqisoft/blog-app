// ============================================
// NextAuth API 라우트 핸들러
// ============================================
// 이 파일은 NextAuth의 모든 인증 관련 API 요청을 처리합니다.
// 
// 동작 방식:
// - [...nextauth]는 catch-all 라우트로, 모든 /api/auth/* 경로를 처리합니다.
// - 예: /api/auth/signin, /api/auth/callback/credentials, /api/auth/session 등
//
// 로그인 플로우에서의 역할:
// 1. 클라이언트에서 signIn("credentials", {...}) 호출
// 2. 내부적으로 POST /api/auth/callback/credentials 요청이 생성됨
// 3. 이 핸들러가 요청을 받아 auth.ts의 authorize 함수를 실행
// 4. 인증 성공 시 JWT 토큰 생성 및 세션 쿠키 설정
// 5. 응답 반환 (성공/실패)
//
// GET 요청: 세션 조회, CSRF 토큰 등
// POST 요청: 로그인, 로그아웃, 콜백 처리 등

import { handlers } from "@/lib/auth";

// NextAuth의 핸들러를 Next.js API 라우트 핸들러로 export
export const { GET, POST } = handlers;

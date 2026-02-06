// ============================================
// Next.js Middleware
// ============================================
// 이 미들웨어는 모든 요청이 서버에 도달하기 전에 실행됩니다.
// 주로 라우트 보호(인증 필요 페이지 접근 제어)에 사용됩니다.
//
// 중요: Next.js는 프로젝트 루트의 middleware.ts 파일을 자동으로 인식합니다.
//       이 파일은 반드시 루트 디렉토리에 위치해야 하며, 다른 위치로 옮길 수 없습니다.
//
// 참고: 현재 프로젝트에서는 실제로 보호된 라우트가 없지만,
//       향후 추가할 수 있도록 구조를 유지하고 있습니다.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const { nextUrl } = request;
    
    // ============================================
    // 세션 쿠키 확인
    // ============================================
    // NextAuth는 인증 성공 시 세션 쿠키를 설정합니다.
    // - 개발 환경: "authjs.session-token"
    // - 프로덕션 환경: "__Secure-authjs.session-token" (HTTPS만)
    //
    // Edge Runtime에서는 Prisma를 직접 사용할 수 없으므로,
    // 쿠키 존재 여부만 확인하여 간단한 보호를 구현합니다.
    const sessionToken = request.cookies.get("authjs.session-token") || 
                         request.cookies.get("__Secure-authjs.session-token");

    // 보호된 라우트 예시 (현재는 사용되지 않음)
    const isProtectedRoute = nextUrl.pathname.startsWith("/dashboard");
    
    // 보호된 라우트에 접근하려고 하는데 세션이 없는 경우
    if (isProtectedRoute && !sessionToken) {
        return NextResponse.redirect(new URL("/auth/signin", nextUrl));
    }

    return NextResponse.next();
}

// 미들웨어가 실행될 경로 패턴
// - API 라우트, Next.js 내부 파일, 정적 파일은 제외
export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

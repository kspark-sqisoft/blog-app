"use client";

// ============================================
// NextAuth 세션 프로바이더
// ============================================
// 이 컴포넌트는 NextAuth의 SessionProvider를 래핑하여
// 애플리케이션 전체에서 세션 정보에 접근할 수 있게 합니다.
//
// 역할:
// - 클라이언트 컴포넌트에서 useSession() 훅 사용 가능하게 함
// - 세션 상태를 React Context로 관리
// - 세션 자동 갱신 및 동기화
//
// 사용 위치: app/layout.tsx에서 전체 앱을 감싸고 있음

import { SessionProvider } from "next-auth/react";

export default function NextAuthSessionProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    return <SessionProvider>{children}</SessionProvider>;
}

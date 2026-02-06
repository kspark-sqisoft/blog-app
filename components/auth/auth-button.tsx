"use client";

// ============================================
// 인증 버튼 컴포넌트
// ============================================
// 이 컴포넌트는 현재 로그인 상태에 따라 다른 UI를 표시합니다.
//
// 동작:
// 1. useSession()으로 현재 세션 정보 조회
//    - 내부적으로 GET /api/auth/session 요청
//    - JWT 토큰을 디코딩하여 세션 정보 반환
// 2. 상태에 따른 UI 렌더링:
//    - loading: 세션 확인 중
//    - session 존재: 사용자 이름/이메일 + 로그아웃 버튼
//    - session 없음: 로그인 버튼

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, User } from "lucide-react";
import Link from "next/link";

export function AuthButton() {
    // ============================================
    // useSession() 훅
    // ============================================
    // 이 훅은 클라이언트에서 세션 정보를 가져옵니다.
    // 
    // 동작 방식:
    // 1. SessionProvider의 Context에서 세션 정보 조회
    // 2. 세션이 없거나 만료된 경우 /api/auth/session으로 요청
    // 3. 서버에서 JWT 토큰을 검증하고 세션 객체 반환
    // 4. 세션 정보를 React Context에 저장하여 재사용
    //
    // status 값:
    // - "loading": 세션 확인 중
    // - "authenticated": 로그인됨
    // - "unauthenticated": 로그인 안 됨
    const { data: session, status } = useSession();

    // 세션 확인 중: 로딩 상태 표시
    if (status === "loading") {
        return (
            <Button variant="ghost" size="sm" disabled>
                <User className="size-4" />
            </Button>
        );
    }

    // 로그인된 상태: 사용자 정보 + 로그아웃 버튼
    if (session) {
        return (
            <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground hidden sm:inline">
                    {session.user?.name || session.user?.email}
                </span>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="gap-2"
                >
                    <LogOut className="size-4" />
                    <span className="hidden sm:inline">로그아웃</span>
                </Button>
            </div>
        );
    }

    // 로그인 안 된 상태: 로그인 버튼
    return (
        <Button variant="ghost" size="sm" asChild className="gap-2">
            <Link href="/auth/signin">
                <LogIn className="size-4" />
                <span className="hidden sm:inline">로그인</span>
            </Link>
        </Button>
    );
}

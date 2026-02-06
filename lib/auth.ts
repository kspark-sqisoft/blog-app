import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import { compare } from "bcryptjs";
import type { NextAuthConfig } from "next-auth";

// ============================================
// NextAuth 설정 파일
// ============================================
// 이 파일은 NextAuth.js의 핵심 설정을 담고 있습니다.
// 로그인 프로세스의 서버 측 로직이 여기서 처리됩니다.

export const authConfig = {
    // Prisma Adapter: 데이터베이스와의 연결을 관리
    // (현재는 Credentials Provider를 사용하므로 실제로는 사용되지 않지만,
    //  향후 OAuth 등 다른 Provider 추가 시 필요)
    adapter: PrismaAdapter(prisma),
    
    providers: [
        // ============================================
        // Credentials Provider 설정
        // ============================================
        // 이메일/비밀번호 기반 인증을 처리합니다.
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            
            // ============================================
            // authorize 함수: 인증 로직의 핵심
            // ============================================
            // 이 함수는 클라이언트에서 signIn()이 호출될 때 실행됩니다.
            // 
            // 프로세스:
            // 1. 이메일과 비밀번호가 제공되었는지 확인
            // 2. 데이터베이스에서 이메일로 사용자 조회
            // 3. 사용자가 존재하고 비밀번호가 저장되어 있는지 확인
            // 4. bcryptjs의 compare()로 평문 비밀번호와 해시된 비밀번호 비교
            // 5. 인증 성공 시 사용자 정보 반환 (이 정보가 JWT에 포함됨)
            // 6. 인증 실패 시 null 반환 (자동으로 에러 페이지로 리다이렉트)
            async authorize(credentials) {
                // 입력값 검증
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                // 데이터베이스에서 사용자 조회
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string },
                });

                // 사용자가 존재하지 않거나 비밀번호가 없는 경우
                if (!user || !user.password) {
                    return null;
                }

                // 비밀번호 검증
                // compare()는 평문 비밀번호와 해시된 비밀번호를 안전하게 비교합니다.
                // bcrypt의 내부 알고리즘으로 타이밍 공격을 방지합니다.
                const isPasswordValid = await compare(
                    credentials.password as string,
                    user.password
                );

                if (!isPasswordValid) {
                    return null;
                }

                // 인증 성공: 사용자 정보 반환
                // 이 객체의 속성들이 JWT 토큰에 포함됩니다.
                return {
                    id: user.id.toString(),
                    email: user.email,
                    name: user.name,
                    image: user.image,
                };
            },
        }),
    ],
    
    // 커스텀 페이지 경로 설정
    pages: {
        signIn: "/auth/signin", // 로그인 페이지
        error: "/auth/error",   // 에러 페이지
    },
    
    // 세션 전략: JWT 사용
    // JWT는 서버 측 세션 저장소 없이도 작동하며,
    // 토큰 자체에 사용자 정보가 포함되어 있습니다.
    session: {
        strategy: "jwt",
    },
    
    // ============================================
    // Callbacks: JWT 및 세션 생성 시 실행되는 함수들
    // ============================================
    callbacks: {
        // ============================================
        // jwt callback: JWT 토큰 생성/갱신 시 실행
        // ============================================
        // authorize 함수에서 반환된 user 객체가 여기로 전달됩니다.
        // 이 함수에서 JWT 토큰에 추가 정보를 포함시킬 수 있습니다.
        async jwt({ token, user }) {
            // 첫 로그인 시 user 객체가 전달됨
            if (user) {
                token.id = user.id; // 사용자 ID를 토큰에 추가
            }
            return token;
        },
        
        // ============================================
        // session callback: 세션 객체 생성 시 실행
        // ============================================
        // 클라이언트에서 useSession()을 호출할 때 실행됩니다.
        // JWT 토큰의 정보를 세션 객체로 변환합니다.
        async session({ session, token }) {
            if (session.user) {
                // JWT 토큰에서 사용자 ID를 세션에 추가
                session.user.id = token.id as string;
            }
            return session;
        },
    },
} satisfies NextAuthConfig;

// NextAuth 인스턴스 생성 및 export
// handlers: API 라우트에서 사용할 GET/POST 핸들러
// auth: 서버 컴포넌트에서 세션을 가져올 때 사용
// signIn, signOut: 서버 액션에서 사용 가능
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

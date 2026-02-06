import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
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
        // Google OAuth Provider 설정
        // ============================================
        // Gmail 계정으로 로그인할 수 있도록 Google OAuth를 추가합니다.
        //
        // 설정 전 준비 사항:
        // 1. Google Cloud Console (https://console.cloud.google.com/) 접속
        // 2. 새 프로젝트 생성 또는 기존 프로젝트 선택
        // 3. "API 및 서비스" > "사용자 인증 정보" 메뉴로 이동
        // 4. "사용자 인증 정보 만들기" > "OAuth 클라이언트 ID" 선택
        // 5. 애플리케이션 유형: "웹 애플리케이션" 선택
        // 6. 승인된 리디렉션 URI 추가:
        //    - 개발: http://localhost:3000/api/auth/callback/google
        //    - 프로덕션: https://yourdomain.com/api/auth/callback/google
        // 7. 클라이언트 ID와 클라이언트 보안 비밀번호 복사
        // 8. .env.local 파일에 다음 환경 변수 추가:
        //    AUTH_GOOGLE_ID=your-google-client-id
        //    AUTH_GOOGLE_SECRET=your-google-client-secret
        //
        // 동작 방식:
        // 1. 사용자가 "Google로 로그인" 버튼 클릭
        // 2. signIn("google") 호출
        // 3. Google 로그인 페이지로 리다이렉트
        // 4. 사용자가 Google 계정으로 로그인 및 권한 승인
        // 5. Google이 /api/auth/callback/google로 리다이렉트
        // 6. NextAuth가 Google에서 받은 정보로 사용자 생성/조회
        // 7. PrismaAdapter가 Account 테이블에 OAuth 정보 저장
        // 8. 세션 생성 및 로그인 완료
        //
        // PrismaAdapter 사용:
        // - OAuth Provider는 PrismaAdapter를 사용하여
        //   Account 테이블에 OAuth 계정 정보를 저장합니다.
        // - 같은 이메일로 Credentials와 Google 로그인을 모두 사용할 수 있습니다.
        //
        // ⚠️ 중요: 환경 변수가 설정되어 있을 때만 Google Provider 활성화
        // 환경 변수가 없으면 이 Provider는 무시됩니다.
        ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
            ? [
                  Google({
                      clientId: process.env.AUTH_GOOGLE_ID,
                      clientSecret: process.env.AUTH_GOOGLE_SECRET,
                      // 선택적: 추가 스코프 요청
                      // authorization: {
                      //     params: {
                      //         prompt: "consent",
                      //         access_type: "offline",
                      //         response_type: "code"
                      //     }
                      // }
                  }),
              ]
            : (() => {
                  // 개발 환경에서만 경고 메시지 출력
                  if (process.env.NODE_ENV === "development") {
                      console.warn(
                          "⚠️ Google OAuth Provider가 비활성화되었습니다.",
                          "환경 변수 AUTH_GOOGLE_ID와 AUTH_GOOGLE_SECRET이 설정되어 있는지 확인하세요."
                      );
                  }
                  return [];
              })()),

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
        // signIn callback: 로그인 시 실행
        // ============================================
        // OAuth 로그인 시 같은 이메일의 기존 계정과 연결하도록 처리합니다.
        // 이 함수가 true를 반환하면 로그인이 허용되고,
        // false를 반환하면 로그인이 거부됩니다.
        //
        // 문제 상황:
        // - 사용자가 이메일/비밀번호로 회원가입 (Credentials Provider)
        // - 나중에 같은 이메일로 Google 로그인 시도
        // - NextAuth는 기본적으로 다른 Provider의 계정을 자동 연결하지 않음
        // - OAuthAccountNotLinked 오류 발생
        //
        // 해결 방법:
        // - signIn callback에서 같은 이메일의 기존 계정을 확인
        // - 기존 계정이 있으면 true를 반환하여 자동 연결 허용
        async signIn({ user, account }) {
            // Credentials Provider는 이 callback을 거치지 않음
            if (account?.provider === "credentials") {
                return true;
            }
            
            // OAuth Provider (Google 등)인 경우
            if (account?.provider && user.email) {
                try {
                    // 같은 이메일의 기존 사용자 조회
                    const existingUser = await prisma.user.findUnique({
                        where: { email: user.email },
                        include: { accounts: true },
                    });
                    
                    // 기존 사용자가 있고, 이미 같은 Provider로 연결되어 있지 않은 경우
                    if (existingUser) {
                        // 같은 Provider의 계정이 이미 연결되어 있는지 확인
                        const hasProviderAccount = existingUser.accounts.some(
                            (acc) => acc.provider === account.provider
                        );
                        
                        // 같은 Provider로 이미 연결되어 있으면 로그인 허용
                        if (hasProviderAccount) {
                            return true;
                        }
                        
                        // 다른 Provider로 가입한 경우, 자동으로 계정 연결
                        // ⚠️ 보안 주의: 이메일 인증이 완료된 경우에만 안전합니다.
                        // 실제 프로덕션에서는 이메일 인증을 추가로 확인하는 것이 좋습니다.
                        return true; // 계정 자동 연결 허용
                    }
                    
                    // 새 사용자인 경우 로그인 허용
                    return true;
                } catch (error) {
                    console.error("signIn callback error:", error);
                    return false;
                }
            }
            
            return true;
        },
        
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

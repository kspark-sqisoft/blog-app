"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// ============================================
// 로그인 페이지 컴포넌트
// ============================================
// 이 페이지는 사용자가 이메일과 비밀번호를 입력하여 로그인하는 UI를 제공합니다.
// 로그인 프로세스는 다음과 같이 진행됩니다:
// 1. 사용자가 폼에 이메일과 비밀번호 입력
// 2. Zod 스키마로 클라이언트 측 유효성 검사
// 3. signIn() 함수 호출로 NextAuth 인증 프로세스 시작
// 4. 인증 성공/실패에 따른 처리

// Zod를 사용한 폼 유효성 검사 스키마
const signInSchema = z.object({
    email: z.string().email("올바른 이메일 형식이 아닙니다"),
    password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다"),
});

type SignInFormData = z.infer<typeof signInSchema>;

export default function SignInPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // React Hook Form을 사용한 폼 관리
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignInFormData>({
        resolver: zodResolver(signInSchema),
    });

    // ============================================
    // 로그인 제출 핸들러
    // ============================================
    // 이 함수는 사용자가 로그인 버튼을 클릭했을 때 실행됩니다.
    // 
    // 프로세스:
    // 1. signIn("credentials", {...}) 호출
    //    - NextAuth의 Credentials Provider를 사용
    //    - 이메일과 비밀번호를 서버로 전송
    //    - redirect: false로 설정하여 자동 리다이렉트 방지
    //
    // 2. 서버 측 처리 (auth.ts의 authorize 함수)
    //    - 데이터베이스에서 사용자 조회
    //    - 비밀번호 해시 비교 (bcryptjs)
    //    - 인증 성공 시 JWT 토큰 생성 및 세션 쿠키 설정
    //
    // 3. 클라이언트 응답 처리
    //    - 성공: 홈으로 리다이렉트 및 세션 새로고침
    //    - 실패: 에러 메시지 표시
    const onSubmit = async (data: SignInFormData) => {
        setIsLoading(true);
        try {
            // NextAuth의 signIn 함수 호출
            // 이 함수는 내부적으로 /api/auth/[...nextauth] 엔드포인트로 POST 요청을 보냅니다
            const result = await signIn("credentials", {
                email: data.email,
                password: data.password,
                redirect: false, // 자동 리다이렉트 비활성화 (수동 처리)
            });

            if (result?.error) {
                // 인증 실패: 이메일/비밀번호 불일치 또는 사용자 없음
                toast.error("로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.");
            } else {
                // 인증 성공: 세션 쿠키가 설정됨
                toast.success("로그인 성공!");
                router.push("/"); // 홈으로 리다이렉트
                router.refresh(); // 서버 컴포넌트의 세션 정보 새로고침
            }
        } catch {
            // 네트워크 오류 등 예외 상황 처리
            // (에러 상세 정보는 보안상 사용자에게 노출하지 않음)
            toast.error("로그인 중 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>로그인</CardTitle>
                    <CardDescription>이메일과 비밀번호를 입력해주세요</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium mb-1">
                                이메일
                            </label>
                            <input
                                id="email"
                                type="email"
                                {...register("email")}
                                className="w-full px-3 py-2 border rounded-md"
                                placeholder="email@example.com"
                                disabled={isLoading}
                            />
                            {errors.email && (
                                <p className="text-destructive text-sm mt-1">{errors.email.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium mb-1">
                                비밀번호
                            </label>
                            <input
                                id="password"
                                type="password"
                                {...register("password")}
                                className="w-full px-3 py-2 border rounded-md"
                                placeholder="비밀번호를 입력하세요"
                                disabled={isLoading}
                            />
                            {errors.password && (
                                <p className="text-destructive text-sm mt-1">{errors.password.message}</p>
                            )}
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    로그인 중...
                                </>
                            ) : (
                                "로그인"
                            )}
                        </Button>

                        {/* 구분선 */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">또는</span>
                            </div>
                        </div>

                        {/* Google 로그인 버튼 */}
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={async () => {
                                try {
                                    setIsLoading(true);
                                    // Google OAuth 로그인 시작
                                    // redirect: true로 설정하면 자동으로 Google 로그인 페이지로 리다이렉트됩니다
                                    await signIn("google", {
                                        callbackUrl: "/",
                                        redirect: true, // Google 로그인 페이지로 자동 리다이렉트
                                    });
                                } catch (error) {
                                    console.error("Google 로그인 오류:", error);
                                    toast.error("Google 로그인 중 오류가 발생했습니다. 환경 변수를 확인해주세요.");
                                    setIsLoading(false);
                                }
                            }}
                            disabled={isLoading}
                        >
                            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Google로 로그인
                        </Button>

                        <div className="text-center text-sm">
                            <span className="text-muted-foreground">계정이 없으신가요? </span>
                            <Link
                                href="/auth/signup"
                                className="text-primary hover:underline font-medium"
                            >
                                회원 가입
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

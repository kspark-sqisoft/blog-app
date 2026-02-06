"use client";

// ============================================
// 회원가입 페이지 컴포넌트
// ============================================
// 이 페이지는 사용자가 새 계정을 만드는 UI를 제공합니다.
// 회원가입 프로세스는 다음과 같이 진행됩니다:
// 1. 사용자가 이름, 이메일, 비밀번호, 비밀번호 확인 입력
// 2. Zod 스키마로 클라이언트 측 유효성 검사 (이메일 형식, 비밀번호 길이, 비밀번호 일치)
// 3. signup() 서버 액션 호출로 서버 측 처리 시작
// 4. 서버에서 이메일 중복 확인, 비밀번호 해싱, 데이터베이스 저장
// 5. 성공 시 로그인 페이지로 리다이렉트

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { signup } from "@/module/auth/actions/signup.action";

// Zod를 사용한 폼 유효성 검사 스키마
// - name: 최소 1자 이상
// - email: 올바른 이메일 형식
// - password: 최소 6자 이상
// - confirmPassword: password와 일치해야 함 (refine으로 커스텀 검증)
const signupSchema = z.object({
    name: z.string().min(1, "이름을 입력해주세요"),
    email: z.string().email("올바른 이메일 형식이 아닙니다"),
    password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다"),
    confirmPassword: z.string().min(6, "비밀번호 확인을 입력해주세요"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["confirmPassword"], // 에러가 발생한 필드 지정
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignUpPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // React Hook Form을 사용한 폼 관리
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignupFormData>({
        resolver: zodResolver(signupSchema),
    });

    // ============================================
    // 회원가입 제출 핸들러
    // ============================================
    // 이 함수는 사용자가 회원가입 버튼을 클릭했을 때 실행됩니다.
    //
    // 프로세스:
    // 1. signup() 서버 액션 호출
    //    - "use server" 지시어가 있는 서버 액션
    //    - 클라이언트에서 직접 호출 가능하지만 서버에서 실행됨
    //    - 이메일 중복 확인, 비밀번호 해싱, 데이터베이스 저장 수행
    //
    // 2. 결과 처리
    //    - 성공: 로그인 페이지로 리다이렉트
    //    - 실패: 에러 메시지 표시
    const onSubmit = async (data: SignupFormData) => {
        setIsLoading(true);
        try {
            // 서버 액션 호출 (서버에서 실행됨)
            const result = await signup(data.name, data.email, data.password);

            if (result.success) {
                // 회원가입 성공: 로그인 페이지로 이동
                toast.success(result.message);
                router.push("/auth/signin");
            } else {
                // 회원가입 실패: 에러 메시지 표시
                toast.error(result.error);
            }
        } catch {
            // 네트워크 오류 등 예외 상황 처리
            toast.error("회원 가입 중 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>회원 가입</CardTitle>
                    <CardDescription>새 계정을 만들어주세요</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium mb-1">
                                이름
                            </label>
                            <input
                                id="name"
                                type="text"
                                {...register("name")}
                                className="w-full px-3 py-2 border rounded-md"
                                placeholder="이름을 입력하세요"
                                disabled={isLoading}
                            />
                            {errors.name && (
                                <p className="text-destructive text-sm mt-1">{errors.name.message}</p>
                            )}
                        </div>

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
                                placeholder="비밀번호를 입력하세요 (최소 6자)"
                                disabled={isLoading}
                            />
                            {errors.password && (
                                <p className="text-destructive text-sm mt-1">{errors.password.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                                비밀번호 확인
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                {...register("confirmPassword")}
                                className="w-full px-3 py-2 border rounded-md"
                                placeholder="비밀번호를 다시 입력하세요"
                                disabled={isLoading}
                            />
                            {errors.confirmPassword && (
                                <p className="text-destructive text-sm mt-1">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    가입 중...
                                </>
                            ) : (
                                "회원 가입"
                            )}
                        </Button>

                        <div className="text-center text-sm">
                            <span className="text-muted-foreground">이미 계정이 있으신가요? </span>
                            <Link
                                href="/auth/signin"
                                className="text-primary hover:underline font-medium"
                            >
                                로그인
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

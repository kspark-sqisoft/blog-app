"use server";

// ============================================
// 회원가입 서버 액션
// ============================================
// 이 파일은 회원가입의 서버 측 로직을 처리합니다.
// "use server" 지시어로 인해 이 파일의 모든 함수는 서버에서만 실행됩니다.
//
// 회원가입 프로세스:
// 1. 입력값 유효성 검사 (Zod)
// 2. 이메일 중복 확인 (데이터베이스 조회)
// 3. 비밀번호 해싱 (bcryptjs)
// 4. 사용자 데이터베이스에 저장
// 5. 성공/실패 결과 반환

import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/hash-password";
import { z } from "zod";

// 서버 측 유효성 검사 스키마 (클라이언트와 동일한 검증 규칙)
const signupSchema = z.object({
    name: z.string().min(1, "이름을 입력해주세요"),
    email: z.string().email("올바른 이메일 형식이 아닙니다"),
    password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다"),
});

// 회원가입 결과 타입 정의
export type SignupResult =
    | { success: true; message: string }
    | { success: false; error: string };

// ============================================
// signup 함수: 회원가입 핵심 로직
// ============================================
// 이 함수는 클라이언트에서 호출되지만 서버에서 실행됩니다.
//
// 단계별 처리:
// 1. 입력값 검증: Zod 스키마로 데이터 유효성 확인
// 2. 이메일 중복 확인: 데이터베이스에서 동일한 이메일 조회
// 3. 비밀번호 해싱: 평문 비밀번호를 bcrypt로 해시화 (보안)
// 4. 사용자 생성: Prisma를 통해 데이터베이스에 저장
// 5. 에러 처리: 각 단계에서 발생할 수 있는 오류 처리
export const signup = async (
    name: string,
    email: string,
    password: string
): Promise<SignupResult> => {
    try {
        // ============================================
        // 1단계: 입력값 검증
        // ============================================
        // Zod를 사용하여 서버 측에서도 한 번 더 검증합니다.
        // 클라이언트 검증을 우회한 요청에도 대응할 수 있습니다.
        const validatedData = signupSchema.parse({ name, email, password });

        // ============================================
        // 2단계: 이메일 중복 확인
        // ============================================
        // 데이터베이스에서 동일한 이메일을 가진 사용자가 있는지 확인합니다.
        // Prisma의 findUnique는 unique 필드(email)로 빠르게 조회합니다.
        const existingUser = await prisma.user.findUnique({
            where: { email: validatedData.email },
        });

        if (existingUser) {
            return {
                success: false,
                error: "이미 사용 중인 이메일입니다.",
            };
        }

        // ============================================
        // 3단계: 비밀번호 해싱
        // ============================================
        // 평문 비밀번호를 bcrypt로 해시화합니다.
        // - 해시는 단방향 함수이므로 원본 비밀번호로 복원 불가능
        // - 같은 비밀번호라도 매번 다른 해시값 생성 (salt 사용)
        // - 로그인 시 compare()로 검증
        const hashedPassword = await hashPassword(validatedData.password);

        // ============================================
        // 4단계: 사용자 생성
        // ============================================
        // Prisma를 통해 데이터베이스에 새 사용자 레코드를 생성합니다.
        // - 해시된 비밀번호만 저장 (평문 비밀번호는 저장하지 않음)
        await prisma.user.create({
            data: {
                name: validatedData.name,
                email: validatedData.email,
                password: hashedPassword, // 해시된 비밀번호만 저장
            },
        });

        return {
            success: true,
            message: "회원 가입이 완료되었습니다.",
        };
    } catch (error) {
        // ============================================
        // 에러 처리
        // ============================================
        
        // Zod 검증 에러 처리
        if (error instanceof z.ZodError) {
            const firstError = error.issues[0];
            return {
                success: false,
                error: firstError?.message || "입력 정보를 확인해주세요.",
            };
        }

        // Prisma 에러 처리
        // P2002: Unique constraint violation (이메일 중복)
        if (error && typeof error === "object" && "code" in error) {
            if (error.code === "P2002") {
                return {
                    success: false,
                    error: "이미 사용 중인 이메일입니다.",
                };
            }
        }

        // 기타 예상치 못한 에러
        console.error("회원 가입 오류:", error);
        return {
            success: false,
            error: "회원 가입 중 오류가 발생했습니다.",
        };
    }
};

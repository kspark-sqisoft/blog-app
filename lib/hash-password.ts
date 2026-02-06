// ============================================
// 비밀번호 해싱 유틸리티
// ============================================
// 이 파일은 비밀번호를 안전하게 해시화하는 함수를 제공합니다.
//
// bcryptjs 사용 이유:
// - bcrypt는 비밀번호 해싱을 위해 특별히 설계된 알고리즘
// - 자동으로 salt(소금)를 생성하여 같은 비밀번호도 다른 해시값 생성
// - 해시 라운드 수(12)로 해싱 속도 조절 (보안과 성능의 균형)
//
// 보안 특징:
// - 단방향 함수: 해시에서 원본 비밀번호 복원 불가능
// - 타이밍 공격 방지: compare() 함수로 안전한 비교
// - 적응형 해싱: 시간이 지나면 라운드 수 증가 가능

import { hash } from "bcryptjs";

/**
 * 비밀번호를 해시화합니다.
 * 
 * @param password - 해시화할 평문 비밀번호
 * @returns 해시화된 비밀번호 (Promise<string>)
 * 
 * @example
 * const hashed = await hashPassword("myPassword123");
 * // 결과: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyY..."
 */
export async function hashPassword(password: string): Promise<string> {
    // bcrypt의 hash 함수 사용
    // - 첫 번째 인자: 해시화할 비밀번호
    // - 두 번째 인자: 해시 라운드 수 (12 = 2^12 = 4096번 반복)
    //   * 라운드 수가 높을수록 보안은 강하지만 해싱 시간도 증가
    //   * 12는 현재 권장되는 값 (보안과 성능의 균형)
    return await hash(password, 12);
}

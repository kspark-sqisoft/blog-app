# 경고 메시지 설명 및 해결 방법

## 1. Middleware 파일명 경고

### 경고 내용
```
⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.
```

### 설명
- Next.js 16에서 `middleware.ts` 파일명이 deprecated되었습니다
- 향후 버전에서는 `proxy.ts`로 변경될 예정입니다
- **현재는 정상 작동하며 기능상 문제 없습니다**

### 해결 방법 (선택사항)
현재는 무시해도 되지만, 나중에 업데이트하려면:

1. `middleware.ts` 파일을 `proxy.ts`로 이름 변경
2. 파일 내용은 동일하게 유지

**참고**: 아직 Next.js 16에서도 `middleware.ts`가 작동하므로 급하게 변경할 필요는 없습니다.

---

## 2. PostgreSQL SSL 경고

### 경고 내용
```
Warning: SECURITY WARNING: The SSL modes 'prefer', 'require', and 'verify-ca' are treated as aliases for 'verify-full'.
In the next major version (pg-connection-string v3.0.0 and pg v9.0.0), these modes will adopt standard libpq semantics, which have weaker security guarantees.
```

### 설명
- PostgreSQL 연결 시 SSL 모드에 대한 경고입니다
- 현재는 `prefer`, `require`, `verify-ca`가 모두 `verify-full`처럼 동작합니다
- 향후 버전에서는 표준 libpq 의미론을 따를 예정입니다
- **현재는 정상 작동하며 보안상 문제 없습니다**

### 해결 방법 (선택사항)

#### 개발 환경
- **무시해도 됩니다** - 개발 환경에서는 보통 문제 없습니다

#### 프로덕션 환경
`.env` 또는 `.env.production` 파일에서 `DATABASE_URL`을 명시적으로 설정:

```env
# 현재 (경고 발생)
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# 권장 (명시적 SSL 모드)
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=verify-full"

# 또는 libpq 호환성 모드 사용
DATABASE_URL="postgresql://user:password@host:5432/dbname?uselibpqcompat=true&sslmode=require"
```

### SSL 모드 옵션
- `disable`: SSL 사용 안 함 (개발 환경에서만)
- `prefer`: SSL 사용 시도, 실패하면 비SSL (개발 환경)
- `require`: SSL 필수 (프로덕션 권장)
- `verify-ca`: CA 인증서 검증
- `verify-full`: CA 인증서 + 호스트명 검증 (가장 안전, 프로덕션 권장)

---

## 결론

**두 경고 모두 현재는 무시해도 됩니다.**

- 앱이 정상적으로 작동합니다
- 보안상 문제 없습니다
- 기능상 문제 없습니다

프로덕션 배포 전에 PostgreSQL SSL 설정을 명시적으로 지정하는 것을 권장합니다.

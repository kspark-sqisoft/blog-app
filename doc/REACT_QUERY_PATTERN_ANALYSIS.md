# React Query Prefetching 패턴 분석

## 현재 구현 방식

### 서버 컴포넌트 (app/users/page.tsx)
```typescript
const UsersPage = async () => {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UserList />
    </HydrationBoundary>
  );
};
```

### 클라이언트 컴포넌트 (user-list.tsx)
```typescript
const UserList = () => {
  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });
  // ...
};
```

## 이 패턴의 장점 ✅

### 1. **SSR + 클라이언트 상태 관리의 조화**
- ✅ **초기 로딩 없음**: 서버에서 prefetch하여 즉시 데이터 표시
- ✅ **SEO 친화적**: 서버에서 데이터를 가져와 HTML에 포함
- ✅ **클라이언트 상호작용**: 이후 업데이트는 클라이언트에서 처리
- ✅ **캐싱**: React Query의 강력한 캐싱 활용

### 2. **사용자 경험 (UX)**
- ✅ **빠른 초기 렌더링**: 로딩 스피너 없이 즉시 콘텐츠 표시
- ✅ **Optimistic Updates**: 삭제/생성 시 즉시 UI 업데이트
- ✅ **자동 리페칭**: staleTime, cacheTime 설정으로 자동 관리

### 3. **개발자 경험 (DX)**
- ✅ **일관된 API**: 서버/클라이언트 모두 같은 쿼리 키 사용
- ✅ **타입 안전성**: TypeScript로 타입 추론 가능
- ✅ **디버깅 용이**: React Query DevTools 활용 가능

## 이 패턴의 단점 ⚠️

### 1. **복잡성 증가**
- ⚠️ 서버와 클라이언트 모두에서 QueryClient 관리 필요
- ⚠️ HydrationBoundary 설정 필요
- ⚠️ 초보자에게는 학습 곡선 존재

### 2. **성능 고려사항**
- ⚠️ **중복 요청 가능성**: 
  - 서버에서 prefetch
  - 클라이언트에서도 refetch 가능
  - 해결: `staleTime` 설정으로 조절

### 3. **메모리 사용**
- ⚠️ 서버에서 QueryClient 인스턴스 생성
- ⚠️ 클라이언트에서도 별도 인스턴스 필요

## 개선된 패턴 제안

### 옵션 1: 현재 패턴 유지 + 최적화 (추천) ✅

```typescript
// app/users/page.tsx
const UsersPage = async () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1분간 fresh 상태 유지
        gcTime: 5 * 60 * 1000, // 5분간 캐시 유지
      },
    },
  });
  
  await queryClient.prefetchQuery({
    queryKey: ["users"],
    queryFn: getUsers,
    staleTime: 60 * 1000, // 서버에서 prefetch한 데이터는 1분간 fresh
  });
  
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UserList />
    </HydrationBoundary>
  );
};
```

```typescript
// module/users/components/user-list.tsx
const UserList = () => {
  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
    staleTime: 60 * 1000, // 클라이언트에서도 같은 설정
    // initialData는 HydrationBoundary에서 자동으로 주입됨
  });
  // ...
};
```

**장점:**
- ✅ 중복 요청 방지
- ✅ 최적의 캐싱 전략
- ✅ 현재 구조 유지

### 옵션 2: Server Component에서 직접 데이터 전달 (간단한 경우)

```typescript
// app/users/page.tsx
const UsersPage = async () => {
  const users = await getUsers(); // 서버에서 직접 가져오기
  
  return <UserList initialUsers={users} />;
};
```

```typescript
// module/users/components/user-list.tsx
"use client";

const UserList = ({ initialUsers }: { initialUsers: User[] }) => {
  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
    initialData: initialUsers, // 초기 데이터로 설정
    staleTime: 60 * 1000,
  });
  // ...
};
```

**장점:**
- ✅ 더 간단한 구조
- ✅ QueryClient 생성 불필요
- ✅ HydrationBoundary 불필요

**단점:**
- ⚠️ 여러 쿼리를 prefetch할 때는 HydrationBoundary가 더 효율적

### 옵션 3: React Server Components만 사용 (정적 데이터)

```typescript
// app/users/page.tsx
const UsersPage = async () => {
  const users = await getUsers();
  
  return (
    <div>
      {users.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
};
```

**장점:**
- ✅ 가장 간단
- ✅ 서버에서만 처리

**단점:**
- ❌ 클라이언트 상호작용(삭제, 생성) 시 매번 서버로 요청
- ❌ Optimistic Updates 불가능
- ❌ 캐싱 제어 어려움

## 현재 패턴 평가

### 점수: **8.5/10** ✅

**현재 패턴은 매우 좋습니다!**

### 이유:
1. ✅ **SSR + 클라이언트 상태 관리의 최적 조합**
2. ✅ **Next.js App Router의 권장 패턴**
3. ✅ **확장 가능한 구조**
4. ✅ **사용자 경험 최적화**

### 개선 제안:

#### 1. QueryClient 설정 최적화
```typescript
// lib/react-query-client-provider.tsx
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1분
      gcTime: 5 * 60 * 1000, // 5분
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

#### 2. Prefetch 유틸리티 함수 생성
```typescript
// lib/prefetch-utils.ts
export async function prefetchUsers() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });
  return dehydrate(queryClient);
}
```

#### 3. 쿼리 키 상수화
```typescript
// module/users/constants/query-keys.ts
export const userQueryKeys = {
  all: ["users"] as const,
  lists: () => [...userQueryKeys.all, "list"] as const,
  list: (filters: string) => [...userQueryKeys.lists(), { filters }] as const,
  details: () => [...userQueryKeys.all, "detail"] as const,
  detail: (id: number) => [...userQueryKeys.details(), id] as const,
};
```

## 결론

### ✅ 현재 패턴은 **현대적이고 권장되는 방식**입니다!

**특히 좋은 점:**
- SSR과 클라이언트 상태 관리의 조화
- 초기 로딩 없이 빠른 UX
- Optimistic Updates 가능
- 확장 가능한 구조

**개선할 점:**
- QueryClient 설정 최적화
- 쿼리 키 상수화
- staleTime/gcTime 설정

이 패턴은 **Next.js 13+ App Router + React Query의 베스트 프랙티스**에 부합합니다! 🎉

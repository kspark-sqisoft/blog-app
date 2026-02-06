// ============================================
// 포스트 리스트 페이지
// ============================================
// 이 페이지는 React Query를 사용하는 이유:
// 1. PostList 컴포넌트가 클라이언트 컴포넌트이며 useQuery를 사용
// 2. 삭제, 새로고침 등의 인터랙션이 필요하여 캐싱과 상태 관리가 중요
// 3. prefetchQuery로 서버에서 미리 데이터를 가져와 초기 로딩 시간 단축
// 4. HydrationBoundary로 서버에서 가져온 데이터를 클라이언트에 전달
//
// 다른 페이지들(상세, 수정)은 React Query를 사용하지 않는 이유:
// - 서버 컴포넌트에서 직접 데이터를 가져와 SSR로 렌더링
// - 단순 조회만 필요하고 실시간 업데이트나 캐싱이 크게 필요하지 않음
// - 하지만 필요하다면 동일한 패턴으로 적용 가능

import { Suspense } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Plus } from "lucide-react";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getPosts } from "@/module/posts/actions/post.action";

// ============================================
// 동적 import로 PostList 컴포넌트 로드
// ============================================
// 서버 컴포넌트에서는 ssr: false를 사용할 수 없으므로
// ssr: true로 유지하고, PostList 내부의 isPending 상태로
// 클라이언트 사이드 네비게이션 시 스켈레톤을 표시합니다.
const PostList = dynamic(() => import("@/module/posts/components/post-list"), {
  ssr: true, // 서버 사이드 렌더링 유지
});

export default async function PostsPage() {
  // ============================================
  // React Query Prefetch
  // ============================================
  // 서버에서 데이터를 미리 가져와서 클라이언트에 전달합니다.
  // 이렇게 하면:
  // - 초기 로딩 시간 단축 (서버에서 이미 데이터 준비됨)
  // - 클라이언트에서 useQuery가 즉시 캐시된 데이터 사용
  // - SEO에도 유리 (서버에서 렌더링된 HTML)
  // 
  // 참고: prefetchQuery를 사용하면 서버 사이드 렌더링 시
  // 데이터가 즉시 준비되어 스켈레톤이 보이지 않을 수 있습니다.
  // 하지만 클라이언트 사이드 네비게이션 시에는 PostList의
  // isPending 상태로 스켈레톤이 표시됩니다.
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["posts"],
    queryFn: getPosts,
  });

  const session = await auth();

  return (
    // ============================================
    // HydrationBoundary
    // ============================================
    // 서버에서 prefetch한 데이터를 클라이언트의 React Query 캐시에 주입합니다.
    // PostList 컴포넌트의 useQuery가 이 캐시된 데이터를 즉시 사용할 수 있습니다.
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              블로그 포스트
            </h1>
            <p className="text-muted-foreground text-lg">최신 포스트를 확인하세요</p>
          </div>
          {session && (
            <Button asChild size="lg" className="shadow-md hover:shadow-lg transition-shadow">
              <Link href="/posts/new">
                <Plus className="mr-2 h-4 w-4" />
                새 글 작성
              </Link>
            </Button>
          )}
        </div>

        {/* ============================================ */}
        {/* Suspense를 사용하여 클라이언트 네비게이션 시 스켈레톤 표시 */}
        {/* ============================================ */}
        {/* 클라이언트 사이드 네비게이션(로고 클릭 등) 시:
            - prefetchQuery가 서버에서 실행되지만 클라이언트로 전달되는 동안 지연 발생 가능
            - Suspense fallback으로 스켈레톤을 표시하여 사용자 경험 개선
            - 서버 사이드 렌더링 시에는 prefetchQuery로 데이터가 준비되어 스켈레톤이 보이지 않을 수 있음 */}
        <Suspense
          fallback={
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border-2">
                  <CardHeader className="pb-4">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <Skeleton className="h-8 w-3/4" />
                          <div className="flex items-center gap-4">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                          <div className="flex flex-wrap gap-2 pt-2">
                            <Skeleton className="h-6 w-16" />
                            <Skeleton className="h-6 w-20" />
                            <Skeleton className="h-6 w-14" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          }
        >
          {/* PostList 컴포넌트는 내부적으로도 isPending 상태일 때 스켈레톤을 표시합니다 */}
          <PostList />
        </Suspense>
      </div>
    </HydrationBoundary>
  );
}

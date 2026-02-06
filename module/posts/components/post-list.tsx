"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Trash2, User, Clock, ChevronDown, Loader2, Search, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { getPostsPaginated, deletePost } from "../actions/post.action";

type PostWithUser = Awaited<ReturnType<typeof getPostsPaginated>>["items"][0];

type ScrollMode = "manual" | "auto";

const PostList = () => {
    const queryClient = useQueryClient();
    const { data: session } = useSession();
    const [scrollMode, setScrollMode] = useState<ScrollMode>("manual");
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
    const loadMoreRef = useRef<HTMLDivElement>(null);

    // ============================================
    // 검색어 디바운싱 (입력 후 500ms 대기)
    // ============================================
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // ============================================
    // useInfiniteQuery로 무한 스크롤 구현
    // ============================================
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isPending,
        error,
    } = useInfiniteQuery({
        queryKey: ["posts", "infinite", debouncedSearchQuery],
        queryFn: ({ pageParam }: { pageParam: number | undefined }) =>
            getPostsPaginated({
                limit: 5,
                cursor: pageParam,
                searchQuery: debouncedSearchQuery || undefined,
            }),
        initialPageParam: undefined as number | undefined,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        staleTime: 0,
        refetchOnMount: "always",
        gcTime: 0,
    });

    // 모든 페이지의 포스트를 하나의 배열로 합치기
    const posts = data?.pages.flatMap((page) => page.items) ?? [];

    // ============================================
    // 오토 모드: 스크롤 감지하여 자동 로드
    // ============================================
    useEffect(() => {
        if (scrollMode !== "auto" || !hasNextPage || isFetchingNextPage) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    fetchNextPage();
                }
            },
            { threshold: 0.1 }
        );

        const currentRef = loadMoreRef.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [scrollMode, hasNextPage, isFetchingNextPage, fetchNextPage]);

    const deleteMutation = useMutation({
        mutationFn: deletePost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["posts", "infinite"] });
            toast.success("포스트가 삭제되었습니다");
        },
        onError: (error) => {
            toast.error(error instanceof Error ? error.message : "포스트 삭제에 실패했습니다");
        },
    });

    const handleDelete = async (id: number) => {
        if (confirm("정말 이 포스트를 삭제하시겠습니까?")) {
            deleteMutation.mutate(id);
        }
    };

    if (isPending) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <Card key={i}>
                        <CardHeader className="pb-3 pt-4">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2 mt-2" />
                        </CardHeader>
                    </Card>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <Card>
                <CardContent className="py-6">
                    <p className="text-destructive">오류가 발생했습니다: {error.message}</p>
                </CardContent>
            </Card>
        );
    }

    if (!posts || posts.length === 0) {
        return (
            <Card>
                <CardContent className="py-6">
                    <p className="text-muted-foreground text-center">등록된 포스트가 없습니다</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {/* ============================================ */}
            {/* 검색 바 */}
            {/* ============================================ */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
                <Input
                    type="text"
                    placeholder="제목, 내용, 태그로 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-10 h-11 text-base"
                />
                {searchQuery && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                        onClick={() => setSearchQuery("")}
                    >
                        <X className="size-4" />
                    </Button>
                )}
            </div>

            {/* ============================================ */}
            {/* 모드 전환 버튼 및 포스트 개수 정보 */}
            {/* ============================================ */}
            <div className="flex items-center justify-between gap-4">
                <div className="text-sm text-muted-foreground">
                    {posts.length > 0 && (
                        <span>
                            {posts.length}개 표시 중
                            {debouncedSearchQuery && ` (검색: "${debouncedSearchQuery}")`}
                        </span>
                    )}
                    {posts.length === 0 && !isPending && debouncedSearchQuery && (
                        <span className="text-muted-foreground">
                            &quot;{debouncedSearchQuery}&quot;에 대한 검색 결과가 없습니다
                        </span>
                    )}
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={scrollMode === "manual" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setScrollMode("manual")}
                    >
                        매뉴얼
                    </Button>
                    <Button
                        variant={scrollMode === "auto" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setScrollMode("auto")}
                    >
                        오토
                    </Button>
                </div>
            </div>

            {/* ============================================ */}
            {/* 포스트 리스트 */}
            {/* ============================================ */}
            <div className="space-y-1">
                {posts.map((post: PostWithUser) => {
                    const isOwner = session?.user?.id === post.user.id.toString();

                    return (
                        <Card
                            key={post.id}
                            className="group hover:shadow-lg hover:border-primary/20 transition-all duration-300 cursor-pointer border-2"
                        >
                            <Link href={`/posts/${post.id}`}>
                                <CardHeader className="py-0 px-4 min-h-[75px]">
                                    <div className="space-y-0.5 h-full flex flex-col">
                                        <div className="flex items-start justify-between gap-4 flex-1">
                                            <div className="flex-1 space-y-1 flex flex-col">
                                                {/* 제목: 최대 2줄, 넘치면 말줄임표 */}
                                                <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-2 min-h-8">
                                                    {post.title}
                                                </CardTitle>

                                                {/* 작성자 및 날짜: 고정 높이 */}
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground h-3.5">
                                                    <div className="flex items-center gap-1">
                                                        <User className="size-3" />
                                                        <span className="font-medium">{post.user.name || post.user.email}</span>
                                                    </div>
                                                    {post.createdAt && (
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="size-3" />
                                                            <time>
                                                                {new Date(post.createdAt).toLocaleString("ko-KR", {
                                                                    year: "numeric",
                                                                    month: "long",
                                                                    day: "numeric",
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                })}
                                                            </time>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* 태그: 최대 1줄, 넘치면 말줄임표 */}
                                                <div className="min-h-[20px] flex items-center">
                                                    {post.tags && post.tags.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1.5 overflow-hidden">
                                                            {post.tags.map((postTag) => (
                                                                <Badge
                                                                    key={postTag.tagId}
                                                                    variant="secondary"
                                                                    className="hover:bg-primary/10 transition-colors text-xs py-0.5 px-1.5"
                                                                >
                                                                    {postTag.tag.name}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="h-5" />
                                                    )}
                                                </div>
                                            </div>
                                            {isOwner && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleDelete(post.id);
                                                    }}
                                                    disabled={deleteMutation.isPending}
                                                    className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                            </Link>
                        </Card>
                    );
                })}
            </div>

            {/* ============================================ */}
            {/* 더보기 버튼 (매뉴얼 모드) */}
            {/* ============================================ */}
            {scrollMode === "manual" && hasNextPage && (
                <div className="flex justify-center pt-4">
                    <Button
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                        variant="outline"
                        size="lg"
                        className="w-full sm:w-auto"
                    >
                        {isFetchingNextPage ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                로딩 중...
                            </>
                        ) : (
                            <>
                                <ChevronDown className="mr-2 h-4 w-4" />
                                더보기
                            </>
                        )}
                    </Button>
                </div>
            )}

            {/* ============================================ */}
            {/* 오토 모드: 스크롤 감지 영역 */}
            {/* ============================================ */}
            {scrollMode === "auto" && (
                <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
                    {isFetchingNextPage && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>로딩 중...</span>
                        </div>
                    )}
                    {!hasNextPage && posts.length > 0 && (
                        <p className="text-muted-foreground text-sm">모든 포스트를 불러왔습니다</p>
                    )}
                </div>
            )}

            {/* ============================================ */}
            {/* 매뉴얼 모드: 더 이상 없을 때 메시지 */}
            {/* ============================================ */}
            {scrollMode === "manual" && !hasNextPage && posts.length > 0 && (
                <div className="flex justify-center pt-4">
                    <p className="text-muted-foreground text-sm">모든 포스트를 불러왔습니다</p>
                </div>
            )}
        </div>
    );
};

export default PostList;

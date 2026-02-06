"use client";

import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Trash2, User, Clock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getPosts, deletePost } from "../actions/post.action";

type PostWithUser = Awaited<ReturnType<typeof getPosts>>[0];

const PostList = () => {
    const queryClient = useQueryClient();
    const { data: session } = useSession();

    const {
        data: posts,
        isPending,
        error,
    } = useQuery({
        queryKey: ["posts"],
        queryFn: getPosts,
        // 클라이언트 사이드 네비게이션 시에도 스켈레톤을 보여주기 위한 설정
        // staleTime을 0으로 설정하여 항상 stale 상태로 만들어 refetch 유도
        staleTime: 0,
        // refetchOnMount를 "always"로 설정하여 마운트 시 항상 refetch
        // 이렇게 하면 클라이언트 사이드 네비게이션 시 데이터를 다시 가져오는 동안
        // isPending이 true가 되어 스켈레톤이 표시됩니다
        refetchOnMount: "always",
        // gcTime을 0으로 설정하여 캐시를 즉시 삭제 (선택사항)
        // 이렇게 하면 항상 최신 데이터를 가져옵니다
        gcTime: 0,
    });

    const deleteMutation = useMutation({
        mutationFn: deletePost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["posts"] });
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
        <div className="space-y-3">
            {posts.map((post: PostWithUser) => {
                const isOwner = session?.user?.id === post.user.id.toString();

                return (
                    <Card
                        key={post.id}
                        className="group hover:shadow-lg hover:border-primary/20 transition-all duration-300 cursor-pointer border-2"
                    >
                        <Link href={`/posts/${post.id}`}>
                            <CardHeader className="pb-0.5 pt-0.5">
                                <div className="space-y-2">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 space-y-3">
                                            <CardTitle className="text-2xl font-bold group-hover:text-primary transition-colors line-clamp-2">
                                                {post.title}
                                            </CardTitle>

                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1.5">
                                                    <User className="size-4" />
                                                    <span className="font-medium">{post.user.name || post.user.email}</span>
                                                </div>
                                                {post.createdAt && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock className="size-4" />
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

                                            {post.tags && post.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-2 pt-2">
                                                    {post.tags.map((postTag) => (
                                                        <Badge
                                                            key={postTag.tagId}
                                                            variant="secondary"
                                                            className="hover:bg-primary/10 transition-colors"
                                                        >
                                                            {postTag.tag.name}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
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
    );
};

export default PostList;

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Edit, User, Clock } from "lucide-react";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPost } from "@/module/posts/actions/post.action";
import PostDeleteButton from "@/module/posts/components/post-delete-button";

type PostDetailPageProps = {
    params: Promise<{ id: string }>;
};

export default async function PostDetailPage({ params }: PostDetailPageProps) {
    const { id } = await params;
    const postId = parseInt(id);

    if (isNaN(postId)) {
        notFound();
    }

    let post;
    try {
        post = await getPost(postId);
    } catch {
        notFound();
    }

    const session = await auth();
    const isOwner = session?.user?.id === post.user.id.toString();

    return (
        <article className="space-y-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/posts">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                {isOwner && (
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={`/posts/${postId}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                수정
                            </Link>
                        </Button>
                        <PostDeleteButton postId={postId} />
                    </div>
                )}
            </div>

            <Card className="border-2 shadow-lg">
                <CardHeader className="space-y-3 pb-6">
                    <div className="space-y-1">
                        <CardTitle className="text-4xl font-bold tracking-tight leading-tight">
                            {post.title}
                        </CardTitle>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-2 border-t">
                            <div className="flex items-center gap-2">
                                <User className="size-4" />
                                <span className="font-medium">{post.user.name || post.user.email}</span>
                            </div>
                            {post.createdAt && (
                                <div className="flex items-center gap-2">
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
                    </div>

                    {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                            {post.tags.map((postTag) => (
                                <Badge
                                    key={postTag.tagId}
                                    variant="secondary"
                                    className="text-sm px-3 py-1"
                                >
                                    {postTag.tag.name}
                                </Badge>
                            ))}
                        </div>
                    )}
                </CardHeader>

                <CardContent className="pt-0">
                    <div className="prose prose-lg dark:prose-invert max-w-none">
                        <div className="whitespace-pre-wrap text-base leading-8 text-foreground">
                            {post.content}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </article>
    );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { getPost } from "@/module/posts/actions/post.action";
import PostEditForm from "@/module/posts/components/post-edit-form";

type PostEditPageProps = {
    params: Promise<{ id: string }>;
};

export default async function PostEditPage({ params }: PostEditPageProps) {
    const { id } = await params;
    const postId = parseInt(id);

    if (isNaN(postId)) {
        notFound();
    }

    const session = await auth();

    if (!session?.user?.id) {
        notFound();
    }

    let post;
    try {
        post = await getPost(postId);
    } catch {
        notFound();
    }

    // 본인의 포스트만 수정 가능
    if (session.user.id !== post.user.id.toString()) {
        notFound();
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href={`/posts/${postId}`}>
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold mb-2">포스트 수정</h1>
                    <p className="text-muted-foreground">포스트를 수정해주세요</p>
                </div>
            </div>

            <PostEditForm post={post} />
        </div>
    );
}

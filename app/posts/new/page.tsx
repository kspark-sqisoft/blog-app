"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import PostCreateForm from "@/module/posts/components/post-create-form";

export default function NewPostPage() {
    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/posts">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold mb-2">새 포스트 작성</h1>
                    <p className="text-muted-foreground">새로운 포스트를 작성해주세요</p>
                </div>
            </div>

            <PostCreateForm />
        </div>
    );
}
